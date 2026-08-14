/** 将规范会话身份与调用方历史策略投影为可刷新聊天路由。 */
export function buildConversationRoute(conversationIDValue: unknown, replace: boolean) {
  /** conversationID 只接受非空字符串，避免生成不可恢复的聊天地址。 */
  const conversationID = typeof conversationIDValue === 'string'
    ? conversationIDValue.trim()
    : '';
  if (!conversationID) return null;
  return {
    href: `/conversations/${encodeURIComponent(conversationID)}`,
    replace,
  };
}
