import type { Conversation } from '@im28/im-sdk/web';

/** 判断摘要是否属于 RN 中可越过静音的当前用户定向提醒。 */
export function isConversationAtSelfPreview(previewText: string): boolean {
  // preview 只识别 RN 已发布的定向提醒形态，不把 @所有人当作 @当前用户。
  const preview = previewText.trim();
  return preview.endsWith(' @你') || preview.startsWith('[有人@我]');
}

/** RN 静音会话只有命中当前用户的高优先级提醒时继续显示数字角标。 */
export function shouldShowConversationUnreadBadge(
  conversation: Pick<Conversation, 'isMuted' | 'unreadCount'>,
  previewText: string,
): boolean {
  // unread 统一按会话行的非负整数规则解释。
  const unread = Math.max(0, Math.trunc(conversation.unreadCount));
  if (unread <= 0) return false;
  if (!conversation.isMuted) return true;
  return isConversationAtSelfPreview(previewText);
}
