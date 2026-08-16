import { ConversationRepository, type Conversation } from '@im28/im-sdk/core';
/** 会话 ID 为空时以结构化同步错误提前失败。 */
export declare function normalizeWebIMConversationID(conversationID: string): string;
/** 会话操作只允许作用于当前账号已缓存的真实会话。 */
export declare function requireCachedWebIMConversation(repository: ConversationRepository, conversationID: string): Promise<Conversation>;
//# sourceMappingURL=conversation-sync-target.d.ts.map