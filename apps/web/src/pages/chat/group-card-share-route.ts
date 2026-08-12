/** 从真实会话身份构造可刷新群名片设置动作路由。 */
export function buildGroupCardShareRoute(conversationID: string): string {
  // normalizedConversationID 阻止空白 route 生成不可恢复的动作页。
  const normalizedConversationID = conversationID.trim();
  if (!normalizedConversationID) throw new Error('群名片分享需要会话 ID');
  return `/conversations/${encodeURIComponent(normalizedConversationID)}/settings/share-group-card`;
}
