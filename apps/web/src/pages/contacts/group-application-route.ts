/** 从群管理或聊天头部进入申请列表时使用的受限路由状态。 */
export interface GroupApplicationRouteState {
  readonly source: 'group-management' | 'chat';
  readonly conversationID: string;
}

/** 创建群管理来源状态，不允许页面传入任意返回地址。 */
export function createGroupApplicationManagementRouteState(
  conversationID: string,
): GroupApplicationRouteState {
  return { source: 'group-management', conversationID };
}

/** 创建聊天头部来源状态，使申请页返回当前群聊。 */
export function createGroupApplicationChatRouteState(
  conversationID: string,
): GroupApplicationRouteState {
  return { source: 'chat', conversationID };
}

/** 将可信来源状态还原为返回地址，异常输入回退群聊验证页。 */
export function resolveGroupApplicationBackTo(state: unknown): string {
  if (!isGroupApplicationRouteState(state)) {
    return '/contacts/verifications/group';
  }
  /** conversationURL 是两种可信来源共享的会话根路径。 */
  const conversationURL = `/conversations/${encodeURIComponent(state.conversationID)}`;
  return state.source === 'chat' ? conversationURL : `${conversationURL}/settings/manage`;
}

/** 校验 React Router history state 的最小结构。 */
function isGroupApplicationRouteState(
  state: unknown,
): state is GroupApplicationRouteState {
  if (!state || typeof state !== 'object') return false;
  /** candidate 只读取本地定义的来源和会话字段。 */
  const candidate = state as Partial<GroupApplicationRouteState>;
  return (candidate.source === 'group-management' || candidate.source === 'chat')
    && typeof candidate.conversationID === 'string'
    && Boolean(candidate.conversationID.trim());
}
