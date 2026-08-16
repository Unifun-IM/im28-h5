import { ConversationRepository, MessageRepository, mapGatewayMessageToCore, } from '@im28/im-sdk/core';
import { isConversationMessageAfterClearBoundary } from '../conversation/conversation-clear-state.js';
import { createWebIMSyncError } from '../sync-context.js';
/** 从 Gateway 拉取历史并持久化后返回当前本地窗口。 */
export async function pullWebIMMessageHistory(context, options, gatewayClient) {
    /** page 复用唯一 Gateway 请求和持久化实现。 */
    await pullWebIMMessageHistoryPage(context, options, gatewayClient, false);
    /** repository 保留旧 facade 的 newest-first 当前缓存窗口合同。 */
    const repository = new MessageRepository(context.database);
    return repository.getHistory({
        conversationID: options.conversationID.trim(),
        limit: clampHistoryLimit(options.limit),
    });
}
/** 从 Gateway 拉取并持久化单页历史，同时保留服务端分页事实。 */
export async function pullWebIMMessageHistoryPage(context, options, gatewayClient, validatePaginationCursor = true) {
    /** conversationID 是远端和本地分区共同主键。 */
    const conversationID = options.conversationID.trim();
    /** fromSeq 保留 uint64 string，禁止经过 JS number 截断。 */
    const fromSeq = options.fromSeq.trim();
    if (!conversationID || !fromSeq) {
        throw createWebIMSyncError('INVALID_HISTORY_CURSOR', 'Message history requires a conversation ID and fromSeq.');
    }
    /** limit 是 Gateway 与 SQLite 窗口共用的安全上限。 */
    const limit = clampHistoryLimit(options.limit);
    /** response failure 直接 reject，不退化为 fake cache success。 */
    const response = await gatewayClient.pullMessages({
        conversation_id: conversationID,
        from_seq: fromSeq,
        limit,
        desc: options.desc ?? true,
    });
    /** conversation 提供本地已确认的单调清空边界。 */
    const conversation = await new ConversationRepository(context.database).getByID(conversationID);
    /** sourceMessages 阻止补拉把边界内旧消息重新写回 SQLite。 */
    const sourceMessages = (response.messages ?? []).filter(message => isConversationMessageAfterClearBoundary(message.msg_seq, conversation?.clearBeforeSeq));
    /** messages 在任何写入前全部完成字段校验和映射。 */
    const messages = sourceMessages.map(message => mapGatewayMessageToCore(message, {
        currentUserID: context.userID,
        conversationID,
    }));
    /** repository 使用稳定 clientMsgID 幂等 upsert。 */
    const repository = new MessageRepository(context.database);
    for (const message of messages) {
        await repository.upsert(message);
    }
    /** hasMore 只接受 Gateway 明确声明，缺失时不猜测仍有远端历史。 */
    const hasMore = response.has_more === true;
    /** nextSeq 在仍有下一页时必须是有效且前进的 uint64 游标。 */
    const nextSeq = normalizeHistoryCursor(response.next_seq);
    if (validatePaginationCursor && hasMore && (!nextSeq || nextSeq === fromSeq)) {
        throw createWebIMSyncError('INVALID_HISTORY_NEXT_CURSOR', 'Message history returned an invalid next cursor.');
    }
    return {
        messages,
        hasMore,
        ...(hasMore && nextSeq && nextSeq !== fromSeq ? { nextSeq } : {}),
    };
}
/** 将 history window 限制在 Gateway 可控范围。 */
function clampHistoryLimit(value) {
    if (!Number.isFinite(value))
        return 30;
    return Math.min(100, Math.max(1, Math.trunc(value ?? 30)));
}
/** 将 Gateway 历史游标规范为无前导零的 uint64 十进制字符串。 */
function normalizeHistoryCursor(value) {
    /** candidate 只接受协议声明的字符串或安全非负整数。 */
    const candidate = typeof value === 'string'
        ? value.trim()
        : Number.isSafeInteger(value) && Number(value) >= 0
            ? String(value)
            : '';
    if (!/^\d+$/.test(candidate))
        return '';
    try {
        /** cursor 用 BigInt 校验 uint64 上界，避免 JavaScript number 截断。 */
        const cursor = BigInt(candidate);
        return cursor <= 18446744073709551615n ? cursor.toString() : '';
    }
    catch {
        return '';
    }
}
//# sourceMappingURL=message-history-pull.js.map