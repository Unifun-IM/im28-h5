import type { Message } from '@im28/im-sdk/web';

/** 删除退场状态冻结 SDK 已确认成功前的消息窗口。 */
export interface ChatMessageDeleteExitState {
  readonly conversationID: string;
  readonly frozenMessages: readonly Message[];
  readonly exitingMessageIDs: ReadonlySet<string>;
}

/** 建立一次只包含 SDK 明确成功项的删除退场状态。 */
export function createChatMessageDeleteExitState(
  conversationID: string,
  messages: readonly Message[],
  deletedClientMsgIDs: readonly string[],
): ChatMessageDeleteExitState | null {
  /** exitingMessageIDs 去除空身份、重复项和不在冻结窗口中的异常回包。 */
  const exitingMessageIDs = new Set(
    deletedClientMsgIDs
      .map(clientMsgID => clientMsgID.trim())
      .filter(clientMsgID => messages.some(message => message.clientMsgID === clientMsgID)),
  );
  if (!conversationID.trim() || !exitingMessageIDs.size) return null;
  return {
    conversationID: conversationID.trim(),
    frozenMessages: messages,
    exitingMessageIDs,
  };
}

/** 在 SQLite 已隐藏成功项后继续保留其冻结行，直到退场结束。 */
export function getChatMessageDeleteExitWindow(
  conversationID: string,
  messages: readonly Message[],
  state: ChatMessageDeleteExitState | null,
): readonly Message[] {
  if (!state || state.conversationID !== conversationID) return messages;
  /** currentByID 以本次最新 SQLite 窗口覆盖未删除行。 */
  const currentByID = new Map(messages.map(message => [message.clientMsgID, message]));
  /** frozenIDs 用于把退场期间新到消息保留在窗口最前端。 */
  const frozenIDs = new Set(state.frozenMessages.map(message => message.clientMsgID));
  /** newMessages 保留动画期间通过 realtime 到达的最新行。 */
  const newMessages = messages.filter(message => !frozenIDs.has(message.clientMsgID));
  /** frozenWindow 只为仍在退场的成功项保留旧快照，失败项读取当前事实。 */
  const frozenWindow = state.frozenMessages.flatMap(message => {
    if (state.exitingMessageIDs.has(message.clientMsgID)) return [message];
    /** currentMessage 缺失表示该行已被其他权威更新移除。 */
    const currentMessage = currentByID.get(message.clientMsgID);
    return currentMessage ? [currentMessage] : [];
  });
  return [...newMessages, ...frozenWindow];
}

/** 完成一条退场；最后一条结束后释放整个冻结窗口。 */
export function finishChatMessageDeleteExit(
  state: ChatMessageDeleteExitState | null,
  clientMsgID: string,
): ChatMessageDeleteExitState | null {
  if (!state || !state.exitingMessageIDs.has(clientMsgID)) return state;
  /** exitingMessageIDs 删除已完成身份但保留同批其他动画。 */
  const exitingMessageIDs = new Set(state.exitingMessageIDs);
  exitingMessageIDs.delete(clientMsgID);
  return exitingMessageIDs.size ? { ...state, exitingMessageIDs } : null;
}
