import {
  formatIMUserDisplayName,
  resolveIMGroupMemberDisplayName,
  type Conversation,
  type ForwardOrigin,
  type Message,
  type WebIMGroupMember,
} from '@im28/im-sdk/web';

import { getChatMessageView } from './chat-message-view.js';

/** 转发摘要名称解析只消费来源会话和 shared 群成员展示快照。 */
export interface ChatForwardSenderContext {
  readonly currentUserID: string;
  readonly sourceConversation: Conversation | null;
  readonly sourceConversationTitle: string;
  readonly sourceMembers: readonly WebIMGroupMember[];
}

/** 按 frozen RN 规则为来源消息建立稳定发送者展示名。 */
export function resolveChatForwardSenderNames(
  messages: readonly Message[],
  context: ChatForwardSenderContext,
): ReadonlyMap<string, string> {
  /** currentUserID 用于把本人明确投影成 RN 文案“您自己”。 */
  const currentUserID = context.currentUserID.trim();
  /** sourceTitle 是单聊对端缺少消息级昵称时的可信展示回退。 */
  const sourceTitle = context.sourceConversationTitle.trim();
  /** membersByID 复用 SDK 已按备注、群昵称、公开昵称收敛的成员快照。 */
  const membersByID = new Map(
    context.sourceMembers.map(member => [member.userID.trim(), member] as const),
  );
  /** namesByID 确保相同发送者在多条消息中只解析一次。 */
  const namesByID = new Map<string, string>();
  for (const message of messages) {
    /** senderID 是消息与本人、群成员快照关联的稳定身份。 */
    const senderID = message.senderID.trim();
    if (!senderID || namesByID.has(senderID)) continue;
    if (currentUserID && senderID === currentUserID) {
      namesByID.set(senderID, '您自己');
      continue;
    }
    /** member 只在来源群聊中提供 RN 既定名称优先级。 */
    const member = membersByID.get(senderID);
    if (member) {
      namesByID.set(senderID, resolveIMGroupMemberDisplayName(member, senderID));
      continue;
    }
    /** directPeerName 只允许来源单聊标题替代对端 ID，不误用目标聊天标题。 */
    const directPeerName = context.sourceConversation?.type === 'single' ? sourceTitle : '';
    namesByID.set(senderID, directPeerName || formatIMUserDisplayName(senderID));
  }
  return namesByID;
}

/** 生成 frozen RN Composer 的单条正文或多发送者来源摘要。 */
export function buildChatForwardComposerSummary(
  messages: readonly Message[],
  senderNamesByID: ReadonlyMap<string, string>,
): string {
  if (!messages.length) return '请选择至少一条消息';
  if (messages.length === 1) {
    /** message 是唯一来源缓存实体。 */
    const message = messages[0]!;
    /** senderName 优先消费已解析展示名，缺失时使用隐私友好的用户格式。 */
    const senderName = senderNamesByID.get(message.senderID.trim()) ||
      formatIMUserDisplayName(message.senderID);
    /** view 复用聊天内容投影，不在 Composer 解析 Gateway body。 */
    const view = getChatMessageView(message, false);
    return `${senderName}：${view.text}`;
  }
  /** names 按消息顺序去重，保持 RN 来源摘要稳定。 */
  const names: string[] = [];
  for (const message of messages) {
    /** name 只使用当前发送者的最终展示投影。 */
    const name = senderNamesByID.get(message.senderID.trim()) ||
      formatIMUserDisplayName(message.senderID);
    if (name && !names.includes(name)) names.push(name);
  }
  if (names.length <= 2) return `来自：${names.join('，') || '未知用户'}`;
  return `来自：${names.slice(0, 2).join('，')}等${names.length}人`;
}

/** 为预览中新生成的转发来源补齐备注/昵称，既有历史来源保持原快照。 */
export function resolveChatForwardPreviewOrigin(
  message: Message,
  senderNamesByID: ReadonlyMap<string, string>,
): ForwardOrigin {
  /** existingOrigin 是消息已携带的历史转发来源，不应被当前发送者覆盖。 */
  const existingOrigin = message.forwardOrigin;
  if (existingOrigin) return existingOrigin;
  /** senderID 是本次新建来源头的稳定用户身份。 */
  const senderID = message.senderID.trim();
  /** senderName 已按来源会话解析为备注、群昵称或公开昵称。 */
  const senderName = senderNamesByID.get(senderID)?.trim();
  return {
    type: 'user',
    userID: senderID,
    ...(senderName ? { name: senderName } : {}),
  };
}
