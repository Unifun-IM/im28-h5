import type {
  Message,
  WebIMGroupMember,
} from '@im28/im-sdk/web';
import { resolveIMGroupMemberDisplayName } from '@im28/im-sdk/web';

/** 群消息发送人视图只消费 SDK 已按备注、群昵称、公开昵称解析的成员快照。 */
export interface ChatGroupSenderView {
  readonly userID: string;
  readonly displayName: string;
  readonly avatarURL: string;
  readonly roleLabel: '群主' | '管理员' | '';
}

/** 群消息头像进入成员资料页所需的稳定 SPA 位置。 */
export interface ChatGroupMemberProfileLocation {
  readonly pathname: string;
  readonly state: {
    readonly backHref: string;
    readonly groupConversationID: string;
  };
}

/** 只用真实会话与发送人身份构造群成员资料入口。 */
export function buildChatGroupMemberProfileLocation(
  conversationID: string,
  userID: string,
): ChatGroupMemberProfileLocation | null {
  /** normalizedConversationID 拒绝空会话候选。 */
  const normalizedConversationID = conversationID.trim();
  /** normalizedUserID 拒绝无发送人身份的历史消息。 */
  const normalizedUserID = userID.trim();
  if (!normalizedConversationID || !normalizedUserID) return null;
  /** backHref 保持返回当前聊天详情页，不携带消息或权限事实。 */
  const backHref = `/conversations/${encodeURIComponent(normalizedConversationID)}`;
  return {
    pathname: `/contacts/users/${encodeURIComponent(normalizedUserID)}`,
    state: {
      backHref,
      groupConversationID: normalizedConversationID,
    },
  };
}

/** 将群成员列表建立为稳定用户身份索引。 */
export function indexChatGroupMembers(
  members: readonly WebIMGroupMember[],
): ReadonlyMap<string, WebIMGroupMember> {
  /** entries 丢弃空身份，避免无效成员覆盖真实发送人。 */
  const entries = members
    .map(member => [member.userID.trim(), member] as const)
    .filter(([userID]) => Boolean(userID));
  return new Map(entries);
}

/** 从共享成员快照解析一条群消息的发送人展示资料。 */
export function getChatGroupSenderView(
  message: Message,
  membersByID: ReadonlyMap<string, WebIMGroupMember>,
): ChatGroupSenderView {
  /** userID 是消息与群成员快照的稳定关联键。 */
  const userID = message.senderID.trim();
  /** member 已由 SDK 合成备注、群昵称与公开资料。 */
  const member = membersByID.get(userID);
  return {
    userID,
    displayName: member
      ? resolveIMGroupMemberDisplayName(member, userID)
      : userID,
    avatarURL: member?.avatarURL.trim() || '',
    roleLabel: member?.role === 'owner'
      ? '群主'
      : member?.role === 'admin'
        ? '管理员'
        : '',
  };
}

/** 用当前群成员名称替换 mention 正文中的身份或旧昵称快照。 */
export function resolveChatMentionDisplayText(
  message: Message,
  text: string,
  membersByID: ReadonlyMap<string, WebIMGroupMember>,
): string {
  /** displayText 仅改变页面投影，不修改持久化消息原文和 mention 身份。 */
  let displayText = text;
  for (const mention of message.mentions ?? []) {
    if (mention.type !== 'user' || !mention.userID) continue;
    /** userID 是 mention 的权威身份。 */
    const userID = mention.userID.trim();
    /** displayName 复用 SDK 群成员最终展示名。 */
    /** member 是当前群成员的共享分字段名称快照。 */
    const member = membersByID.get(userID);
    /** displayName 使用 SDK 的唯一 RN 优先级 owner。 */
    const displayName = member
      ? resolveIMGroupMemberDisplayName(member, userID)
      : mention.nickname?.trim() || userID;
    if (!displayName || displayName === userID) continue;
    displayText = displayText.replaceAll(`@${userID}`, `@${displayName}`);
    /** snapshotName 兼容历史消息正文保存旧群昵称的情况。 */
    const snapshotName = mention.nickname?.trim() || '';
    if (snapshotName && snapshotName !== displayName) {
      displayText = displayText.replaceAll(`@${snapshotName}`, `@${displayName}`);
    }
  }
  return displayText;
}
