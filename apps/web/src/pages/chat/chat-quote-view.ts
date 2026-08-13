import {
  resolveIMGroupMemberDisplayName,
  type Message,
  type WebIMGroupMember,
} from '@im28/im-sdk/web';

import {
  getChatMessageView,
  type ChatMessageView,
} from './chat-message-view.js';

/** 当前缓存窗口中可用于引用预览和跳转的来源状态。 */
export interface ChatQuoteSourceView {
  readonly message?: Message;
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
  membersByID: ReadonlyMap<string, WebIMGroupMember> = new Map(),
  unavailableIDs: ReadonlySet<string> = new Set(),
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
  if (!message) {
    return unavailableIDs.has(stableID)
      ? { label: '', text: '引用的内容已删除', deleted: true }
      : null;
  }
  // deleted 阻止跳转到撤回或本地删除内容。
  const deleted =
    message.status === 'revoked' || message.status === 'deleted_local';
  // view 只消费 shared payload，不反向解析 transport DTO。
  const view = getChatMessageView(message, isGroup);
  // member 是群聊当前共享成员名称快照，单聊不参与。
  const member = isGroup ? membersByID.get(message.senderID.trim()) : undefined;
  // label 对齐 RN：本人优先“我”，群消息复用备注/群昵称/公开昵称 owner。
  const label = message.direction === 'outgoing'
    ? '我'
    : member
      ? resolveIMGroupMemberDisplayName(member, message.senderID)
      : message.senderID;
  return {
    message,
    label,
    text: deleted ? '引用的内容已删除' : view.text,
    deleted,
  };
}

/** 收集当前消息窗口内全部 type114 引用来源稳定身份。 */
export function getChatQuoteSourceMessageIDs(
  messages: readonly Message[],
): readonly string[] {
  /** sourceIDs 按页面消息顺序稳定去重，供 SQLite 批量读取。 */
  const sourceIDs = new Set<string>();
  for (const message of messages) {
    /** view 只从 canonical message body 读取 quote identity。 */
    const view = getChatMessageView(message, false);
    if (view.kind === 'quote' && view.quoteMessageID?.trim()) {
      sourceIDs.add(view.quoteMessageID.trim());
    }
  }
  return [...sourceIDs];
}

/** 判断消息是否匹配 Gateway quote 保存的 client/server 稳定身份。 */
export function matchesChatMessageStableID(
  message: Message,
  messageID: string,
): boolean {
  /** normalizedID 拒绝空身份误命中。 */
  const normalizedID = messageID.trim();
  return Boolean(normalizedID) && (
    message.clientMsgID.trim() === normalizedID ||
    message.serverMsgID?.trim() === normalizedID
  );
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
