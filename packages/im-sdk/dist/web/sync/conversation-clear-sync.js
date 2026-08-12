import { ConversationRepository, } from '@im28/im-sdk/core';
import { applyConversationClearBoundary, maxConversationClearCursor, normalizeConversationClearCursor, } from './conversation-clear-state.js';
import { createWebIMClientMessageID } from './message-send-state.js';
import { normalizeIMRealtimeMessages } from './realtime-message-normalization.js';
import { createWebIMSyncError, requireWebIMSyncContext, } from './sync-context.js';
import { createWebIMSyncMutationQueue, } from './sync-mutation-queue.js';
/** 统一 RN、Web、Desktop 的群历史全员清空权限判断。 */
export function canIMGroupMemberClearAllMessages(member) {
    return member?.role === 'owner' ||
        member?.role === 'admin' ||
        member?.roleLevel === 100 ||
        member?.roleLevel === 60;
}
/** 创建 RN、Web、Desktop 共用的会话清空业务 facade。 */
export function createIMConversationClearSync(dependencies) {
    return new IMConversationClearSyncImpl(dependencies, dependencies.mutationQueue ?? createWebIMSyncMutationQueue());
}
/** 同步判断 payload 是否包含会话清空控制事件，供 realtime 路由保留账号冻结时序。 */
export function isIMConversationClearRealtime(payload) {
    return parseConversationClearControl(payload) !== null;
}
/** 中性实现统一主动 mutation 与 realtime 控制事件的缓存状态机。 */
class IMConversationClearSyncImpl {
    /** dependencies 动态读取账号、Gateway 与平台端口。 */
    dependencies;
    /** mutationQueue 与会话、消息和 realtime 使用同一串行 owner。 */
    mutationQueue;
    /** 保存注入端口，不持有 UI、路由或数据库生命周期。 */
    constructor(dependencies, mutationQueue) {
        this.dependencies = dependencies;
        this.mutationQueue = mutationQueue;
    }
    /** 冻结账号后执行 success-only destructive convergence。 */
    clear(options) {
        /** context 防止排队期间切换账号导致跨库删除。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Conversation clear');
        return this.mutationQueue.enqueue(() => this.clearDirect(context, options));
    }
    /** 仅在 payload 含清空控制事件时冻结账号并入队。 */
    handleRealtime(payload) {
        /** control 在打开账号数据库前完成无副作用解析。 */
        const control = parseConversationClearControl(payload);
        if (!control)
            return Promise.resolve(null);
        /** context 固定控制通知所属账号数据库。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Conversation clear realtime');
        return this.mutationQueue.enqueue(() => applyConversationClearBoundary(context.database, control));
    }
    /** 校验 target/scope，调用 Gateway 并应用精确响应 cursor。 */
    async clearDirect(context, options) {
        /** conversationID 是 Gateway 与 SQLite 的共同 destructive target。 */
        const conversationID = options.conversationID.trim();
        if (!conversationID) {
            throw createWebIMSyncError('INVALID_CONVERSATION_CLEAR_TARGET', 'Conversation clear requires a conversation ID.');
        }
        /** repository 从当前账号 cache 读取会话类型与群权限投影。 */
        const repository = new ConversationRepository(context.database);
        /** conversation 必须在任何远端 I/O 前存在。 */
        const conversation = await repository.getByID(conversationID);
        if (!conversation) {
            throw createWebIMSyncError('CONVERSATION_NOT_FOUND', 'Conversation clear requires an existing cached conversation.');
        }
        await assertConversationClearScope(conversation, options.scope, this.dependencies.canClearAllMembers);
        /** operationID 在一次调用和 transport retry 中保持不变。 */
        const operationID = options.operationID?.trim() ||
            createWebIMClientMessageID(this.dependencies);
        /** operationStartedAt 区分清空前后产生的本地无 seq 行。 */
        const operationStartedAt = this.dependencies.now?.() ?? Date.now();
        /** response 必须携带精确匹配 target 的 cursor state。 */
        const response = await this.dependencies.gatewayClient.clearConversation({
            conversation_id: conversationID,
            scope: options.scope,
            operation_id: operationID,
        });
        /** state 是 destructive success 的唯一可信回包。 */
        const state = response.state;
        if (state?.conversation_id?.trim() !== conversationID) {
            throw createWebIMSyncError('CONVERSATION_CLEAR_TARGET_MISMATCH', 'Gateway returned a different conversation clear target.');
        }
        /** clearBeforeSeq 缺失或畸形时禁止产生本地成功态。 */
        const clearBeforeSeq = normalizeConversationClearCursor(state.clear_before_seq);
        return applyConversationClearBoundary(context.database, {
            conversationID,
            clearBeforeSeq,
            removeUnsequencedBefore: operationStartedAt,
            updatedAt: operationStartedAt,
        });
    }
}
/** 校验 scope 与缓存会话类型，并让 all_members 未知权限 fail-closed。 */
async function assertConversationClearScope(conversation, scope, canClearAllMembers) {
    if (scope === 'both' && conversation.type !== 'single') {
        throw createWebIMSyncError('CONVERSATION_CLEAR_SCOPE_MISMATCH', 'The both scope is only valid for direct conversations.');
    }
    if (scope !== 'all_members')
        return;
    /** allowed 只能来自平台已有群权限/角色快照。 */
    const allowed = conversation.type === 'group' &&
        Boolean(await canClearAllMembers?.(conversation));
    if (!allowed) {
        throw createWebIMSyncError('CONVERSATION_CLEAR_PERMISSION_REQUIRED', 'Clearing all group members requires a confirmed permission snapshot.');
    }
}
/** 从 realtime payload 严格解析唯一会话的最新 2102 清空边界。 */
function parseConversationClearControl(payload) {
    /** controls 只接收 type2102 或明确 event_type 的系统通知。 */
    const controls = normalizeIMRealtimeMessages(payload)
        .map(readConversationClearControl)
        .filter((item) => item !== null);
    if (!controls.length)
        return null;
    /** conversationIDs 禁止一个事件批次跨多个 destructive target。 */
    const conversationIDs = new Set(controls.map(item => item.conversationID));
    if (conversationIDs.size !== 1) {
        throw createWebIMSyncError('AMBIGUOUS_CONVERSATION_CLEAR_EVENT', 'Realtime clear event must target exactly one conversation.');
    }
    /** latest 合并同目标乱序/重复控制通知的最大 cursor。 */
    const latest = controls.reduce((selected, item) => ({
        conversationID: item.conversationID,
        clearBeforeSeq: maxConversationClearCursor(selected.clearBeforeSeq, item.clearBeforeSeq),
    }));
    return latest;
}
/** 从单条 normalized 系统消息读取清空 target 与 cursor。 */
function readConversationClearControl(message) {
    /** body 必须是普通对象。 */
    const body = readRecord(message.body);
    /** system 承载控制事件类型与扩展字段。 */
    const system = readRecord(body?.system);
    /** extra 承载清空会话和 cursor。 */
    const extra = readRecord(system?.extra);
    /** eventType 兼容 numeric type 与明确协议名称。 */
    const eventType = readText(system?.event_type);
    if (String(message.type ?? '') !== '2102' && eventType !== 'conversation_cleared') {
        return null;
    }
    /** conversationID 优先消息顶层，再读取系统 extra。 */
    const conversationID = readText(message.conversation_id) ||
        readText(extra?.conversation_id);
    if (!conversationID) {
        throw createWebIMSyncError('INVALID_CONVERSATION_CLEAR_EVENT', 'Realtime clear event requires a conversation ID.');
    }
    return {
        conversationID,
        clearBeforeSeq: normalizeConversationClearCursor(extra?.clear_before_seq),
    };
}
/** 将 unknown 收窄为普通对象。 */
function readRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : null;
}
/** 安全读取非空字符串。 */
function readText(value) {
    return typeof value === 'string' ? value.trim() : '';
}
//# sourceMappingURL=conversation-clear-sync.js.map