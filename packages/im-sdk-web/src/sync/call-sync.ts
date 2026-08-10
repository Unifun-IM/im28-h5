import type {
  GatewayCall,
  GatewayHTTPClient,
} from '@im28/im-sdk/web';

import {
  requireWebIMSyncContext,
  type WebIMSyncContextDependencies,
} from './sync-context.js';
import type {
  WebIMSyncMutationQueue,
  WebIMSyncMutationQueueDependencies,
} from './sync-mutation-queue.js';
import {
  ensureCallSchema,
  queryCachedCalls,
  removeCachedCalls,
  replaceCachedCalls,
} from './call-record-store.js';

/** 通话记录列表支持的服务端接听状态筛选。 */
export type WebIMCallAnswerStatus = 'all' | 'answered' | 'missed';

/** 通话记录缓存分页参数与 RN 列表筛选语义一致。 */
export interface WebIMCallListOptions {
  readonly answerStatus?: WebIMCallAnswerStatus;
  readonly keyword?: string;
  readonly limit?: number;
  readonly offset?: number;
}

/** 通话记录缓存分页结果同时返回当前筛选总数。 */
export interface WebIMCallListResult {
  readonly list: readonly GatewayCall[];
  readonly total: number;
}

/** 页面可消费的通话记录缓存、同步和删除能力。 */
export interface WebIMCallSync {
  listCached(options?: WebIMCallListOptions): Promise<WebIMCallListResult>;
  sync(): Promise<WebIMCallListResult>;
  delete(callIDs: readonly string[]): Promise<void>;
}

/** 通话记录能力复用 runtime 的 Gateway、账号库和共享写队列。 */
export interface WebIMCallSyncDependencies
  extends WebIMSyncContextDependencies,
    WebIMSyncMutationQueueDependencies {
  readonly gatewayClient: GatewayHTTPClient;
}

/** 创建 SQLite-first 通话记录 facade。 */
export function createWebIMCallSync(
  dependencies: WebIMCallSyncDependencies,
): WebIMCallSync {
  return new WebIMCallSyncImpl(dependencies);
}

/** 通话记录 service 保证远端成功后再原子替换本地 cache。 */
class WebIMCallSyncImpl implements WebIMCallSync {
  // dependencies 保持唯一认证、Gateway、数据库与队列 owners。
  private readonly dependencies: WebIMCallSyncDependencies;

  /** 保存 runtime owners，不复制 token 或数据库连接。 */
  constructor(dependencies: WebIMCallSyncDependencies) {
    this.dependencies = dependencies;
  }

  /** 从当前账号 SQLite 分页读取通话记录。 */
  async listCached(
    options: WebIMCallListOptions = {},
  ): Promise<WebIMCallListResult> {
    // context 拒绝匿名或数据库尚未打开的读取。
    const { database } = requireWebIMSyncContext(
      this.dependencies,
      'Call cache read',
    );
    await ensureCallSchema(database);
    return queryCachedCalls(database, options);
  }

  /** 拉取完整 Gateway 分页并一次性替换当前账号 cache。 */
  sync(): Promise<WebIMCallListResult> {
    return this.enqueueMutation(async () => {
      // context 在排队操作实际执行时绑定当前认证账号。
      const { database } = requireWebIMSyncContext(
        this.dependencies,
        'Call list sync',
      );
      // calls 只有在所有远端分页完整成功后才写入 SQLite。
      const calls = await fetchAllGatewayCalls(this.dependencies.gatewayClient);
      await ensureCallSchema(database);
      await replaceCachedCalls(database, calls);
      return { list: calls, total: calls.length };
    });
  }

  /** 服务端删除成功后再删除当前账号本地 cache。 */
  delete(callIDs: readonly string[]): Promise<void> {
    // normalizedCallIDs 去重并拒绝空白 ID。
    const normalizedCallIDs = [...new Set(callIDs.map(id => id.trim()).filter(Boolean))];
    if (!normalizedCallIDs.length) return Promise.resolve();
    return this.enqueueMutation(async () => {
      // context 防止账号切换期间把记录删入错误数据库。
      const { database } = requireWebIMSyncContext(
        this.dependencies,
        'Call record delete',
      );
      await this.dependencies.gatewayClient.deleteCalls({ call_ids: normalizedCallIDs });
      await ensureCallSchema(database);
      await removeCachedCalls(database, normalizedCallIDs);
    });
  }

  /** 复用聚合 sync owner 注入的 FIFO，独立构造时直接执行。 */
  private enqueueMutation<Result>(operation: () => Promise<Result>): Promise<Result> {
    // mutationQueue 存在时与消息、会话写入保持同一业务顺序。
    const mutationQueue: WebIMSyncMutationQueue | undefined =
      this.dependencies.mutationQueue;
    return mutationQueue ? mutationQueue.enqueue(operation) : operation();
  }
}

/** 拉取 Gateway v2 通话列表的全部分页。 */
async function fetchAllGatewayCalls(
  gatewayClient: GatewayHTTPClient,
): Promise<readonly GatewayCall[]> {
  // pageSize 对齐 RN 全量同步的服务端批量大小。
  const pageSize = 50;
  // calls 按 Gateway 页序保留，作为完整 cache snapshot。
  const calls: GatewayCall[] = [];
  // total 仅由第一页服务端结果冻结。
  let total = 0;
  for (let page = 1; page <= 1000; page += 1) {
    // response 复用共享 SDK 的 v2 envelope 归一化。
    const response = await gatewayClient.fetchCallList({ page, page_size: pageSize });
    // pageCalls 忽略缺少稳定 call_id 的无效缓存记录。
    const pageCalls = (response.list ?? []).filter(call => Boolean(call.call_id?.trim()));
    if (page === 1) total = normalizeTotal(response.total, pageCalls.length);
    if (!pageCalls.length) {
      if (calls.length < total) throw new Error('Gateway call pagination is incomplete.');
      return calls;
    }
    calls.push(...pageCalls);
    if (calls.length >= total || pageCalls.length < pageSize) return calls;
  }
  throw new Error('Gateway call pagination exceeded the safety limit.');
}

/** 将服务端 total 收敛为非负整数。 */
function normalizeTotal(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) && Number(value) >= 0
    ? Math.trunc(Number(value))
    : fallback;
}
