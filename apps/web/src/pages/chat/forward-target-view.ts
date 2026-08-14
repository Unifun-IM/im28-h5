import type {
  Conversation,
  WebIMContact,
  WebIMJoinedGroup,
} from '@im28/im-sdk/web';
import { formatIMUserDisplayName } from '@im28/im-sdk/web';

import { getConversationTitle } from '../conversations/conversation-list-view.js';

/** 转发选择器的三个 RN 数据源。 */
export type ChatForwardTargetKind = 'conversation' | 'friend' | 'group';

/** 选择器只持有打开目标所需身份和只读展示字段。 */
export interface ChatForwardTarget {
  readonly key: string;
  readonly kind: ChatForwardTargetKind;
  readonly id: string;
  readonly conversationID: string;
  readonly title: string;
  readonly description: string;
  readonly avatarURL: string;
}

/** 将最近会话投影为稳定转发目标。 */
export function conversationToChatForwardTarget(
  conversation: Conversation,
): ChatForwardTarget {
  // isGroup 决定目标身份和描述，不从 conversation ID 猜测类型。
  const isGroup = conversation.type === 'group';
  return {
    key: `conversation:${conversation.conversationID}`,
    kind: 'conversation',
    id: conversation.targetID,
    conversationID: conversation.conversationID,
    title: getConversationTitle(conversation),
    description: isGroup ? `群聊 · ${conversation.targetID}` : `好友 · ${conversation.targetID}`,
    avatarURL: conversation.faceURL?.trim() ?? '',
  };
}

/** 将好友 facade 记录投影为待打开的单聊目标。 */
export function contactToChatForwardTarget(contact: WebIMContact): ChatForwardTarget {
  return {
    key: `friend:${contact.userID}`,
    kind: 'friend',
    id: contact.userID,
    conversationID: '',
    title: contact.displayName || formatIMUserDisplayName(contact.userID),
    description: `好友 · ${contact.userID}`,
    avatarURL: contact.avatarURL,
  };
}

/** 将已加入群记录投影为目标，会话身份仍由 facade/cache 验证。 */
export function groupToChatForwardTarget(group: WebIMJoinedGroup): ChatForwardTarget {
  return {
    key: `group:${group.groupID}`,
    kind: 'group',
    id: group.groupID,
    conversationID: group.conversationID,
    title: group.name || group.groupID,
    description: group.memberCount > 0 ? `群聊 · ${group.memberCount}人` : `群聊 · ${group.groupID}`,
    avatarURL: group.avatarURL,
  };
}

/** 按展示名、描述和稳定目标 ID 本地筛选当前 tab。 */
export function filterChatForwardTargets(
  targets: readonly ChatForwardTarget[],
  keyword: string,
): readonly ChatForwardTarget[] {
  // query 统一大小写和首尾空白，不改变 facade 顺序。
  const query = keyword.trim().toLocaleLowerCase();
  if (!query) return targets;
  return targets.filter(target =>
    `${target.title}\n${target.description}\n${target.id}`
      .toLocaleLowerCase()
      .includes(query),
  );
}

/** 从真实会话 cache 中解析群目标，不制造约定式 conversation ID。 */
export function findForwardGroupConversationID(
  target: Pick<ChatForwardTarget, 'id' | 'conversationID'>,
  conversations: readonly Conversation[],
): string {
  // exact 优先接受 groups facade 直接返回且 cache 已存在的会话。
  const exact = target.conversationID
    ? conversations.find(item => item.conversationID === target.conversationID)
    : undefined;
  if (exact?.type === 'group' && exact.targetID === target.id) {
    return exact.conversationID;
  }
  // byTarget 仅匹配明确 group 类型和 target ID。
  return conversations.find(
    item => item.type === 'group' && item.targetID === target.id,
  )?.conversationID ?? '';
}
