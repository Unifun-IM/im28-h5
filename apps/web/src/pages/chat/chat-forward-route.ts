/** 转发选择器与目标聊天页共享的内存路由状态。 */
export interface ChatForwardRouteState {
  readonly kind: 'chat-forward';
  readonly sourceConversationID: string;
  readonly sourceConversationTitle: string;
  readonly sourceClientMsgIDs: readonly string[];
  readonly hideSenderName?: boolean;
}

/** React Router location.state 的转发包装，禁止携带消息正文。 */
export interface ChatForwardLocationState {
  readonly forward: ChatForwardRouteState;
}

/** 旧目标页只允许把校验后的稳定身份交回聊天内弹窗。 */
export interface ChatForwardPickerLocationState {
  readonly forwardPicker: ChatForwardRouteState;
}

/** 旧转发目标页的唯一输出是聊天主路由和可选一次性弹窗状态。 */
export interface ChatForwardCompatibilityDestination {
  readonly pathname: string;
  readonly state: ChatForwardPickerLocationState | null;
}

/** 从稳定会话和消息身份创建可跨 SPA 页面传递的状态。 */
export function createChatForwardRouteState(options: {
  readonly sourceConversationID: string;
  readonly sourceConversationTitle: string;
  readonly sourceClientMsgIDs: readonly string[];
  readonly hideSenderName?: boolean;
}): ChatForwardRouteState {
  // sourceClientMsgIDs 去空白和重复项，同时保留用户选择顺序。
  const sourceClientMsgIDs = Array.from(
    new Set(options.sourceClientMsgIDs.map(item => item.trim()).filter(Boolean)),
  );
  return {
    kind: 'chat-forward',
    sourceConversationID: options.sourceConversationID.trim(),
    sourceConversationTitle: options.sourceConversationTitle.trim() || '聊天',
    sourceClientMsgIDs,
    ...(options.hideSenderName ? { hideSenderName: true } : {}),
  };
}

/** 只接受完整 ID 状态，刷新或外部深链产生的未知 state 一律丢弃。 */
export function readChatForwardLocationState(
  value: unknown,
): ChatForwardRouteState | null {
  if (!isRecord(value) || !isRecord(value.forward)) return null;
  // candidate 保留检查后的对象引用，不复制潜在消息正文。
  const candidate = value.forward;
  if (
    candidate.kind !== 'chat-forward' ||
    'messages' in candidate ||
    'payload' in candidate ||
    typeof candidate.sourceConversationID !== 'string' ||
    typeof candidate.sourceConversationTitle !== 'string' ||
    !Array.isArray(candidate.sourceClientMsgIDs)
  ) {
    return null;
  }
  // sourceClientMsgIDs 必须全部为非空字符串且数量符合 SDK 上限。
  const sourceClientMsgIDs = candidate.sourceClientMsgIDs.filter(
    (item): item is string => typeof item === 'string' && Boolean(item.trim()),
  );
  if (
    !candidate.sourceConversationID.trim() ||
    sourceClientMsgIDs.length !== candidate.sourceClientMsgIDs.length ||
    sourceClientMsgIDs.length < 1 ||
    sourceClientMsgIDs.length > 100
  ) {
    return null;
  }
  return createChatForwardRouteState({
    sourceConversationID: candidate.sourceConversationID,
    sourceConversationTitle: candidate.sourceConversationTitle,
    sourceClientMsgIDs,
    hideSenderName: candidate.hideSenderName === true,
  });
}

/** 创建旧目标页到当前聊天弹窗的单次兼容状态。 */
export function createChatForwardPickerLocationState(
  forward: ChatForwardRouteState,
): ChatForwardPickerLocationState {
  return { forwardPicker: forward };
}

/** 只读取兼容 redirect 生成的稳定 ID 状态，不接受消息正文。 */
export function readChatForwardPickerLocationState(
  value: unknown,
): ChatForwardRouteState | null {
  if (!isRecord(value) || !isRecord(value.forwardPicker)) return null;
  return readChatForwardLocationState({ forward: value.forwardPicker });
}

/** 将旧目标页 state 安全收敛为同一会话的聊天内弹窗入口。 */
export function createChatForwardCompatibilityDestination(
  conversationID: string,
  locationState: unknown,
): ChatForwardCompatibilityDestination {
  // normalizedConversationID 只去除路由身份两端空白。
  const normalizedConversationID = conversationID.trim();
  // forward 复用现有 route contract，拒绝正文和畸形身份。
  const forward = readChatForwardLocationState(locationState);
  return {
    pathname: `/conversations/${encodeURIComponent(normalizedConversationID)}`,
    state: forward?.sourceConversationID === normalizedConversationID
      ? createChatForwardPickerLocationState(forward)
      : null,
  };
}

/** 将未知值收窄为可安全读取字段的对象。 */
function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
