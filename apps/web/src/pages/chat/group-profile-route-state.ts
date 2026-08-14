/** 群资料页允许延续的受控聊天来源。 */
export interface GroupProfileRouteState {
  readonly source: 'chat';
  readonly conversationID: string;
}

/** 为聊天头部进入群资料构造最小路由上下文。 */
export function createChatGroupProfileRouteState(
  conversationID: string,
): GroupProfileRouteState {
  return { source: 'chat', conversationID: conversationID.trim() };
}

/** 仅在来源会话与当前路由完全一致时返回聊天，否则返回群设置。 */
export function resolveGroupProfileBackHref(
  state: unknown,
  conversationID: string,
): string {
  /** fallbackHref 保持已有群设置入口的返回语义。 */
  const fallbackHref = `/conversations/${encodeURIComponent(conversationID)}/settings`;
  if (!state || typeof state !== 'object') return fallbackHref;
  /** source 拒绝未知 history state 来源。 */
  const source = Reflect.get(state, 'source');
  /** sourceConversationID 防止跨会话伪造返回目标。 */
  const sourceConversationID = Reflect.get(state, 'conversationID');
  if (source !== 'chat' || sourceConversationID !== conversationID) return fallbackHref;
  return `/conversations/${encodeURIComponent(conversationID)}`;
}
