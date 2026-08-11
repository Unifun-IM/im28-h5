import { ConversationRepository, } from '@im28/im-sdk/core';
import { createWebIMSyncError, requireWebIMSyncContext, } from './sync-context.js';
import { normalizeWebIMConversationID, requireCachedWebIMConversation, } from './conversation-sync-target.js';
import { createWebIMSyncMutationQueue, } from './sync-mutation-queue.js';
/** 创建账号绑定的会话设置服务。 */
export function createWebIMConversationSettingSync(dependencies) {
    return new WebIMConversationSettingSyncImpl(dependencies);
}
/** 设置服务在共享队列中固定账号上下文并委托纯 operation。 */
class WebIMConversationSettingSyncImpl {
    /** dependencies 动态读取 runtime 当前账号和数据库。 */
    dependencies;
    /** mutationQueue 与会话、消息和 realtime 写入共用。 */
    mutationQueue;
    /** 保存 runtime owners，不创建第二套 transport 或 storage。 */
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.mutationQueue =
            dependencies.mutationQueue ?? createWebIMSyncMutationQueue();
    }
    /** 读取真实 Gateway 设置并收敛当前账号会话索引。 */
    async getSetting(conversationID) {
        /** context 在入队前固定当前认证账号与数据库。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Conversation settings');
        return this.mutationQueue.enqueue(() => readWebIMConversationSetting({
            context,
            gatewayClient: this.dependencies.gatewayClient,
            ...(this.dependencies.now ? { now: this.dependencies.now } : {}),
        }, conversationID));
    }
    /** 设置免打扰且只在 Gateway 成功后更新 SQLite。 */
    async setMuted(conversationID, isMuted) {
        /** context 在入队前固定当前认证账号与数据库。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Conversation mute');
        return this.mutationQueue.enqueue(() => updateWebIMConversationMuted({
            context,
            gatewayClient: this.dependencies.gatewayClient,
            ...(this.dependencies.now ? { now: this.dependencies.now } : {}),
        }, conversationID, isMuted));
    }
    /** 设置置顶且只在 Gateway 成功后更新 SQLite。 */
    async setPinned(conversationID, isPinned) {
        /** context 在入队前固定当前认证账号与数据库。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Conversation pin');
        return this.mutationQueue.enqueue(() => updateWebIMConversationPinned({
            context,
            gatewayClient: this.dependencies.gatewayClient,
            ...(this.dependencies.now ? { now: this.dependencies.now } : {}),
        }, conversationID, isPinned));
    }
}
/** 读取服务端设置并只更新已有会话的可索引字段。 */
async function readWebIMConversationSetting(dependencies, conversationID) {
    /** targetID 拒绝空白路径参数进入 Gateway。 */
    const targetID = normalizeWebIMConversationID(conversationID);
    /** repository 始终绑定本次认证上下文的账号数据库。 */
    const repository = new ConversationRepository(dependencies.context.database);
    await requireCachedWebIMConversation(repository, targetID);
    /** response 只来自共享 typed Gateway client。 */
    const response = await dependencies.gatewayClient.getConversationSetting({
        conversation_id: targetID,
    });
    /** setting 缺失或目标不一致时禁止改写本地缓存。 */
    const setting = validateGatewaySetting(response.setting, targetID);
    /** snapshot 在任何持久化前完成严格字段归一化。 */
    const snapshot = mapGatewaySetting(setting, targetID);
    await repository.updatePinned(targetID, snapshot.isPinned, snapshot.pinnedAt);
    await repository.updateMuted(targetID, snapshot.isMuted);
    return snapshot;
}
/** Gateway 成功后更新当前账号会话免打扰索引。 */
async function updateWebIMConversationMuted(dependencies, conversationID, isMuted) {
    /** targetID 在网络和 SQLite 操作前完成一次归一化。 */
    const targetID = normalizeWebIMConversationID(conversationID);
    /** repository 用于校验真实缓存目标并执行 success-only 收敛。 */
    const repository = new ConversationRepository(dependencies.context.database);
    /** existing 保存未变更的 pin 状态供结果投影。 */
    const existing = await requireCachedWebIMConversation(repository, targetID);
    /** response 表示 Gateway 已接受当前用户视角的提醒设置。 */
    const response = await dependencies.gatewayClient.muteConversation({
        conversation_id: targetID,
        notification_muted: isMuted,
    });
    validateGatewayState(response.state, targetID);
    await repository.updateMuted(targetID, isMuted);
    return {
        conversationID: targetID,
        isPinned: existing.isPinned ?? false,
        pinnedAt: existing.pinnedAt ?? 0,
        isMuted,
    };
}
/** Gateway 成功后更新当前账号会话置顶索引和排序时间。 */
async function updateWebIMConversationPinned(dependencies, conversationID, isPinned) {
    /** targetID 在网络和 SQLite 操作前完成一次归一化。 */
    const targetID = normalizeWebIMConversationID(conversationID);
    /** repository 用于校验真实缓存目标并执行 success-only 收敛。 */
    const repository = new ConversationRepository(dependencies.context.database);
    /** existing 保存未变更的 mute 状态供结果投影。 */
    const existing = await requireCachedWebIMConversation(repository, targetID);
    /** response 必须在本地写入前由 typed client 成功返回。 */
    const response = await dependencies.gatewayClient.pinConversation({
        conversation_id: targetID,
        is_pinned: isPinned,
    });
    validateGatewayState(response.state, targetID);
    /** responsePinnedAt 优先使用服务端排序时间，缺失时使用注入时钟。 */
    const responsePinnedAt = readTimestamp(response.state?.pinned_at);
    /** pinnedAt 取消置顶时必须归零，置顶时保证稳定正值。 */
    const pinnedAt = isPinned
        ? responsePinnedAt || (dependencies.now ?? Date.now)()
        : 0;
    await repository.updatePinned(targetID, isPinned, pinnedAt);
    return {
        conversationID: targetID,
        isPinned,
        pinnedAt,
        isMuted: existing.isMuted ?? false,
    };
}
/** 严格校验 setting 目标与两项基础布尔状态。 */
function validateGatewaySetting(setting, conversationID) {
    if (setting?.conversation_id?.trim() !== conversationID ||
        typeof setting.is_pinned !== 'boolean' ||
        typeof setting.notification_muted !== 'boolean') {
        throw createWebIMSyncError('SYNC_CONVERSATION_SETTING_INVALID', 'Gateway returned an invalid conversation setting.');
    }
    return setting;
}
/** mutation response 带目标时必须与请求会话一致。 */
function validateGatewayState(state, conversationID) {
    /** responseID 为空表示服务端仅返回成功 envelope。 */
    const responseID = state?.conversation_id?.trim();
    if (responseID && responseID !== conversationID) {
        throw createWebIMSyncError('SYNC_CONVERSATION_STATE_MISMATCH', 'Gateway returned a different conversation state.');
    }
}
/** 将严格 Gateway setting 投影为平台中立快照。 */
function mapGatewaySetting(setting, conversationID) {
    /** isPinned 已由校验函数保证为布尔值。 */
    const isPinned = setting.is_pinned === true;
    /** pinnedAt 仅在置顶时保留合法服务端时间。 */
    const pinnedAt = isPinned ? readTimestamp(setting.pinned_at) : 0;
    /** autoDeleteSeconds 只接受非负安全整数。 */
    const autoDeleteSeconds = readOptionalNonNegativeInteger(setting.auto_delete_seconds);
    return {
        conversationID,
        isPinned,
        pinnedAt,
        isMuted: setting.notification_muted === true,
        ...(typeof setting.manual_unread === 'boolean'
            ? { manualUnread: setting.manual_unread }
            : {}),
        ...(autoDeleteSeconds !== undefined ? { autoDeleteSeconds } : {}),
    };
}
/** ISO 时间只在可解析时进入 SQLite 排序字段。 */
function readTimestamp(value) {
    /** timestamp 隔离 Date.parse 的 NaN。 */
    const timestamp = value ? Date.parse(value) : Number.NaN;
    return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : 0;
}
/** 自动删除秒数只接受非负安全整数，供后续独立切片读取。 */
function readOptionalNonNegativeInteger(value) {
    return Number.isSafeInteger(value) && (value ?? -1) >= 0 ? value : undefined;
}
//# sourceMappingURL=conversation-setting-sync.js.map