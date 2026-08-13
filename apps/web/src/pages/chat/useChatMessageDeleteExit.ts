import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Message } from '@im28/im-sdk/web';

import {
  createChatMessageDeleteExitState,
  finishChatMessageDeleteExit,
  getChatMessageDeleteExitWindow,
  type ChatMessageDeleteExitState,
} from './chat-message-delete-exit.js';

/** RN 碎裂动画结束后仍未收到 DOM 回调时的兜底释放时间。 */
const CHAT_MESSAGE_DELETE_EXIT_FALLBACK_MS = 700;

/** 管理删除成功消息的短期冻结窗口和逐行退场身份。 */
export function useChatMessageDeleteExit(
  conversationID: string,
  messages: readonly Message[],
) {
  /** state 只保存 700ms 内的页面展示快照，不改变 SDK 或 SQLite。 */
  const [state, setState] = useState<ChatMessageDeleteExitState | null>(null);

  useEffect(() => {
    setState(null);
  }, [conversationID]);

  useEffect(() => {
    if (!state?.exitingMessageIDs.size) return;
    /** timer 防止退场行未挂载或动画事件被浏览器中断后永久残留。 */
    const timer = window.setTimeout(() => setState(null), CHAT_MESSAGE_DELETE_EXIT_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [state]);

  /** begin 只接收 SDK 逐项结果中的成功 client ID。 */
  const begin = useCallback((deletedClientMsgIDs: readonly string[]) => {
    setState(createChatMessageDeleteExitState(
      conversationID,
      messages,
      deletedClientMsgIDs,
    ));
  }, [conversationID, messages]);

  /** finish 由真实行动画结束回调释放一个成功项。 */
  const finish = useCallback((clientMsgID: string) => {
    setState(current => finishChatMessageDeleteExit(current, clientMsgID));
  }, []);

  /** displayMessages 在动画期间合并最新 cache 与删除前成功行。 */
  const displayMessages = useMemo(
    () => getChatMessageDeleteExitWindow(conversationID, messages, state),
    [conversationID, messages, state],
  );

  return {
    displayMessages,
    exitingMessageIDs: state?.exitingMessageIDs ?? new Set<string>(),
    begin,
    finish,
  };
}
