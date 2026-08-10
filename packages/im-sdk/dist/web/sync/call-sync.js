import { requireWebIMSyncContext, } from './sync-context.js';
import { ensureCallSchema, queryCachedCalls, removeCachedCalls, replaceCachedCalls, } from './call-record-store.js';
/** 创建 SQLite-first 通话记录 facade。 */
export function createWebIMCallSync(dependencies) {
    return new WebIMCallSyncImpl(dependencies);
}
/** 通话记录 service 保证远端成功后再原子替换本地 cache。 */
class WebIMCallSyncImpl {
    // dependencies 保持唯一认证、Gateway、数据库与队列 owners。
    dependencies;
    /** 保存 runtime owners，不复制 token 或数据库连接。 */
    constructor(dependencies) {
        this.dependencies = dependencies;
    }
    /** 从当前账号 SQLite 分页读取通话记录。 */
    async listCached(options = {}) {
        // context 拒绝匿名或数据库尚未打开的读取。
        const { database } = requireWebIMSyncContext(this.dependencies, 'Call cache read');
        await ensureCallSchema(database);
        return queryCachedCalls(database, options);
    }
    /** 拉取完整 Gateway 分页并一次性替换当前账号 cache。 */
    sync() {
        return this.enqueueMutation(async () => {
            // context 在排队操作实际执行时绑定当前认证账号。
            const { database } = requireWebIMSyncContext(this.dependencies, 'Call list sync');
            // calls 只有在所有远端分页完整成功后才写入 SQLite。
            const calls = await fetchAllGatewayCalls(this.dependencies.gatewayClient);
            await ensureCallSchema(database);
            await replaceCachedCalls(database, calls);
            return { list: calls, total: calls.length };
        });
    }
    /** 服务端删除成功后再删除当前账号本地 cache。 */
    delete(callIDs) {
        // normalizedCallIDs 去重并拒绝空白 ID。
        const normalizedCallIDs = [...new Set(callIDs.map(id => id.trim()).filter(Boolean))];
        if (!normalizedCallIDs.length)
            return Promise.resolve();
        return this.enqueueMutation(async () => {
            // context 防止账号切换期间把记录删入错误数据库。
            const { database } = requireWebIMSyncContext(this.dependencies, 'Call record delete');
            await this.dependencies.gatewayClient.deleteCalls({ call_ids: normalizedCallIDs });
            await ensureCallSchema(database);
            await removeCachedCalls(database, normalizedCallIDs);
        });
    }
    /** 复用聚合 sync owner 注入的 FIFO，独立构造时直接执行。 */
    enqueueMutation(operation) {
        // mutationQueue 存在时与消息、会话写入保持同一业务顺序。
        const mutationQueue = this.dependencies.mutationQueue;
        return mutationQueue ? mutationQueue.enqueue(operation) : operation();
    }
}
/** 拉取 Gateway v2 通话列表的全部分页。 */
async function fetchAllGatewayCalls(gatewayClient) {
    // pageSize 对齐 RN 全量同步的服务端批量大小。
    const pageSize = 50;
    // calls 按 Gateway 页序保留，作为完整 cache snapshot。
    const calls = [];
    // total 仅由第一页服务端结果冻结。
    let total = 0;
    for (let page = 1; page <= 1000; page += 1) {
        // response 复用共享 SDK 的 v2 envelope 归一化。
        const response = await gatewayClient.fetchCallList({ page, page_size: pageSize });
        // pageCalls 忽略缺少稳定 call_id 的无效缓存记录。
        const pageCalls = (response.list ?? []).filter(call => Boolean(call.call_id?.trim()));
        if (page === 1)
            total = normalizeTotal(response.total, pageCalls.length);
        if (!pageCalls.length) {
            if (calls.length < total)
                throw new Error('Gateway call pagination is incomplete.');
            return calls;
        }
        calls.push(...pageCalls);
        if (calls.length >= total || pageCalls.length < pageSize)
            return calls;
    }
    throw new Error('Gateway call pagination exceeded the safety limit.');
}
/** 将服务端 total 收敛为非负整数。 */
function normalizeTotal(value, fallback) {
    return Number.isFinite(value) && Number(value) >= 0
        ? Math.trunc(Number(value))
        : fallback;
}
//# sourceMappingURL=call-sync.js.map