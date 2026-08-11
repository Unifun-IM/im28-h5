import { useEffect, useState } from 'react';
import type { Conversation, WebIMGroupMember, WebIMSync } from '@im28/im-sdk/web';

/** 页面消费的群成员与 @所有人权限快照。 */
interface ChatMentionMembersState {
  readonly members: readonly WebIMGroupMember[];
  readonly canMentionAll: boolean;
}

/** 从 shared facade cache-first 恢复群聊提及候选。 */
export function useChatMentionMembers(
  conversation: Conversation | null,
  sync: WebIMSync | null,
  onError: (message: string) => void,
): ChatMentionMembersState {
  // state 不在页面复制群成员 cache，只保留当前 route projection。
  const [state, setState] = useState<ChatMentionMembersState>({ members: [], canMentionAll: false });
  useEffect(() => {
    if (!sync || conversation?.type !== 'group' || !conversation.targetID) {
      setState({ members: [], canMentionAll: false });
      return;
    }
    /** groupID 来自当前缓存会话 target identity。 */
    const groupID = conversation.targetID;
    /** active 阻止路由切换后的旧请求覆盖。 */
    let active = true;
    void (async () => {
      try {
        /** cachedGroups 提供 canMentionAll 权限快照。 */
        let cachedGroups = await sync.groups.listCached();
        if (!cachedGroups.some(group => group.groupID === groupID)) {
          cachedGroups = await sync.groups.sync();
        }
        /** group 是当前账号真实已加入群。 */
        const group = cachedGroups.find(item => item.groupID === groupID);
        if (!group) throw new Error('群聊不存在或尚未同步');
        /** cachedMembers 先呈现 SQLite 候选。 */
        const cachedMembers = await sync.groupMembers.listCached(groupID);
        if (active) setState({ members: cachedMembers, canMentionAll: group.canMentionAll });
        /** members 在完整远端成功后替换 cache。 */
        const members = await sync.groupMembers.sync(groupID);
        if (active) setState({ members, canMentionAll: group.canMentionAll });
      } catch (cause) {
        if (active) onError(cause instanceof Error ? cause.message : String(cause));
      }
    })();
    return () => { active = false; };
  }, [conversation, onError, sync]);
  return state;
}
