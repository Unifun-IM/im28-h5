import { ConversationRepository } from '@im28/im-sdk/core';
import { createWebIMSyncError } from '../sync-context.js';
/** 会话 ID 为空时以结构化同步错误提前失败。 */
export function normalizeWebIMConversationID(conversationID) {
    /** normalizedID 去除路由或调用方可能携带的空白。 */
    const normalizedID = conversationID.trim();
    if (!normalizedID) {
        throw createWebIMSyncError('SYNC_CONVERSATION_ID_REQUIRED', 'Conversation operation requires a conversation ID.');
    }
    return normalizedID;
}
/** 会话操作只允许作用于当前账号已缓存的真实会话。 */
export async function requireCachedWebIMConversation(repository, conversationID) {
    /** conversation 来自当前账号 SQLite，不接受页面拼装实体。 */
    const conversation = await repository.getByID(conversationID);
    if (!conversation) {
        throw createWebIMSyncError('SYNC_CONVERSATION_NOT_FOUND', 'Conversation operation requires an existing cached conversation.');
    }
    return conversation;
}
//# sourceMappingURL=conversation-sync-target.js.map