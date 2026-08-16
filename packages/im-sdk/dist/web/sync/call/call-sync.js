import { requireWebIMSyncContext, } from '../sync-context.js';
import { ensureCallSchema, queryCachedCall, queryCachedCalls, removeCachedCalls, replaceCachedCalls, saveCachedCall, saveCachedCalls, } from './call-record-store.js';
import { createIMCallControlSync, } from './call-control.js';
/** 创建 SQLite-first 通话记录 facade。 */
export function createIMCallRecordSync(dependencies) {
    return new WebIMCallSyncImpl(dependencies);
}
/** 兼容已发布的 Web 命名；实现与 createIMCallRecordSync 相同。 */
export const createWebIMCallSync = createIMCallRecordSync;
/** 通话记录 service 保证远端成功后再原子替换本地 cache。 */
class WebIMCallSyncImpl {
    // dependencies 保持唯一认证、Gateway、数据库与队列 owners。
    dependencies;
    /** controlSync 让记录 facade 与 RN/Web/Desktop 共用通话控制面。 */
    controlSync;
    /** 保存 runtime owners，不复制 token 或数据库连接。 */
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.controlSync = createIMCallControlSync(dependencies);
    }
    /** 发起通话委托中性控制 facade。 */
    start = options => this.controlSync.start(options);
    /** 接听通话委托中性控制 facade。 */
    answer = (callID, deviceID) => this.controlSync.answer(callID, deviceID);
    /** 拒绝通话委托中性控制 facade。 */
    reject = callID => this.controlSync.reject(callID);
    /** 取消通话委托中性控制 facade。 */
    cancel = callID => this.controlSync.cancel(callID);
    /** 挂断通话委托中性控制 facade。 */
    hangup = (callID, reason) => this.controlSync.hangup(callID, reason);
    /** 刷新媒体令牌委托中性控制 facade。 */
    refreshToken = callID => this.controlSync.refreshToken(callID);
    /** 查询当前账号待恢复通话，结果完全来自 Gateway。 */
    getPending() {
        return this.dependencies.gatewayClient.fetchPendingCall();
    }
    /** 从当前账号 SQLite 分页读取通话记录。 */
    async listCached(options = {}) {
        // context 拒绝匿名或数据库尚未打开的读取。
        const { database } = requireWebIMSyncContext(this.dependencies, 'Call cache read');
        await ensureCallSchema(database);
        return queryCachedCalls(database, options);
    }
    /** 直接读取 Gateway 单页列表，保留 RN 公开 service 的远端语义。 */
    listRemote(options = {}) {
        return this.dependencies.gatewayClient.fetchCallList({
            ...(options.answerStatus?.trim()
                ? { answer_status: options.answerStatus.trim() }
                : {}),
            ...(options.conversationID?.trim()
                ? { conversation_id: options.conversationID.trim() }
                : {}),
            ...(options.limit ? { limit: options.limit } : {}),
            ...(options.page ? { page: options.page } : {}),
            ...(options.page_size ? { page_size: options.page_size } : {}),
        });
    }
    /** 从当前账号 SQLite 读取单条详情缓存。 */
    async getCachedDetail(callID) {
        /** normalizedCallID 拒绝空白主键查询。 */
        const normalizedCallID = requireCallRecordID(callID);
        /** database 始终来自当前认证账号 lifecycle。 */
        const { database } = requireWebIMSyncContext(this.dependencies, 'Call detail cache read');
        await ensureCallSchema(database);
        return queryCachedCall(database, normalizedCallID);
    }
    /** 读取 Gateway 详情并用本地列表字段补缺后回写缓存。 */
    getDetail(callID) {
        /** normalizedCallID 同时约束缓存与 Gateway 请求。 */
        const normalizedCallID = requireCallRecordID(callID);
        return this.enqueueMutation(async () => {
            /** database 在队列实际执行时绑定当前认证账号 lifecycle。 */
            const { database } = requireWebIMSyncContext(this.dependencies, 'Call detail read');
            await ensureCallSchema(database);
            /** cachedCall 保留 v1 detail 可能缺失的方向和对端资料。 */
            const cachedCall = await queryCachedCall(database, normalizedCallID);
            /** detail 是 Gateway 权威详情结果。 */
            const detail = await this.dependencies.gatewayClient.fetchCallDetail({
                call_id: normalizedCallID,
            });
            if (!detail.call)
                return detail;
            /** mergedCall 只用缓存补服务端缺失字段，不覆盖远端事实。 */
            const mergedCall = mergeCallDetailWithCache(detail.call, cachedCall);
            await saveCachedCall(database, mergedCall);
            return { ...detail, call: mergedCall };
        });
    }
    /** 将远端已确认或平台投影的记录写入当前账号缓存。 */
    save(calls) {
        return this.enqueueMutation(async () => {
            /** context 在队列执行时绑定当前账号。 */
            const { database } = requireWebIMSyncContext(this.dependencies, 'Call record save');
            /** enrichedCalls 允许 RN 注入资料补齐，Web 默认保持服务端事实。 */
            const enrichedCalls = await this.enrichCalls(calls);
            await saveCachedCalls(database, enrichedCalls);
            return enrichedCalls;
        });
    }
    /** 将平台解析出的终结信令统一映射、补齐并落入缓存。 */
    convergeTerminalSignals(signals) {
        /** selfID 冻结为当前调用时的账号视角。 */
        const selfID = this.dependencies.getCurrentUserID()?.trim() ?? '';
        /** calls 只保留合法终结信令生成的稳定记录。 */
        const calls = signals
            .map(signal => mapIMCallTerminalSignalToRecord(signal, selfID))
            .filter((call) => Boolean(call));
        return this.save(calls);
    }
    /** 拉取完整 Gateway 分页并一次性替换当前账号 cache。 */
    sync() {
        return this.enqueueMutation(async () => {
            // context 在排队操作实际执行时绑定当前认证账号。
            const { database } = requireWebIMSyncContext(this.dependencies, 'Call list sync');
            // calls 只有在所有远端分页完整成功后才写入 SQLite。
            const calls = await fetchAllGatewayCalls(this.dependencies.gatewayClient);
            /** enrichedCalls 让平台只注入资料来源，不复制分页和写入状态机。 */
            const enrichedCalls = await this.enrichCalls(calls);
            await ensureCallSchema(database);
            await replaceCachedCalls(database, enrichedCalls);
            return { list: enrichedCalls, total: enrichedCalls.length };
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
    /** 运行可选平台资料补齐，并拒绝改变记录数量。 */
    async enrichCalls(calls) {
        if (!calls.length || !this.dependencies.enrichCalls)
            return calls;
        /** enrichedCalls 必须与输入逐条对应，避免平台 adapter 改写业务集合。 */
        const enrichedCalls = await this.dependencies.enrichCalls(calls);
        if (enrichedCalls.length !== calls.length) {
            throw new Error('Call record enrichment changed the record count.');
        }
        /** changedIdentity 防止平台 adapter 改写或重排业务主键。 */
        const changedIdentity = enrichedCalls.some((call, index) => call.call_id?.trim() !== calls[index]?.call_id?.trim());
        if (changedIdentity) {
            throw new Error('Call record enrichment changed the record identity.');
        }
        return enrichedCalls;
    }
}
/** 将平台无关终结信令映射为当前账号视角的缓存记录。 */
export function mapIMCallTerminalSignalToRecord(signal, selfID) {
    /** key 只接受会产生最终通话记录的事件。 */
    const key = signal.key.trim();
    /** callID 是缓存主键。 */
    const callID = signal.callID.trim();
    if (!callID || !isTerminalCallSignalKey(key))
        return null;
    /** endedAtMs 使用平台提供的消息时间，异常值回退当前时间。 */
    const endedAtMs = Number.isFinite(signal.endedAtMs) && signal.endedAtMs > 0
        ? signal.endedAtMs
        : Date.now();
    /** durationMs 用于反推已接通时间。 */
    const durationMs = Math.max(0, Math.round((signal.durationSeconds ?? 0) * 1000));
    /** answered 判断只依赖终结事件和明确状态。 */
    const answered = isAnsweredTerminalSignal(signal);
    /** answeredAt 在无时长的已接通事件中使用结束时间。 */
    const answeredAt = answered
        ? new Date(Math.max(0, endedAtMs - durationMs)).toISOString()
        : undefined;
    /** callerID 决定当前账号视角的通话方向。 */
    const callerID = signal.callerID?.trim() ?? '';
    /** direction 用于未接分类和 UI 方向。 */
    const direction = callerID && callerID === selfID.trim() ? 'outgoing' : 'incoming';
    /** answerStatus 优先使用服务端明确枚举。 */
    const answerStatus = normalizeCallAnswerStatus(signal.answerStatus) ||
        inferTerminalAnswerStatus(signal, direction, answeredAt);
    /** conversationID 提供对端解析和同日会话筛选。 */
    const conversationID = signal.conversationID?.trim() ?? '';
    /** peerUserID 从单聊 ID 或参与者中排除本人。 */
    const peerUserID = parseSingleConversationPeerID(conversationID) ||
        (callerID && callerID !== selfID.trim() ? callerID : '') ||
        ((signal.operatorID?.trim() ?? '') !== selfID.trim()
            ? signal.operatorID?.trim() ?? ''
            : '');
    return {
        call_id: callID,
        conversation_id: conversationID || (peerUserID ? `single_${peerUserID}` : ''),
        room_name: signal.roomName?.trim() ?? '',
        caller_id: callerID,
        direction,
        user_id: peerUserID,
        call_type: signal.callType?.trim() === 'video' ? 'video' : 'audio',
        status: signal.status?.trim() || terminalSignalKeyToStatus(key),
        ...(answerStatus ? { answer_status: answerStatus } : {}),
        started_at: new Date(answeredAt ? Date.parse(answeredAt) : endedAtMs).toISOString(),
        ...(answeredAt ? { answered_at: answeredAt } : {}),
        ended_at: new Date(endedAtMs).toISOString(),
        ...(signal.reason?.trim() ? { end_reason: signal.reason.trim() } : {}),
    };
}
/** 判断事件是否应生成最终通话记录。 */
function isTerminalCallSignalKey(key) {
    return [
        'rtc.call.reject',
        'rtc.call.cancel',
        'rtc.call.hangup',
        'rtc.call.ended',
        'rtc.call.missed',
        'rtc.call.failed',
        'rtc.call.summary',
    ].includes(key);
}
/** 判断终结事件是否已建立媒体通话。 */
function isAnsweredTerminalSignal(signal) {
    /** status 用于 summary 的失败态排除。 */
    const status = signal.status?.trim().toLowerCase() ?? '';
    return signal.key === 'rtc.call.hangup' ||
        signal.key === 'rtc.call.ended' ||
        (signal.key === 'rtc.call.summary' &&
            !['missed', 'rejected', 'canceled', 'failed'].includes(status));
}
/** 缺少明确 answer_status 时按 RN 既有规则保守推断。 */
function inferTerminalAnswerStatus(signal, direction, answeredAt) {
    if (answeredAt)
        return 'answered';
    /** status 兼容服务端 missed 状态。 */
    const status = signal.status?.trim().toLowerCase() ?? '';
    return direction !== 'outgoing' &&
        (signal.key === 'rtc.call.missed' || status === 'missed')
        ? 'missed'
        : '';
}
/** 将服务端接听分类收敛为列表支持的稳定枚举。 */
function normalizeCallAnswerStatus(value) {
    /** text 兼容空值和扩展状态。 */
    const text = String(value ?? '').trim().toLowerCase();
    return text === 'answered' || text === 'missed' ? text : '';
}
/** 将终结事件 key 映射为列表状态。 */
function terminalSignalKeyToStatus(key) {
    if (key === 'rtc.call.reject')
        return 'rejected';
    if (key === 'rtc.call.cancel')
        return 'canceled';
    if (key === 'rtc.call.missed')
        return 'missed';
    if (key === 'rtc.call.failed')
        return 'failed';
    return 'ended';
}
/** 从常见单聊会话前缀解析对端 ID。 */
function parseSingleConversationPeerID(conversationID) {
    for (const prefix of ['si_', 'single_', 'direct_']) {
        if (conversationID.startsWith(prefix)) {
            return conversationID.slice(prefix.length).trim();
        }
    }
    return '';
}
/** 归一化详情和记录 mutation 使用的稳定通话 ID。 */
function requireCallRecordID(callID) {
    /** normalizedCallID 去除路由参数或调用方输入空白。 */
    const normalizedCallID = callID.trim();
    if (!normalizedCallID)
        throw new Error('Call ID is required.');
    return normalizedCallID;
}
/** 以 Gateway 详情为准，仅用缓存补齐缺失字段。 */
function mergeCallDetailWithCache(call, cachedCall) {
    if (!cachedCall)
        return call;
    /** merged 先铺缓存再覆盖全部服务端已返回字段。 */
    const merged = { ...cachedCall, ...call };
    return {
        ...merged,
        ...(call.direction === undefined && cachedCall.direction !== undefined
            ? { direction: cachedCall.direction }
            : {}),
        ...(call.user_id === undefined && cachedCall.user_id !== undefined
            ? { user_id: cachedCall.user_id }
            : {}),
        ...(call.nickname === undefined && cachedCall.nickname !== undefined
            ? { nickname: cachedCall.nickname }
            : {}),
        ...(call.avatar_url === undefined && cachedCall.avatar_url !== undefined
            ? { avatar_url: cachedCall.avatar_url }
            : {}),
    };
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
        if (!Array.isArray(response.list)) {
            throw new Error('Gateway call list did not explicitly return a list array.');
        }
        // pageCalls 忽略缺少稳定 call_id 的无效缓存记录。
        const pageCalls = response.list.filter(call => Boolean(call.call_id?.trim()));
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