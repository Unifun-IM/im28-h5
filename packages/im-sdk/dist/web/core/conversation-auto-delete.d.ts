/** Gateway 允许的会话自动删除时长，单位为秒。 */
export declare const CONVERSATION_AUTO_DELETE_SECONDS: readonly [0, 21600, 43200, 86400, 259200, 604800, 1296000, 2592000, 5184000, 7776000, 15552000];
/** 会话自动删除时长只允许使用 Gateway 公开枚举。 */
export type ConversationAutoDeleteSeconds = (typeof CONVERSATION_AUTO_DELETE_SECONDS)[number];
/** 将未知输入收窄为服务端允许的自动删除秒数。 */
export declare function normalizeConversationAutoDeleteSeconds(value: unknown): ConversationAutoDeleteSeconds | undefined;
//# sourceMappingURL=conversation-auto-delete.d.ts.map