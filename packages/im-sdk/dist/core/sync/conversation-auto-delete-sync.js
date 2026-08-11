import { ConversationRepository, mapGatewayConversationToCore, normalizeConversationAutoDeleteSeconds, } from '@im28/im-sdk/core';
import { createWebIMSyncError, requireWebIMSyncContext, } from './sync-context.js';
import { normalizeWebIMConversationID, requireCachedWebIMConversation, } from './conversation-sync-target.js';
import { createWebIMSyncMutationQueue, } from './sync-mutation-queue.js';
/** 创建认证账号绑定的自动删除设置服务。 */
export function createWebIMConversationAutoDeleteSync(dependencies) {
    return new WebIMConversationAutoDeleteSyncImpl(dependencies);
}
/** 自动删除服务串行编排 Gateway 确认与 SQLite 收敛。 */
class WebIMConversationAutoDeleteSyncImpl {
    /** dependencies 动态读取当前认证账号和数据库。 */
    dependencies;
    /** mutationQueue 与其他会话、消息和实时写入共用。 */
    mutationQueue;
    /** 保存 runtime owners，不持有页面状态。 */
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.mutationQueue =
            dependencies.mutationQueue ?? createWebIMSyncMutationQueue();
    }
    /** 从 Gateway 权威会话详情刷新自动删除设置。 */
    getAutoDelete(conversationID) {
        /** context 在入队前冻结当前认证账号与数据库。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Conversation auto delete');
        return this.mutationQueue.enqueue(() => readWebIMConversationAutoDelete(context, this.dependencies.gatewayClient, conversationID));
    }
    /** 仅在 Gateway 返回目标一致的确认状态后更新缓存。 */
    setAutoDelete(conversationID, autoDeleteSeconds) {
        /** context 在入队前冻结当前认证账号与数据库。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Conversation auto delete');
        return this.mutationQueue.enqueue(() => updateWebIMConversationAutoDelete(context, this.dependencies.gatewayClient, conversationID, autoDeleteSeconds));
    }
}
/** 读取权威会话详情并收敛当前账号缓存。 */
async function readWebIMConversationAutoDelete(context, gatewayClient, conversationID) {
    /** targetID 在 I/O 前归一化。 */
    const targetID = normalizeWebIMConversationID(conversationID);
    /** repository 绑定本次认证上下文。 */
    const repository = new ConversationRepository(context.database);
    await requireCachedWebIMConversation(repository, targetID);
    /** remote 只来自 RN 同源的会话详情 endpoint。 */
    const remote = await gatewayClient.getConversation({ conversation_id: targetID });
    /** mapped 复用 shared canonical 会话映射与枚举校验。 */
    const mapped = mapGatewayConversationToCore(remote, context.userID).conversation;
    /** snapshot 在持久化前完成目标和必填元数据校验。 */
    const snapshot = toAutoDeleteSetting(mapped, targetID);
    await persistAutoDeleteSetting(repository, snapshot);
    return snapshot;
}
/** 更新服务端设置并拒绝不一致回包。 */
async function updateWebIMConversationAutoDelete(context, gatewayClient, conversationID, requestedSeconds) {
    /** targetID 在 I/O 前归一化。 */
    const targetID = normalizeWebIMConversationID(conversationID);
    /** autoDeleteSeconds 必须命中完整 Gateway 枚举。 */
    const autoDeleteSeconds = normalizeConversationAutoDeleteSeconds(requestedSeconds);
    if (autoDeleteSeconds === undefined) {
        throw createWebIMSyncError('SYNC_AUTO_DELETE_SECONDS_INVALID', 'Conversation auto delete seconds are not supported by Gateway.');
    }
    /** repository 用于校验真实目标并执行 success-only 写入。 */
    const repository = new ConversationRepository(context.database);
    await requireCachedWebIMConversation(repository, targetID);
    /** remote 是 Gateway 已接受更新后的权威会话。 */
    const remote = await gatewayClient.updateConversationAutoDelete({
        conversation_id: targetID,
        auto_delete_seconds: autoDeleteSeconds,
    });
    /** mapped 在任何本地写入前完成规范映射。 */
    const mapped = mapGatewayConversationToCore(remote, context.userID).conversation;
    /** snapshot 必须与目标和请求值完全一致。 */
    const snapshot = toAutoDeleteSetting(mapped, targetID);
    if (snapshot.autoDeleteSeconds !== autoDeleteSeconds) {
        throw createWebIMSyncError('SYNC_AUTO_DELETE_RESPONSE_MISMATCH', 'Gateway returned a different conversation auto delete setting.');
    }
    await persistAutoDeleteSetting(repository, snapshot);
    return snapshot;
}
/** 从 canonical 会话构造严格自动删除快照。 */
function toAutoDeleteSetting(conversation, targetID) {
    /** autoDeleteSeconds 再次收窄可选 core 字段。 */
    const autoDeleteSeconds = normalizeConversationAutoDeleteSeconds(conversation.autoDeleteSeconds);
    if (conversation.conversationID !== targetID ||
        autoDeleteSeconds === undefined) {
        throw createWebIMSyncError('SYNC_AUTO_DELETE_RESPONSE_INVALID', 'Gateway returned invalid conversation auto delete metadata.');
    }
    return {
        conversationID: targetID,
        autoDeleteSeconds,
        ...(conversation.autoDeleteUpdatedBy
            ? { updatedBy: conversation.autoDeleteUpdatedBy }
            : {}),
        updatedAt: conversation.autoDeleteUpdatedAt ?? 0,
    };
}
/** 将服务端确认快照写入会话索引列。 */
async function persistAutoDeleteSetting(repository, setting) {
    await repository.updateAutoDelete(setting.conversationID, setting.autoDeleteSeconds, setting.updatedBy, setting.updatedAt);
}
/** 从 type1701 系统消息中提取严格自动删除变更。 */
export function parseConversationAutoDeleteNotice(message, conversationID) {
    if (Number(message.type) !== 1701)
        return null;
    /** body 只允许处理系统事件对象。 */
    const body = message.body;
    /** system 必须是规范事件类型。 */
    const system = body?.system;
    if (system?.event_type !== 'conversation_auto_delete_changed')
        return null;
    /** extra 包含操作者、秒数与启用状态。 */
    const extra = system.extra;
    /** seconds 只接受十进制 Gateway 枚举。 */
    const seconds = normalizeConversationAutoDeleteSeconds(extra?.auto_delete_seconds === undefined
        ? undefined
        : Number(extra.auto_delete_seconds));
    /** enabled 必须与秒数的开关语义一致。 */
    const enabled = extra?.enabled;
    if (seconds === undefined ||
        (enabled !== 'true' && enabled !== 'false') ||
        (seconds > 0) !== (enabled === 'true')) {
        return null;
    }
    /** updatedAt 使用系统消息服务端时间，不以本机时间猜测。 */
    const updatedAt = readGatewayTimestamp(message.sent_at ?? message.updated_at);
    /** updatedBy 仅保留非空操作者 ID。 */
    const updatedBy = extra?.operator_user_id?.trim();
    return {
        conversationID,
        autoDeleteSeconds: seconds,
        ...(updatedBy ? { updatedBy } : {}),
        updatedAt,
    };
}
/** 将批次内最新有效 1701 事件收敛到会话元数据。 */
export async function applyLatestConversationAutoDeleteNotice(repository, conversationID, messages) {
    /** latest 按 seq 优先、服务端发送时间兜底选择。 */
    let latest = null;
    for (const message of messages) {
        /** setting 忽略普通消息与格式错误的系统事件。 */
        const setting = parseConversationAutoDeleteNotice(message, conversationID);
        if (!setting)
            continue;
        /** seq 缺失时使用零并由时间兜底。 */
        const seq = /^\d+$/.test(String(message.msg_seq ?? ''))
            ? BigInt(message.msg_seq)
            : 0n;
        if (!latest ||
            seq > latest.seq ||
            (seq === latest.seq && setting.updatedAt >= latest.setting.updatedAt)) {
            latest = { setting, seq };
        }
    }
    if (latest)
        await persistAutoDeleteSetting(repository, latest.setting);
}
/** 将 Gateway ISO 或数字时间归一化为毫秒。 */
function readGatewayTimestamp(value) {
    if (typeof value !== 'string' || !value.trim())
        return 0;
    /** numeric 兼容服务端秒或毫秒字符串。 */
    const numeric = Number(value);
    if (/^\d+(?:\.\d+)?$/.test(value) && Number.isFinite(numeric)) {
        return numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
    }
    /** parsed 隔离 Date.parse 的 NaN。 */
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
}
//# sourceMappingURL=conversation-auto-delete-sync.js.map