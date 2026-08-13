import type { Dispatch, SetStateAction } from 'react';

import { copyChatMessage, copyChatMessageText } from './chat-message-copy.js';
import type { ChatMessageView } from './chat-message-view.js';
import { readChatPageError } from './chat-page-helpers.js';

/** 聊天页反馈 setter 只接受可见文案或清空。 */
type ChatFeedbackSetter = Dispatch<SetStateAction<string | null>>;

/** clipboard hook 只依赖页面级反馈 owner。 */
interface UseChatMessageClipboardOptions {
  readonly setError: ChatFeedbackSetter;
  readonly setNotice: ChatFeedbackSetter;
}

/** 聊天页消息与链接复制共用唯一浏览器 clipboard 和反馈语义。 */
export function useChatMessageClipboard({
  setError,
  setNotice,
}: UseChatMessageClipboardOptions) {
  /** copyMessage 复制完整消息的 RN fallback 投影。 */
  async function copyMessage(view: ChatMessageView): Promise<boolean> {
    setError(null);
    setNotice(null);
    try {
      await copyChatMessage(view);
      setNotice('复制成功');
      return true;
    } catch (cause) {
      setError(readChatPageError(cause));
      return false;
    }
  }

  /** copyLink 只复制可见 URL 原文，不使用规范化后的打开地址。 */
  async function copyLink(url: string): Promise<boolean> {
    setError(null);
    setNotice(null);
    try {
      await copyChatMessageText(url);
      setNotice('复制成功');
      return true;
    } catch (cause) {
      setError(readChatPageError(cause));
      return false;
    }
  }

  return { copyMessage, copyLink };
}
