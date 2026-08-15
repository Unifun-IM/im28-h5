import { useMemo } from 'react';
import type { Conversation, WebIMGroupMember, WebIMRuntime, WebIMSync } from '@im28/im-sdk/web';

import { buildChatHeaderPresenceView } from './chat-header-presence-view.js';
import { useChatGroupApplicationCount } from './useChatGroupApplicationCount.js';
import { useObservedUserPresence } from './useObservedUserPresence.js';

/** 聊天头部投影只接收当前会话、成员和 runtime 事实。 */
interface UseChatPageHeaderStateOptions {
  readonly accountUserID: string | null;
  readonly conversation: Conversation | null;
  readonly dataVersion: number;
  readonly members: readonly WebIMGroupMember[];
  readonly runtime: WebIMRuntime | null;
  readonly showGroupOnlineStatus: boolean;
  readonly sync: WebIMSync | null;
}

/** 统一投影聊天头部在线状态和群申请角标。 */
export function useChatPageHeaderState({
  accountUserID,
  conversation,
  dataVersion,
  members,
  runtime,
  showGroupOnlineStatus,
  sync,
}: UseChatPageHeaderStateOptions) {
  // presenceUserIDs 只观察当前单聊对端或普通群完整成员快照。
  const presenceUserIDs = useMemo(() => {
    if (!conversation) return [];
    if (conversation.type === 'single') return conversation.targetID ? [conversation.targetID] : [];
    if (!showGroupOnlineStatus) return [];
    return members.map(member => member.userID);
  }, [conversation, members, showGroupOnlineStatus]);
  // onlineByID 复用 shared presence 的初始查询与实时收敛。
  const onlineByID = useObservedUserPresence({
    runtime,
    accountUserID,
    userIDs: presenceUserIDs,
    visible: presenceUserIDs.length > 0,
  });
  // presence 严格复刻 RN 单聊与普通群头部展示规则。
  const presence = useMemo(() => buildChatHeaderPresenceView({
    conversation,
    onlineByID,
    groupMemberUserIDs: members.map(member => member.userID),
    showGroupOnlineStatus,
  }), [conversation, members, onlineByID, showGroupOnlineStatus]);
  // groupApplicationCount 随 shared runtime 数据版本恢复群待审核数量。
  const groupApplicationCount = useChatGroupApplicationCount(conversation, sync, dataVersion);

  return { presence, groupApplicationCount };
}
