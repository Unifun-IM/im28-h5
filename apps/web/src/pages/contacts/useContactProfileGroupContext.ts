import { useEffect, useState } from 'react';
import {
  resolveIMGroupMemberDisplayName,
  type WebIMRuntime,
} from '@im28/im-sdk/web';

import type { ContactProfileGroupContextView } from './contact-profile-view.js';

/** 群成员资料上下文 hook 的输入。 */
interface UseContactProfileGroupContextOptions {
  readonly runtime: WebIMRuntime | null;
  readonly accountUserID: string | null;
  readonly conversationID: string;
  readonly targetUserID: string;
}

/** 无群入口时返回不影响普通联系人资料的稳定空态。 */
const ABSENT_GROUP_CONTEXT: ContactProfileGroupContextView = {
  status: 'absent',
  displayName: '',
};

/** 从当前账号 shared facades 校验群、成员和互加好友设置。 */
export function useContactProfileGroupContext({
  runtime,
  accountUserID,
  conversationID,
  targetUserID,
}: UseContactProfileGroupContextOptions): ContactProfileGroupContextView {
  /** context 只保存已校验群事实的页面内存投影。 */
  const [context, setContext] = useState<ContactProfileGroupContextView>(
    conversationID ? { status: 'loading', displayName: '' } : ABSENT_GROUP_CONTEXT,
  );

  useEffect(() => {
    if (!conversationID) {
      setContext(ABSENT_GROUP_CONTEXT);
      return;
    }
    if (!runtime || !accountUserID || !targetUserID) {
      setContext({ status: 'error', displayName: '' });
      return;
    }
    /** active 阻止离开资料页后的异步结果回写。 */
    let active = true;
    setContext({ status: 'loading', displayName: '' });
    /** sync 是当前认证 runtime 的唯一聚合 facade。 */
    const sync = runtime.getSync();
    /** publish 只接受同一真实群内已存在的目标成员。 */
    const publish = async (
      conversations: Awaited<ReturnType<typeof sync.conversations.listCached>>,
      groups: Awaited<ReturnType<typeof sync.groups.listCached>>,
      loadMembers: (groupID: string) => Promise<Awaited<ReturnType<typeof sync.groupMembers.listCached>>>,
      authoritative: boolean,
    ): Promise<boolean> => {
      /** conversation 必须是当前账号缓存中的真实群会话。 */
      const conversation = conversations.find(item => item.conversationID === conversationID);
      if (!conversation || conversation.type !== 'group' || !conversation.targetID.trim()) return false;
      /** groupID 只来自已验证 Conversation.targetID。 */
      const groupID = conversation.targetID.trim();
      /** group 必须与真实会话目标严格匹配。 */
      const group = groups.find(item => item.groupID === groupID);
      if (!group) return false;
      /** members 通过同一 shared groupMembers facade 读取。 */
      const members = await loadMembers(groupID);
      /** member 必须确实存在于该群，不信任 Router state 的目标关系。 */
      const member = members.find(item => item.userID === targetUserID);
      if (!member) return false;
      if (active) {
        setContext({
          status: authoritative || group.allowMemberAddFriend === false ? 'ready' : 'loading',
          displayName: resolveIMGroupMemberDisplayName(member, targetUserID),
          ...(typeof group.allowMemberAddFriend === 'boolean'
            ? { allowMemberAddFriend: group.allowMemberAddFriend }
            : {}),
        });
      }
      return true;
    };
    void (async () => {
      try {
        /** cached 数据先恢复已验证上下文，但仍保持后续权威刷新。 */
        const [cachedConversations, cachedGroups] = await Promise.all([
          sync.conversations.listCached({ limit: 500 }),
          sync.groups.listCached(),
        ]);
        await publish(
          cachedConversations,
          cachedGroups,
          groupID => sync.groupMembers.listCached(groupID),
          false,
        ).catch(() => false);
        /** refreshed 数据重新确认会话、群设置和成员身份。 */
        const [refreshedConversations, refreshedGroups] = await Promise.all([
          sync.conversations.sync({ pageSize: 100 }),
          sync.groups.sync({ pageSize: 100 }),
        ]);
        /** published 标记远端刷新后的上下文是否仍合法。 */
        const published = await publish(
          refreshedConversations,
          refreshedGroups,
          groupID => sync.groupMembers.sync(groupID, { pageSize: 100 }),
          true,
        );
        if (!published && active) setContext({ status: 'error', displayName: '' });
      } catch {
        if (active) setContext({ status: 'error', displayName: '' });
      }
    })();
    return () => {
      active = false;
    };
  }, [accountUserID, conversationID, runtime, targetUserID]);

  return context;
}
