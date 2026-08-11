import { MessageRepository, mapGatewayMessageToCore, } from '@im28/im-sdk/core';
import { createWebIMSyncError } from './sync-context.js';
/** 从 Gateway 拉取历史并持久化后返回当前本地窗口。 */
export async function pullWebIMMessageHistory(context, options, gatewayClient) {
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
    /** messages 在任何写入前全部完成字段校验和映射。 */
    const messages = (response.messages ?? []).map(message => mapGatewayMessageToCore(message, {
        currentUserID: context.userID,
        conversationID,
    }));
    /** repository 使用稳定 clientMsgID 幂等 upsert。 */
    const repository = new MessageRepository(context.database);
    for (const message of messages) {
        await repository.upsert(message);
    }
    return repository.getHistory({ conversationID, limit });
}
/** 将 history window 限制在 Gateway 可控范围。 */
function clampHistoryLimit(value) {
    if (!Number.isFinite(value))
        return 30;
    return Math.min(100, Math.max(1, Math.trunc(value ?? 30)));
}
//# sourceMappingURL=message-history-pull.js.map