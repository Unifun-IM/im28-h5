import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  Conversation,
  WebIMGroupMember,
  WebIMJoinedGroup,
  WebIMRuntime,
} from '@im28/im-sdk/web';

import {
  buildGroupMemberListEntries,
  getGroupMemberIndexes,
  shouldShowGroupMemberPresence,
  type GroupMemberListEntry,
} from './group-members-view.js';
import { useObservedUserPresence } from './useObservedUserPresence.js';

/** 群成员页面状态 owner 只接收当前账号与稳定会话身份。 */
interface UseGroupMembersPageStateOptions {
  readonly runtime: WebIMRuntime | null;
  readonly userID: string | null;
  readonly conversationID: string;
}

/** 群成员页面消费的只读快照、搜索投影与刷新动作。 */
interface GroupMembersPageStateBinding {
  readonly conversation: Conversation | null;
  readonly group: WebIMJoinedGroup | null;
  readonly members: readonly WebIMGroupMember[];
  readonly entries: readonly GroupMemberListEntry[];
  readonly indexes: readonly string[];
  readonly onlineByID: Readonly<Record<string, boolean>>;
  readonly showOnlineStatus: boolean;
  readonly memberCount: number;
  readonly keyword: string;
  readonly loading: boolean;
  readonly refreshing: boolean;
  readonly error: string | null;
  readonly changeKeyword: (keyword: string) => void;
  readonly loadMembers: () => Promise<void>;
  readonly refreshMembers: () => Promise<void>;
}

/** 承载群成员 cache-first、完整同步、搜索和在线状态观察。 */
export function useGroupMembersPageState({
  runtime,
  userID,
  conversationID,
}: UseGroupMembersPageStateOptions): GroupMembersPageStateBinding {
  // sync 生命周期绑定当前认证 runtime。
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  // conversation 保存当前账号缓存命中的群会话。
  const [conversation, setConversation] = useState<Conversation | null>(null);
  // group 保存人数、群模式等共享群事实。
  const [group, setGroup] = useState<WebIMJoinedGroup | null>(null);
  // members 保存完整 cache-first 成员快照。
  const [members, setMembers] = useState<readonly WebIMGroupMember[]>([]);
  // keyword 驱动名称和用户 ID 本地搜索。
  const [keyword, setKeyword] = useState('');
  // loading 覆盖首次 cache-first 读取。
  const [loading, setLoading] = useState(true);
  // refreshing 区分用户下拉刷新和首次恢复。
  const [refreshing, setRefreshing] = useState(false);
  // error 保留真实 SQLite 或 Gateway 失败。
  const [error, setError] = useState<string | null>(null);
  // loadIDRef 阻止离开或快速切换路由后的旧请求写回。
  const loadIDRef = useRef(0);

  /** 解析真实群会话并按 cache、远端顺序加载完整成员。 */
  const loadMembers = useCallback(async (): Promise<void> => {
    if (!sync || !userID || !conversationID) return;
    // loadID 标识本次 cache-first 请求链。
    const loadID = loadIDRef.current + 1;
    loadIDRef.current = loadID;
    setLoading(true);
    setError(null);
    try {
      // conversations 先读当前账号 SQLite，缺失时才完整同步。
      let conversations = await sync.conversations.listCached({ limit: 500 });
      // target 必须是当前账号真实群会话。
      let target = conversations.find(item => item.conversationID === conversationID);
      if (!target) {
        conversations = await sync.conversations.sync({ pageSize: 100 });
        target = conversations.find(item => item.conversationID === conversationID);
      }
      if (!target || target.type !== 'group' || !target.targetID.trim()) {
        throw new Error('群聊不存在或尚未同步');
      }
      if (loadIDRef.current !== loadID) return;
      setConversation(target);
      // groupID 只来自共享 Conversation targetID。
      const groupID = target.targetID.trim();
      // cachedGroups 保证弱网时先恢复人数等群事实。
      const cachedGroups = await sync.groups.listCached();
      if (loadIDRef.current !== loadID) return;
      setGroup(cachedGroups.find(item => item.groupID === groupID) ?? null);
      try {
        // cachedMembers 允许页面在远端刷新前立即展示。
        const cachedMembers = await sync.groupMembers.listCached(groupID);
        if (loadIDRef.current !== loadID) return;
        setMembers(cachedMembers);
      } catch {
        // cache 读取失败仍让 canonical 远端同步给出最终结果。
      }
      // refreshedGroups 先保证成员 facade 所需群 cache 存在。
      const refreshedGroups = await sync.groups.sync({ pageSize: 100 });
      if (loadIDRef.current !== loadID) return;
      setGroup(refreshedGroups.find(item => item.groupID === groupID) ?? null);
      // refreshedMembers 是完整全分页、success-only 替换后的结果。
      const refreshedMembers = await sync.groupMembers.sync(groupID, { pageSize: 100 });
      if (loadIDRef.current !== loadID) return;
      setMembers(refreshedMembers);
    } catch (cause) {
      if (loadIDRef.current === loadID) setError(readGroupMembersError(cause));
    } finally {
      if (loadIDRef.current === loadID) setLoading(false);
    }
  }, [conversationID, sync, userID]);

  useEffect(() => {
    void loadMembers();
    return () => {
      loadIDRef.current += 1;
    };
  }, [loadMembers]);

  /** 下拉刷新只调用既有群和成员 facade。 */
  const refreshMembers = useCallback(async (): Promise<void> => {
    if (!sync || !conversation || refreshing) return;
    // loadID 让显式刷新取代仍在途的首次请求。
    const loadID = loadIDRef.current + 1;
    loadIDRef.current = loadID;
    setLoading(false);
    setRefreshing(true);
    setError(null);
    try {
      // groupID 已由真实群会话验证。
      const groupID = conversation.targetID;
      // refreshedGroups 更新总人数和群状态。
      const refreshedGroups = await sync.groups.sync({ pageSize: 100 });
      if (loadIDRef.current !== loadID) return;
      setGroup(refreshedGroups.find(item => item.groupID === groupID) ?? null);
      // refreshedMembers 完成全分页后再一次写回页面。
      const refreshedMembers = await sync.groupMembers.sync(groupID, { pageSize: 100 });
      if (loadIDRef.current !== loadID) return;
      setMembers(refreshedMembers);
    } catch (cause) {
      if (loadIDRef.current === loadID) setError(readGroupMembersError(cause));
    } finally {
      if (loadIDRef.current === loadID) setRefreshing(false);
    }
  }, [conversation, refreshing, sync]);

  // entries 复用 SDK 名称 owner并仅做 RN 拼音列表投影。
  const entries = useMemo(
    () => buildGroupMemberListEntries(members, keyword),
    [keyword, members],
  );
  // indexes 只显示当前筛选结果真实存在的分组。
  const indexes = useMemo(() => getGroupMemberIndexes(entries), [entries]);
  // showOnlineStatus 只接受 shared mode=normal 判定。
  const showOnlineStatus = shouldShowGroupMemberPresence(group);
  // memberUserIDs 为当前完整成员快照建立一个批量 presence observation。
  const memberUserIDs = useMemo(() => members.map(member => member.userID), [members]);
  // onlineByID 仅保存当前页面内存状态，不进入成员 DTO 或 SQLite。
  const onlineByID = useObservedUserPresence({
    runtime,
    accountUserID: userID,
    userIDs: memberUserIDs,
    visible: showOnlineStatus,
  });
  // memberCount 优先使用群事实，冷 cache 时回退完整成员数。
  const memberCount = group?.memberCount || members.length;
  /** changeKeyword 暴露受控搜索更新而不泄漏 React setter。 */
  const changeKeyword = useCallback((nextKeyword: string) => setKeyword(nextKeyword), []);

  return {
    conversation, group, members, entries, indexes, onlineByID,
    showOnlineStatus, memberCount, keyword, loading, refreshing, error,
    changeKeyword, loadMembers, refreshMembers,
  };
}

/** 将群成员异常转换为不含凭据的页面文案。 */
function readGroupMembersError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '群成员加载失败，请稍后重试';
}
