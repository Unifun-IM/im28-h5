import type {
  Conversation,
  Message,
  WebIMDeleteMessagesResult,
  WebIMJoinedGroup,
} from '@im28/im-sdk/web';

import { getConversationTitle } from '../conversations/conversation-list-view.js';

/** 判断 RN 删除层是否允许展示“为所有人删除”。 */
export function canDeleteChatMessagesForAll(
  conversation: Conversation | null,
  messages: readonly Message[],
  joinedGroup: WebIMJoinedGroup | null,
): boolean {
  if (!conversation || !messages.length) return false;
  if (conversation.type !== 'group') return true;
  // canClearMessages 直接消费 shared 群管理 capability。
  const canClearMessages = joinedGroup?.permissions.canClearMessages === true;
  return canClearMessages || messages.every(message => message.direction === 'outgoing');
}

/** 按 RN 单聊和群聊语义生成双方删除按钮文案。 */
export function getChatDeleteForAllLabel(
  conversation: Conversation | null,
): string {
  if (conversation?.type === 'group') return '为我和所有群成员删除';
  // title 优先使用会话展示名，其次使用稳定目标 ID。
  const title = conversation ? getConversationTitle(conversation) : '对方';
  return `为我和 ${title} 删除`;
}

/** 将 SDK 逐项结果转换为不掩盖部分失败的页面反馈。 */
export function getChatDeleteResultNotice(
  result: WebIMDeleteMessagesResult,
): string {
  // succeeded 只统计 SDK 已写入 deleted_local 的消息。
  const succeeded = result.deletedClientMsgIDs.length;
  return result.failedCount
    ? `删除完成：${succeeded}条成功，${result.failedCount}条失败`
    : succeeded > 1
      ? `已删除${succeeded}条消息`
      : '消息已删除';
}
