import type { Conversation } from '@im28/im-sdk/web';

/** 聊天头部在线圆点的 RN 对齐状态。 */
export type ChatHeaderPresenceDot = 'online' | 'offline' | 'hidden' | 'none';

/** 聊天头部在线状态的纯展示投影。 */
export interface ChatHeaderPresenceView {
  readonly text: string;
  readonly dot: ChatHeaderPresenceDot;
}

/** 聊天头部在线状态投影参数。 */
interface BuildChatHeaderPresenceViewOptions {
  readonly conversation: Pick<Conversation, 'type' | 'targetID'> | null;
  readonly onlineByID: Readonly<Record<string, boolean>>;
  readonly groupMemberUserIDs: readonly string[];
  readonly showGroupOnlineStatus: boolean;
}

/** 按 RN 规则投影单聊在线/离线与普通群在线人数。 */
export function buildChatHeaderPresenceView({
  conversation,
  onlineByID,
  groupMemberUserIDs,
  showGroupOnlineStatus,
}: BuildChatHeaderPresenceViewOptions): ChatHeaderPresenceView {
  if (!conversation) return { text: '', dot: 'none' };
  if (conversation.type === 'group') {
    if (!showGroupOnlineStatus) return { text: '', dot: 'none' };
    /** uniqueMemberUserIDs 避免异常重复成员放大在线人数。 */
    const uniqueMemberUserIDs = Array.from(new Set(
      groupMemberUserIDs.map(userID => userID.trim()).filter(Boolean),
    ));
    /** onlineCount 只统计 shared presence 明确确认在线的成员。 */
    const onlineCount = uniqueMemberUserIDs.filter(userID => onlineByID[userID] === true).length;
    return { text: `${onlineCount}人在线`, dot: 'online' };
  }
  /** targetUserID 是单聊 presence 的唯一观察身份。 */
  const targetUserID = conversation.targetID.trim();
  if (!targetUserID || !Object.prototype.hasOwnProperty.call(onlineByID, targetUserID)) {
    return { text: '', dot: 'hidden' };
  }
  return onlineByID[targetUserID]
    ? { text: '在线', dot: 'online' }
    : { text: '离线', dot: 'offline' };
}
