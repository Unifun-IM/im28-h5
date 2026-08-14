import type {
  Conversation,
  IMUserPresence,
  WebIMConversationListItem,
} from '@im28/im-sdk/web';

/** RN 兼容的单聊会话 ID 前缀。 */
const SINGLE_CONVERSATION_ID_PREFIXES = ['si_', 'single_', 'direct_'] as const;

/** 只从单聊会话解析 presence 对端，群聊和通知会话保持空值。 */
export function getConversationPresenceUserID(conversation: Conversation): string {
  if (conversation.type !== 'single') return '';
  /** targetID 是 Web 规范会话的首选对端身份。 */
  const targetID = conversation.targetID.trim();
  if (targetID) return targetID;
  /** conversationID 仅兼容 RN 已支持的历史单聊前缀。 */
  const conversationID = conversation.conversationID.trim();
  for (const prefix of SINGLE_CONVERSATION_ID_PREFIXES) {
    if (conversationID.startsWith(prefix)) return conversationID.slice(prefix.length).trim();
  }
  return '';
}

/** 从当前会话列表提取稳定、去重且排序后的单聊 presence 目标。 */
export function getConversationPresenceUserIDs(
  items: readonly WebIMConversationListItem[],
): readonly string[] {
  return Array.from(new Set(
    items.map(item => getConversationPresenceUserID(item.conversation)).filter(Boolean),
  )).sort();
}

/** 将一次完整 presence 查询投影为页面在线表，未返回用户保持未知。 */
export function projectConversationPresence(
  presence: readonly IMUserPresence[],
): Readonly<Record<string, boolean>> {
  /** onlineByID 仅保存服务端明确返回的状态，不把未知伪造成离线。 */
  const onlineByID: Record<string, boolean> = {};
  for (const status of presence) onlineByID[status.userID] = status.online;
  return onlineByID;
}

/** 将 WS presence 增量合并进当前页面投影。 */
export function mergeConversationPresence(
  current: Readonly<Record<string, boolean>>,
  presence: readonly IMUserPresence[],
): Readonly<Record<string, boolean>> {
  /** next 保留未出现在本次 realtime frame 中的其他单聊状态。 */
  const next = { ...current };
  for (const status of presence) next[status.userID] = status.online;
  return next;
}
