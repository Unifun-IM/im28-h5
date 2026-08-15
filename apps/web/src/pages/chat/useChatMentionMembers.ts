import { useEffect, useState } from 'react';
import {
  IM_GROUP_COMPOSER_MISSING_REASON,
  IM_GROUP_COMPOSER_RECOVERING_REASON,
  IM_GROUP_COMPOSER_UNRESOLVED_REASON,
  isIMNormalGroupMode,
  type Conversation,
  type WebIMGroupMember,
  type WebIMSync,
} from '@im28/im-sdk/web';

/** 页面消费的群成员与 @所有人权限快照。 */
interface ChatMentionMembersState {
  readonly groupID: string;
  readonly members: readonly WebIMGroupMember[];
  readonly canMentionAll: boolean;
  readonly composerUnavailableReason: string;
  readonly showOnlineStatus: boolean;
}

/** 非群聊或群快照未恢复前使用的 fail-neutral 页面投影。 */
const EMPTY_CHAT_MENTION_MEMBERS_STATE: ChatMentionMembersState = {
  groupID: '',
  members: [],
  canMentionAll: false,
  composerUnavailableReason: '',
  showOnlineStatus: false,
};

/** 从 shared facade cache-first 恢复群聊提及候选。 */
export function useChatMentionMembers(
  conversation: Conversation | null,
  sync: WebIMSync | null,
  onError: (message: string) => void,
): ChatMentionMembersState {
  // state 不在页面复制群成员 cache，只保留当前 route projection。
  const [state, setState] = useState<ChatMentionMembersState>(EMPTY_CHAT_MENTION_MEMBERS_STATE);
  // groupID 隔离草稿保存返回的新 Conversation 引用，避免逐字输入重拉群与成员。
  const groupID = conversation?.type === 'group' ? conversation.targetID.trim() : '';
  useEffect(() => {
    if (!sync || !groupID) {
      setState(EMPTY_CHAT_MENTION_MEMBERS_STATE);
      return;
    }
    /** active 阻止路由切换后的旧请求覆盖。 */
    let active = true;
    void (async () => {
      try {
        /** cachedGroups 提供 canMentionAll 权限快照。 */
        let cachedGroups = await sync.groups.listCached();
        /** group 是当前账号真实已加入群。 */
        let group = cachedGroups.find(item => item.groupID === groupID);
        /** groupLoadedRemotely 防止 cache miss 后重复请求同一群列表。 */
        const groupLoadedRemotely = !group;
        if (!group) {
          cachedGroups = await sync.groups.sync();
          group = cachedGroups.find(item => item.groupID === groupID);
        }
        if (!group) {
          if (active) setState({
            groupID,
            members: [],
            canMentionAll: false,
            composerUnavailableReason: IM_GROUP_COMPOSER_MISSING_REASON,
            showOnlineStatus: false,
          });
          throw new Error('群聊不存在或尚未同步');
        }
        /** cachedMembers 先呈现 SQLite 候选。 */
        const cachedMembers = await sync.groupMentions.listMembers(groupID);
        if (active) setState({
          groupID,
          members: cachedMembers,
          canMentionAll: group.canMentionAll,
          composerUnavailableReason: group.composerUnavailableReason ?? '',
          showOnlineStatus: isIMNormalGroupMode(group.mode),
        });
        /** refreshResults 独立收敛群权限和成员失败，避免成员失败吞掉新权限。 */
        const refreshResults = await Promise.allSettled([
          groupLoadedRemotely ? Promise.resolve(cachedGroups) : sync.groups.sync(),
          sync.groupMentions.syncMembers(groupID),
        ]);
        /** groupResult 只在完整群列表成功时替换缓存权限。 */
        const groupResult = refreshResults[0];
        /** memberResult 只在完整成员列表成功时替换缓存成员。 */
        const memberResult = refreshResults[1];
        /** refreshedGroup 在群刷新失败时保留 cache-first 权限快照。 */
        const refreshedGroup = groupResult.status === 'fulfilled'
          ? groupResult.value.find(item => item.groupID === groupID)
          : group;
        if (!refreshedGroup) {
          if (active) setState({
            groupID,
            members: [],
            canMentionAll: false,
            composerUnavailableReason: IM_GROUP_COMPOSER_MISSING_REASON,
            showOnlineStatus: false,
          });
          throw new Error('群聊不存在或已退出');
        }
        /** members 在成员刷新失败时保留 SQLite 候选。 */
        const members = memberResult.status === 'fulfilled'
          ? memberResult.value
          : cachedMembers;
        if (active) setState({
          groupID,
          members,
          canMentionAll: refreshedGroup.canMentionAll,
          composerUnavailableReason: refreshedGroup.composerUnavailableReason ?? '',
          showOnlineStatus: isIMNormalGroupMode(refreshedGroup.mode),
        });
        /** rejectedResult 只上报第一个真实刷新失败，缓存状态仍可继续使用。 */
        const rejectedResult = refreshResults.find(
          (result): result is PromiseRejectedResult => result.status === 'rejected',
        );
        if (active && rejectedResult) {
          onError(rejectedResult.reason instanceof Error
            ? rejectedResult.reason.message
            : String(rejectedResult.reason));
        }
      } catch (cause) {
        if (active) {
          setState(current => current.groupID === groupID
            ? current
            : {
                groupID,
                members: [],
                canMentionAll: false,
                composerUnavailableReason: IM_GROUP_COMPOSER_UNRESOLVED_REASON,
                showOnlineStatus: false,
              });
          onError(cause instanceof Error ? cause.message : String(cause));
        }
      }
    })();
    return () => { active = false; };
  }, [groupID, onError, sync]);
  if (groupID && state.groupID !== groupID) {
    return {
      groupID,
      members: [],
      canMentionAll: false,
      composerUnavailableReason: IM_GROUP_COMPOSER_RECOVERING_REASON,
      showOnlineStatus: false,
    };
  }
  return state;
}
