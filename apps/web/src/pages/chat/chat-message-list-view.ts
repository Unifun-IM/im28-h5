import type { Message } from '@im28/im-sdk/web';

import {
  getChatMessageView,
  type ChatMessageView,
} from './chat-message-view.js';

/** RN 连续消息对应的气泡圆角位置。 */
export type ChatBubbleGroupPosition = 'single' | 'first' | 'middle' | 'last';

/** 消息列表插入日期行后的稳定条目。 */
export type ChatMessageListEntry =
  | { readonly kind: 'date'; readonly key: string; readonly label: string }
  | {
      readonly kind: 'message';
      readonly key: string;
      readonly message: Message;
      readonly view: ChatMessageView;
      readonly groupPosition: ChatBubbleGroupPosition;
      readonly showSenderName: boolean;
      readonly showSenderAvatar: boolean;
    };

/** 将 Repository newest-first 消息构造成 RN 阅读顺序与连续气泡关系。 */
export function buildChatMessageListEntries(
  messages: readonly Message[],
  isGroup: boolean,
  currentUserID = '',
): readonly ChatMessageListEntry[] {
  // ordered 保持页面从旧到新的自然文档流。
  const ordered = [...messages].reverse();
  // entries 同时承载日期分隔和真实消息行。
  const entries: ChatMessageListEntry[] = [];
  ordered.forEach((message, index) => {
    // view 在分组判断前完成系统消息归类。
    const view = getChatMessageView(message, isGroup, currentUserID);
    // previous 是视觉上方的较旧消息。
    const previous = ordered[index - 1];
    // next 是视觉下方的较新消息。
    const next = ordered[index + 1];
    // dateKey 控制每日只插入一个日期行。
    const dateKey = getMessageDateKey(message.sendTime);
    // previousDateKey 用于识别新日期的首条消息。
    const previousDateKey = previous
      ? getMessageDateKey(previous.sendTime)
      : '';
    if (dateKey && dateKey !== previousDateKey) {
      entries.push({
        kind: 'date',
        key: `date-${dateKey}`,
        label: formatMessageDate(message.sendTime),
      });
    }
    // samePrevious 表示当前气泡与视觉上方连续。
    const samePrevious = isSameSenderMessage(previous, message, isGroup);
    // sameNext 表示当前气泡与视觉下方连续。
    const sameNext = isSameSenderMessage(next, message, isGroup);
    entries.push({
      kind: 'message',
      key: message.clientMsgID,
      message,
      view,
      groupPosition: getBubbleGroupPosition(samePrevious, sameNext),
      showSenderName:
        isGroup && message.direction === 'incoming' && !samePrevious,
      showSenderAvatar:
        isGroup && message.direction === 'incoming' && !sameNext,
    });
  });
  return entries;
}

/** 判断相邻消息是否属于 RN 同发送者连续气泡。 */
function isSameSenderMessage(
  candidate: Message | undefined,
  message: Message,
  isGroup: boolean,
): boolean {
  if (!candidate) return false;
  // candidateView 阻止系统消息参与连续气泡分组。
  const candidateView = getChatMessageView(candidate, isGroup);
  // messageView 阻止当前系统消息参与连续气泡分组。
  const messageView = getChatMessageView(message, isGroup);
  return (
    candidateView.kind !== 'system' &&
    messageView.kind !== 'system' &&
    Boolean(message.senderID) &&
    candidate.senderID === message.senderID
  );
}

/** 按上下相邻关系返回 RN 四态连续气泡位置。 */
function getBubbleGroupPosition(
  samePrevious: boolean,
  sameNext: boolean,
): ChatBubbleGroupPosition {
  if (samePrevious && sameNext) return 'middle';
  if (sameNext) return 'first';
  if (samePrevious) return 'last';
  return 'single';
}

/** 将消息时间转换为本地日期分组键。 */
function getMessageDateKey(timestamp: number): string {
  if (!timestamp) return '';
  // date 是消息所在的本地自然日。
  const date = new Date(toMilliseconds(timestamp));
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/** 使用 RN 今天/昨天/月日规则格式化日期分隔。 */
function formatMessageDate(timestamp: number, now = new Date()): string {
  // date 是待展示消息日期。
  const date = new Date(toMilliseconds(timestamp));
  if (date.toDateString() === now.toDateString()) return '今天';
  // yesterday 用于本地自然日比较。
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return '昨天';
  // monthDay 对齐 RN 中文日期短格式。
  const monthDay = `${date.getMonth() + 1}月${date.getDate()}日`;
  return date.getFullYear() === now.getFullYear()
    ? monthDay
    : `${date.getFullYear()}年${monthDay}`;
}

/** 秒或毫秒时间戳统一转换为毫秒。 */
function toMilliseconds(timestamp: number): number {
  return timestamp > 1_000_000_000_000 ? timestamp : timestamp * 1000;
}
