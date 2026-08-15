import type {
  WebIMContact,
  WebIMContactSearchUser,
  WebIMGroupSearchItem,
  WebIMJoinedGroup,
  WebIMSync,
  Conversation,
} from '@im28/im-sdk/web';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { isCurrentInteractionRequest } from '../../components/interaction/index.js';
import {
  buildContactSearchLocalResults,
  type ContactSearchLocalGroup,
  type ContactSearchLocalResult,
} from './contact-search-view.js';

/** 联系人搜索页面在本地与远端结果间的显式模式。 */
export type ContactSearchMode = 'local' | 'server';

/** 服务器搜索的 RN 双页签。 */
export type ContactSearchServerTab = 'friends' | 'groups';

/** 搜索状态 owner 只接收 shared facade、恢复状态和受控路由回调。 */
interface UseContactSearchPageStateOptions {
  readonly sync: WebIMSync | null;
  readonly userID: string;
  readonly initialKeyword: string;
  readonly initialServerTab: ContactSearchServerTab | null;
  readonly onOpenConversation: (conversationID: string) => void;
  readonly onOpenGroupApplication: (group: WebIMGroupSearchItem, keyword: string) => void;
}

/** 联系人搜索页面消费的缓存、远端搜索和打开群聊状态。 */
interface ContactSearchPageStateBinding {
  readonly keyword: string;
  readonly normalizedKeyword: string;
  readonly mode: ContactSearchMode;
  readonly serverTab: ContactSearchServerTab;
  readonly contacts: readonly WebIMContact[];
  readonly joinedGroups: readonly WebIMJoinedGroup[];
  readonly localResults: readonly ContactSearchLocalResult[];
  readonly serverUsers: readonly WebIMContactSearchUser[];
  readonly serverGroups: readonly WebIMGroupSearchItem[];
  readonly openingGroupID: string;
  readonly loadingLocal: boolean;
  readonly loadingServer: boolean;
  readonly localError: string | null;
  readonly serverError: string | null;
  readonly loadLocalData: () => Promise<void>;
  readonly runServerSearch: (tab?: ContactSearchServerTab) => Promise<void>;
  readonly updateKeyword: (keyword: string) => void;
  readonly openLocalGroup: (group: ContactSearchLocalGroup) => Promise<void>;
  readonly openServerGroup: (group: WebIMGroupSearchItem) => Promise<void>;
}

/** 统一拥有联系人搜索的本地快照、请求代次和群会话打开编排。 */
export function useContactSearchPageState({
  sync,
  userID,
  initialKeyword,
  initialServerTab,
  onOpenConversation,
  onOpenGroupApplication,
}: UseContactSearchPageStateOptions): ContactSearchPageStateBinding {
  /** keyword 保存当前输入，不写入 URL 或持久化存储。 */
  const [keyword, setKeyword] = useState(initialKeyword);
  /** mode 对齐 RN 显式进入服务器搜索的交互。 */
  const [mode, setMode] = useState<ContactSearchMode>(initialServerTab ? 'server' : 'local');
  /** serverTab 对齐 RN 好友/群聊页签并跨申请页返回恢复。 */
  const [serverTab, setServerTab] = useState<ContactSearchServerTab>(initialServerTab ?? 'friends');
  /** contacts 保存唯一 facade 返回的好友列表。 */
  const [contacts, setContacts] = useState<readonly WebIMContact[]>([]);
  /** joinedGroups 保存当前账号本地或完整同步后的已加入群快照。 */
  const [joinedGroups, setJoinedGroups] = useState<readonly WebIMJoinedGroup[]>([]);
  /** localConversations 仅供本地群搜索补漏，不作为群权限或资料真相。 */
  const [localConversations, setLocalConversations] = useState<readonly Conversation[]>([]);
  /** serverUsers 保存当前一次成功远端搜索结果。 */
  const [serverUsers, setServerUsers] = useState<readonly WebIMContactSearchUser[]>([]);
  /** serverGroups 保存 shared facade 的关系三态结果。 */
  const [serverGroups, setServerGroups] = useState<readonly WebIMGroupSearchItem[]>([]);
  /** openingGroupID 阻止已加入群的会话解析重复提交。 */
  const [openingGroupID, setOpeningGroupID] = useState('');
  /** loadingLocal 标记好友和群聊列表读取状态。 */
  const [loadingLocal, setLoadingLocal] = useState(false);
  /** loadingServer 标记真实 Gateway 搜索状态。 */
  const [loadingServer, setLoadingServer] = useState(false);
  /** localError 保留本地读取失败，仍允许进入服务器搜索。 */
  const [localError, setLocalError] = useState<string | null>(null);
  /** serverError 保留远端失败且不清空上次成功结果。 */
  const [serverError, setServerError] = useState<string | null>(null);
  /** restoredSearchRef 保证 history state 只触发一次真实查询。 */
  const restoredSearchRef = useRef(false);
  /** serverSearchRequestIDRef 隔离关键词或 Tab 变化后的迟到结果。 */
  const serverSearchRequestIDRef = useRef(0);

  /** 独立加载好友、已加入群和会话 fallback，保留各自成功结果。 */
  const loadLocalData = useCallback(async (): Promise<void> => {
    if (!sync || !userID) return;
    setLoadingLocal(true);
    setLocalError(null);
    /** contactsTask 只更新好友成功结果。 */
    const contactsTask = sync.contacts.list().then(setContacts);
    /** groupsTask 先恢复 SQLite，再以完整远端快照替换。 */
    const groupsTask = (async (): Promise<void> => {
      setJoinedGroups(await sync.groups.listCached());
      setJoinedGroups(await sync.groups.sync({ pageSize: 50 }));
    })();
    /** conversationsTask 只读 SQLite cache，不触发第二次远端会话同步。 */
    const conversationsTask = sync.conversations.listCached().then(setLocalConversations);
    /** results 保留三个 facade 的独立失败事实。 */
    const results = await Promise.allSettled([contactsTask, groupsTask, conversationsTask]);
    if (results.some(result => result.status === 'rejected')) {
      setLocalError('加载联系人或群聊失败，请稍后重试');
    }
    setLoadingLocal(false);
  }, [sync, userID]);

  useEffect(() => { void loadLocalData(); }, [loadLocalData]);

  /** normalizedKeyword 控制空态和 SDK 调用参数。 */
  const normalizedKeyword = keyword.trim();
  /** localResults 复用好友和已加入群的既有过滤规则。 */
  const localResults = useMemo(
    () => buildContactSearchLocalResults(
      contacts,
      joinedGroups,
      localConversations,
      normalizedKeyword,
    ),
    [contacts, joinedGroups, localConversations, normalizedKeyword],
  );

  /** 本地已加入群只通过 canonical openGroup facade 进入会话。 */
  const openLocalGroup = useCallback(async (group: ContactSearchLocalGroup): Promise<void> => {
    if (!sync || openingGroupID) return;
    setOpeningGroupID(group.groupID);
    setLocalError(null);
    try {
      /** conversation 由 SDK 校验群身份并返回规范会话 ID。 */
      const conversation = await sync.conversations.openGroup({
        groupID: group.groupID,
        conversationID: group.conversationID,
      });
      onOpenConversation(conversation.conversationID);
    } catch {
      setLocalError('该群聊暂不可进入');
    } finally {
      setOpeningGroupID('');
    }
  }, [onOpenConversation, openingGroupID, sync]);

  /** 显式调用 shared facade 的真实 Gateway 用户或群聊搜索。 */
  const runServerSearch = useCallback(async (
    tab: ContactSearchServerTab = serverTab,
  ): Promise<void> => {
    if (!sync) return;
    /** requestID 使每次 Tab 点击立即成为唯一可提交的搜索请求。 */
    const requestID = serverSearchRequestIDRef.current + 1;
    serverSearchRequestIDRef.current = requestID;
    /** query 冻结本次请求关键词，避免迟到结果读取后续输入。 */
    const query = normalizedKeyword;
    setServerTab(tab);
    setMode('server');
    setServerError(null);
    if (!query) {
      setServerUsers([]);
      setServerGroups([]);
      setLoadingServer(false);
      return;
    }
    setLoadingServer(true);
    try {
      if (tab === 'friends') {
        /** users 只在请求仍为最新代次时提交到好友 Tab。 */
        const users = await sync.contacts.searchUsers(query);
        if (!isCurrentInteractionRequest(serverSearchRequestIDRef.current, requestID)) return;
        setServerUsers(users);
        setServerGroups([]);
      } else {
        /** groups 只在请求仍为最新代次时提交到群聊 Tab。 */
        const groups = await sync.groupApplications.search(query);
        if (!isCurrentInteractionRequest(serverSearchRequestIDRef.current, requestID)) return;
        setServerGroups(groups);
        setServerUsers([]);
      }
    } catch {
      if (!isCurrentInteractionRequest(serverSearchRequestIDRef.current, requestID)) return;
      setServerError('搜索失败，请重试');
    } finally {
      if (isCurrentInteractionRequest(serverSearchRequestIDRef.current, requestID)) {
        setLoadingServer(false);
      }
    }
  }, [normalizedKeyword, serverTab, sync]);

  useEffect(() => {
    if (restoredSearchRef.current || !initialServerTab || !normalizedKeyword) return;
    restoredSearchRef.current = true;
    void runServerSearch(initialServerTab);
  }, [initialServerTab, normalizedKeyword, runServerSearch]);

  /** 输入变化立即回到本地结果并使全部 pending 服务器请求失效。 */
  const updateKeyword = useCallback((nextKeyword: string): void => {
    serverSearchRequestIDRef.current += 1;
    setKeyword(nextKeyword);
    setMode('local');
    setLoadingServer(false);
    setServerError(null);
  }, []);

  /** 根据 shared 群关系三态进入会话或既有申请页。 */
  const openServerGroup = useCallback(async (group: WebIMGroupSearchItem): Promise<void> => {
    if (!sync || openingGroupID || group.status === 'pending') return;
    if (group.status === 'available') {
      onOpenGroupApplication(group, normalizedKeyword);
      return;
    }
    setOpeningGroupID(group.groupID);
    setServerError(null);
    try {
      /** conversation 由 SDK 校验真实群身份并生成规范会话 ID。 */
      const conversation = await sync.conversations.openGroup({
        groupID: group.groupID,
        conversationID: group.conversationID,
      });
      onOpenConversation(conversation.conversationID);
    } catch {
      setServerError('该群聊暂不可进入');
    } finally {
      setOpeningGroupID('');
    }
  }, [normalizedKeyword, onOpenConversation, onOpenGroupApplication, openingGroupID, sync]);

  return {
    keyword, normalizedKeyword, mode, serverTab, contacts, joinedGroups,
    localResults, serverUsers, serverGroups, openingGroupID, loadingLocal,
    loadingServer, localError, serverError, loadLocalData, runServerSearch,
    updateKeyword, openLocalGroup, openServerGroup,
  };
}
