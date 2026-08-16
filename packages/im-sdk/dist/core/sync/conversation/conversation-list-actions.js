import { ConversationRepository, } from '@im28/im-sdk/core';
import { createWebIMSyncError, requireWebIMSyncContext, } from '../sync-context.js';
import { normalizeWebIMConversationID, requireCachedWebIMConversation, } from './conversation-sync-target.js';
import { createWebIMSyncMutationQueue, } from '../sync-mutation-queue.js';
/** 创建 RN/Web/Desktop 共用的会话列表动作 facade。 */
export function createIMConversationListActionsSync(dependencies) {
    /** mutationQueue 与设置、消息和 realtime 共用顺序。 */
    const mutationQueue = dependencies.mutationQueue ?? createWebIMSyncMutationQueue();
    return {
        /** 已读动作只在 Gateway 成功后收敛 SQLite。 */
        markRead: (conversationID, requestedReadSeq) => mutationQueue.enqueue(async () => {
            /** targetID 先拒绝空白输入。 */
            const targetID = normalizeWebIMConversationID(conversationID);
            /** context 固定本轮认证账号和数据库。 */
            const context = requireWebIMSyncContext(dependencies, 'Conversation mark read');
            /** repository 绑定本轮账号数据库。 */
            const repository = new ConversationRepository(context.database);
            /** existing 禁止对页面拼装或跨账号会话执行动作。 */
            const existing = await requireCachedWebIMConversation(repository, targetID);
            /** readSeq 优先保留 RN 聊天页实际已阅边界，列表动作回退最后消息序号。 */
            const readSeq = normalizeConversationReadSeq(requestedReadSeq) ??
                existing.lastMsgSeq?.trim();
            /** response 由共享 Gateway client 验证 HTTP 和 envelope。 */
            const response = await dependencies.gatewayClient.markConversationRead({
                conversation_id: targetID,
                ...(readSeq ? { read_seq: readSeq } : {}),
            });
            validateConversationActionState(response.state, targetID);
            /** confirmedReadSeq 只在服务端或缓存提供非空游标时进入实体。 */
            const confirmedReadSeq = response.state?.last_read_seq?.trim() || readSeq;
            /** confirmedUnreadCount 优先采用服务端事实，部分游标无事实时保留原值。 */
            const confirmedUnreadCount = resolveConversationUnreadCountAfterRead(existing.unreadCount, existing.lastMsgSeq, confirmedReadSeq, response.state?.unread_count);
            /** next 只使用请求语义和服务端返回的稳定游标收敛本地状态。 */
            const next = {
                ...existing,
                unreadCount: confirmedUnreadCount,
                manualUnread: false,
                ...(confirmedReadSeq ? { lastReadSeq: confirmedReadSeq } : {}),
            };
            await repository.upsert(next);
            return next;
        }),
        /** 手动未读动作保留真实未读数，只更新独立标记。 */
        markUnread: (conversationID, manualUnread = true) => mutationQueue.enqueue(async () => {
            /** targetID 先拒绝空白输入。 */
            const targetID = normalizeWebIMConversationID(conversationID);
            /** context 固定本轮认证账号和数据库。 */
            const context = requireWebIMSyncContext(dependencies, 'Conversation mark unread');
            /** repository 绑定本轮账号数据库。 */
            const repository = new ConversationRepository(context.database);
            /** existing 禁止对不存在的会话伪造成功。 */
            const existing = await requireCachedWebIMConversation(repository, targetID);
            /** response 只接受真实 Gateway 成功。 */
            const response = await dependencies.gatewayClient.markConversationUnread({
                conversation_id: targetID,
                manual_unread: manualUnread,
            });
            validateConversationActionState(response.state, targetID);
            /** next 保留服务端未读计数并切换手动标记。 */
            const next = { ...existing, manualUnread };
            await repository.upsert(next);
            return next;
        }),
        /** 归档动作只更新归档索引，不复用 listHidden 清空语义。 */
        setArchived: (conversationID, archived) => mutationQueue.enqueue(async () => {
            /** targetID 先拒绝空白输入。 */
            const targetID = normalizeWebIMConversationID(conversationID);
            /** context 固定本轮认证账号和数据库。 */
            const context = requireWebIMSyncContext(dependencies, 'Conversation archive');
            /** repository 绑定本轮账号数据库。 */
            const repository = new ConversationRepository(context.database);
            /** existing 是成功后本地收敛的唯一基础快照。 */
            const existing = await requireCachedWebIMConversation(repository, targetID);
            /** response 只接受真实 Gateway 成功。 */
            const response = await dependencies.gatewayClient.archiveConversation({
                conversation_id: targetID,
                archived,
            });
            validateConversationActionState(response.state, targetID);
            /** next 保留其他会话状态，只切换归档索引。 */
            const next = { ...existing, isArchived: archived };
            await repository.upsert(next);
            return next;
        }),
    };
}
/** 只在服务端确认或已读游标覆盖最后消息时清零本地未读数。 */
function resolveConversationUnreadCountAfterRead(currentUnreadCount, lastMsgSeq, confirmedReadSeq, responseUnreadCount) {
    if (responseUnreadCount !== undefined) {
        /** numericCount 接受 Gateway uint64 文本并钳制到安全整数。 */
        const numericCount = Number(responseUnreadCount);
        if (Number.isFinite(numericCount) && numericCount >= 0) {
            return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(numericCount));
        }
    }
    /** normalizedLastSeq 和 readSeq 都必须是合法十进制文本才可比较。 */
    const normalizedLastSeq = lastMsgSeq?.trim();
    const normalizedReadSeq = confirmedReadSeq?.trim();
    if (normalizedLastSeq &&
        normalizedReadSeq &&
        /^\d+$/.test(normalizedLastSeq) &&
        /^\d+$/.test(normalizedReadSeq) &&
        BigInt(normalizedReadSeq) >= BigInt(normalizedLastSeq))
        return 0;
    return currentUnreadCount;
}
/** 归一化可选已读游标，拒绝负数、小数和非十进制输入。 */
function normalizeConversationReadSeq(value) {
    if (value === undefined)
        return undefined;
    if (typeof value === 'number' && (!Number.isSafeInteger(value) || value < 0)) {
        throw createWebIMSyncError('INVALID_CONVERSATION_READ_SEQ', 'Conversation mark read requires a safe unsigned number or decimal string.');
    }
    /** normalized 只接受可由 Gateway 精确处理的十进制整数文本。 */
    const normalized = String(value).trim();
    if (!/^\d+$/.test(normalized)) {
        throw createWebIMSyncError('INVALID_CONVERSATION_READ_SEQ', 'Conversation mark read requires an unsigned decimal sequence.');
    }
    return normalized;
}
/** mutation 回包携带目标时必须与请求会话一致。 */
function validateConversationActionState(state, conversationID) {
    /** responseID 为空表示服务端只返回成功 envelope。 */
    const responseID = state?.conversation_id?.trim();
    if (responseID && responseID !== conversationID) {
        throw createWebIMSyncError('SYNC_CONVERSATION_STATE_MISMATCH', 'Gateway returned a different conversation state.');
    }
}
//# sourceMappingURL=conversation-list-actions.js.map