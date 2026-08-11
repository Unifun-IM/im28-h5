import type { Message } from '@im28/im-sdk/web';

import {
  getChatMessageView,
  type ChatMessageView,
} from './chat-message-view.js';

/** 当前缓存窗口中可用于引用预览和跳转的来源状态。 */
export interface ChatQuoteSourceView {
  readonly message: Message;
  readonly label: string;
  readonly text: string;
  readonly deleted: boolean;
}

/** 选择引用时 composer 所需的发送者和摘要。 */
export interface ChatQuoteComposerView {
  readonly label: string;
  readonly text: string;
}

/** 判断消息是否属于 RN 普通气泡引用动作范围。 */
export function canQuoteChatMessage(
  message: Message,
  view: ChatMessageView,
): boolean {
  return (
    view.kind !== 'system' &&
    message.status !== 'revoked' &&
    message.status !== 'deleted_local' &&
    Boolean(message.serverMsgID?.trim() || message.clientMsgID.trim())
  );
}

/** 从当前缓存窗口按 server/client ID 解析被引用来源。 */
export function resolveChatQuoteSource(
  messages: readonly Message[],
  sourceMessageID: string,
  isGroup: boolean,
): ChatQuoteSourceView | null {
  // stableID 是 Gateway quote body 保存的来源身份。
  const stableID = sourceMessageID.trim();
  if (!stableID) return null;
  // message 同时匹配服务端与本地稳定身份。
  const message = messages.find(
    candidate =>
      candidate.serverMsgID?.trim() === stableID ||
      candidate.clientMsgID.trim() === stableID,
  );
  if (!message) return null;
  // deleted 阻止跳转到撤回或本地删除内容。
  const deleted =
    message.status === 'revoked' || message.status === 'deleted_local';
  // view 只消费 shared payload，不反向解析 transport DTO。
  const view = getChatMessageView(message, isGroup);
  return {
    message,
    label: message.direction === 'outgoing' ? '我' : message.senderID,
    text: deleted ? '引用的内容已删除' : view.text,
    deleted,
  };
}

/** 为 composer 构造 RN “回复发送者 + 来源摘要”视图。 */
export function getChatQuoteComposerView(
  message: Message,
  isGroup: boolean,
): ChatQuoteComposerView {
  // view 使用当前真实来源 payload 的可见文本。
  const view = getChatMessageView(message, isGroup);
  return {
    label: message.direction === 'outgoing' ? '我' : message.senderID,
    text: view.text,
  };
}
