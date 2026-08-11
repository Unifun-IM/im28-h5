import type { Message, PresetEmojiDocument } from '@im28/im-sdk/web';

import { formatChatMessageTime, getChatMessageView } from './chat-message-view.js';

/** 从缓存消息构造 composer 可编辑的普通文本文档。 */
export function getChatMessageEditDocument(message: Message): PresetEmojiDocument {
  // view 复用聊天气泡的唯一 payload 投影规则。
  const view = getChatMessageView(message, false);
  return {
    text: view.kind === 'text' ? view.text : '',
    entities: view.kind === 'text' ? view.entities ?? [] : [],
  };
}

/** 按 RN 规则优先展示编辑时间，否则展示原发送时间。 */
export function formatChatMessageTimeText(message: Message): string {
  // editedAt 只读取 shared realtime/active-edit owner 写入的 localEx 字段。
  const editedAt = readEditedAt(message.localEx);
  return editedAt
    ? `已编辑 ${formatChatMessageTime(editedAt)}`
    : formatChatMessageTime(message.sendTime);
}

/** 从未知 localEx 中读取有效编辑时间。 */
function readEditedAt(localEx: string | undefined): number {
  if (!localEx?.trim()) return 0;
  try {
    // parsed 只接受普通对象，损坏缓存按未编辑降级。
    const parsed = JSON.parse(localEx) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return 0;
    // value 同时兼容历史字符串时间戳。
    const value = Number((parsed as Record<string, unknown>).editedAt);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}
