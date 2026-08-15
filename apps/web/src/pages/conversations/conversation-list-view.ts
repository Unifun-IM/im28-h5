import type {
  Conversation,
  WebIMConversationListItem,
} from '@im28/im-sdk/web';
import {
  formatIMUserDisplayName,
} from '@im28/im-sdk/web';

/** 使用 RN 相同的 name -> title 回退顺序。 */
export function getConversationTitle(conversation: Conversation): string {
  /** cachedName 允许旧缓存中保留完整用户 ID，但不把它直接暴露给用户。 */
  const cachedName = conversation.name?.trim() ?? '';
  if (conversation.type === 'single' && (!cachedName || cachedName === conversation.targetID)) {
    return formatIMUserDisplayName(conversation.targetID) || '会话';
  }
  return cachedName || conversation.targetID || '会话';
}

/** 汇总非静音会话未读数，供 RN 标题“聊天(n)”展示。 */
export function getConversationUnreadTotal(
  items: readonly WebIMConversationListItem[],
): number {
  return items.reduce(
    (total, item) =>
      item.conversation.isMuted
        ? total
        : total + Math.max(0, Math.trunc(item.conversation.unreadCount)),
    0,
  );
}

/** 按 RN 循环规则选择当前可见位置之后的下一条未读会话。 */
export function getNextUnreadConversationID(
  items: readonly WebIMConversationListItem[],
  lastTargetConversationID: string,
  firstVisibleIndex: number,
): string {
  /** unreadItems 保留列表原顺序和索引，手动未读也视为未读状态。 */
  const unreadItems = items.flatMap((item, index) => (
    Math.max(0, Math.trunc(item.conversation.unreadCount)) > 0 ||
    item.conversation.manualUnread === true
      ? [{ conversationID: item.conversation.conversationID, index }]
      : []
  ));
  if (!unreadItems.length) return '';
  /** lastTargetIndex 存在时直接循环到下一条未读。 */
  const lastTargetIndex = unreadItems.findIndex(
    item => item.conversationID === lastTargetConversationID,
  );
  if (lastTargetIndex >= 0) {
    return unreadItems[(lastTargetIndex + 1) % unreadItems.length]?.conversationID ?? '';
  }
  /** nextVisible 优先选首个可见会话之后的未读项，无结果则回到第一条。 */
  const nextVisible = unreadItems.find(item => item.index > firstVisibleIndex);
  return (nextVisible ?? unreadItems[0])?.conversationID ?? '';
}

/** 将未读数限制为 RN 会话 badge 的 999+ 上限。 */
export function formatConversationUnread(unreadCount: number): string {
  // unread 是经过界面容错后的非负整数。
  const unread = Math.max(0, Math.trunc(unreadCount));
  return unread > 999 ? '999+' : String(unread);
}

/** 将秒或毫秒时间戳格式化为 RN 会话列表时间。 */
export function formatConversationListTime(
  timestamp: number,
  now = new Date(),
): string {
  if (!timestamp) {
    return '';
  }
  // milliseconds 同时兼容 Gateway 秒和本地毫秒时间戳。
  const milliseconds =
    timestamp > 1_000_000_000_000 ? timestamp : timestamp * 1000;
  // date 是当前行最新消息的本地时间表示。
  const date = new Date(milliseconds);
  if (date.toDateString() === now.toDateString()) {
    return `今日 ${formatClock(date)}`;
  }
  // yesterday 只用于与 RN 相同的昨日标签判断。
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨日 ${formatClock(date)}`;
  }
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

/** 格式化固定两位小时和分钟。 */
function formatClock(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
