import type {
  Conversation,
  WebIMContact,
  WebIMContactSearchUser,
  WebIMGroupSearchItem,
  WebIMJoinedGroup,
} from '@im28/im-sdk/web';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import rightIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import { isCurrentInteractionRequest } from '../../components/interaction/index.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { buildConversationRoute } from '../conversations/conversation-route.js';
import { ContactSearchGroupRow } from './ContactSearchGroupRow.js';
import {
  ContactSearchError,
  ContactSearchLoading,
  ContactSearchPageState,
} from './ContactSearchStates.js';
import { ContactSearchUserRow } from './ContactSearchUserRow.js';
import {
  buildContactSearchLocalResults,
  type ContactSearchLocalGroup,
  createContactSearchProfileState,
  getContactSearchDescription,
  readContactSearchRouteState,
  shouldDismissContactSearchKeyboard,
  toContactSearchDescriptionSource,
} from './contact-search-view.js';
import './contact-search-page.css';

/** 联系人搜索页面在本地与远端结果间的显式模式。 */
type ContactSearchMode = 'local' | 'server';

/** 服务器搜索的 RN 双页签。 */
type ContactSearchServerTab = 'friends' | 'groups';

/** RN 联系人搜索页通过 shared facades 读取本地好友及远端用户/群聊。 */
export function ContactSearchPage() {
  // runtime context 是页面唯一允许消费的 SDK owner。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // location 只恢复群申请页返回的受控关键词和页签。
  const location = useLocation();
  // navigate 负责进入群申请、规范群会话和取消返回。
  const navigate = useNavigate();
  // routeState 拒绝任意 history state 字段。
  const routeState = useMemo(() => readContactSearchRouteState(location.state), [location.state]);
  // contactsFacade 统一好友列表与远端用户搜索 operation。
  const contactsFacade = useMemo(() => runtime?.getSync().contacts ?? null, [runtime]);
  // groupsFacade 统一本地已加入群 cache 与完整同步。
  const groupsFacade = useMemo(() => runtime?.getSync().groups ?? null, [runtime]);
  // conversationsFacade 只读取当前账号会话 cache 作为 RN 同语义群搜索 fallback。
  const conversationsFacade = useMemo(
    () => runtime?.getSync().conversations ?? null,
    [runtime],
  );
  // groupApplicationsFacade 复用既有群搜索三态 owner。
  const groupApplicationsFacade = useMemo(
    () => runtime?.getSync().groupApplications ?? null,
    [runtime],
  );
  // keyword 保存当前输入，不写入 URL 或持久化存储。
  const [keyword, setKeyword] = useState(routeState.searchKeyword);
  // mode 对齐 RN 显式进入服务器搜索的交互。
  const [mode, setMode] = useState<ContactSearchMode>(routeState.serverTab ? 'server' : 'local');
  // serverTab 对齐 RN 好友/群聊页签并跨申请页返回恢复。
  const [serverTab, setServerTab] = useState<ContactSearchServerTab>(routeState.serverTab ?? 'friends');
  // contacts 保存唯一 facade 返回的好友列表。
  const [contacts, setContacts] = useState<readonly WebIMContact[]>([]);
  // joinedGroups 保存当前账号本地或完整同步后的已加入群快照。
  const [joinedGroups, setJoinedGroups] = useState<readonly WebIMJoinedGroup[]>([]);
  // localConversations 仅供本地群搜索补漏，不作为群权限或资料真相。
  const [localConversations, setLocalConversations] = useState<readonly Conversation[]>([]);
  // serverUsers 保存当前一次成功远端搜索结果。
  const [serverUsers, setServerUsers] = useState<readonly WebIMContactSearchUser[]>([]);
  // serverGroups 保存 shared facade 的关系三态结果。
  const [serverGroups, setServerGroups] = useState<readonly WebIMGroupSearchItem[]>([]);
  // openingGroupID 阻止已加入群的会话解析重复提交。
  const [openingGroupID, setOpeningGroupID] = useState('');
  // loadingLocal 标记好友列表读取状态。
  const [loadingLocal, setLoadingLocal] = useState(false);
  // loadingServer 标记真实 Gateway 用户搜索状态。
  const [loadingServer, setLoadingServer] = useState(false);
  // localError 保留好友读取失败，仍允许用户进入服务器搜索。
  const [localError, setLocalError] = useState<string | null>(null);
  // serverError 保留远端失败且不清空上次成功结果。
  const [serverError, setServerError] = useState<string | null>(null);
  // restoredSearchRef 保证 history state 只触发一次真实查询。
  const restoredSearchRef = useRef(false);
  // serverSearchRequestIDRef 隔离关键词或 Tab 变化后的迟到搜索结果。
  const serverSearchRequestIDRef = useRef(0);

  /** 独立加载好友与已加入群，任一失败时保留另一类成功结果。 */
  const loadLocalData = useCallback(async () => {
    if (!contactsFacade || !groupsFacade || !conversationsFacade || !snapshot.userID) return;
    setLoadingLocal(true);
    setLocalError(null);
    /** contactsTask 只更新好友成功结果。 */
    const contactsTask = contactsFacade.list().then(setContacts);
    /** groupsTask 先恢复 SQLite，再以完整远端快照替换。 */
    const groupsTask = (async (): Promise<void> => {
      setJoinedGroups(await groupsFacade.listCached());
      setJoinedGroups(await groupsFacade.sync({ pageSize: 50 }));
    })();
    /** conversationsTask 只读取 SQLite cache，不触发第二次远端会话同步。 */
    const conversationsTask = conversationsFacade.listCached().then(setLocalConversations);
    /** results 保留三个 facade 的独立失败事实。 */
    const results = await Promise.allSettled([contactsTask, groupsTask, conversationsTask]);
    if (results.some(result => result.status === 'rejected')) {
      setLocalError('加载联系人或群聊失败，请稍后重试');
    }
    setLoadingLocal(false);
  }, [contactsFacade, conversationsFacade, groupsFacade, snapshot.userID]);

  useEffect(() => {
    void loadLocalData();
  }, [loadLocalData]);

  // normalizedKeyword 控制空态和 SDK 调用参数。
  const normalizedKeyword = keyword.trim();
  // localResults 复用好友和已加入群的既有过滤规则。
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
  const openLocalGroup = useCallback(async (group: ContactSearchLocalGroup) => {
    if (!runtime || openingGroupID) return;
    setOpeningGroupID(group.groupID);
    setLocalError(null);
    try {
      /** conversation 由 SDK 校验群身份并返回规范会话 ID。 */
      const conversation = await runtime.getSync().conversations.openGroup({
        groupID: group.groupID,
        conversationID: group.conversationID,
      });
      /** route 关闭联系人搜索层并让 URL 自然切换到消息 Tab。 */
      const route = buildConversationRoute(conversation.conversationID, true);
      if (!route) throw new Error('群会话 ID 不可用');
      navigate(route.href, { replace: route.replace });
    } catch {
      setLocalError('该群聊暂不可进入');
    } finally {
      setOpeningGroupID('');
    }
  }, [navigate, openingGroupID, runtime]);

  /** 显式调用 shared facade 的真实 Gateway 用户或群聊搜索。 */
  const runServerSearch = useCallback(async (tab: ContactSearchServerTab = serverTab) => {
    if (!contactsFacade || !groupApplicationsFacade) return;
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
        const users = await contactsFacade.searchUsers(query);
        if (!isCurrentInteractionRequest(serverSearchRequestIDRef.current, requestID)) return;
        setServerUsers(users);
        setServerGroups([]);
      } else {
        /** groups 只在请求仍为最新代次时提交到群聊 Tab。 */
        const groups = await groupApplicationsFacade.search(query);
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
  }, [contactsFacade, groupApplicationsFacade, normalizedKeyword, serverTab]);

  useEffect(() => {
    if (restoredSearchRef.current || !routeState.serverTab || !normalizedKeyword) return;
    restoredSearchRef.current = true;
    void runServerSearch(routeState.serverTab);
  }, [normalizedKeyword, routeState.serverTab, runServerSearch]);

  /** 输入变化立即回到本地结果并使全部 pending 服务器请求失效。 */
  const updateKeyword = useCallback((nextKeyword: string) => {
    serverSearchRequestIDRef.current += 1;
    setKeyword(nextKeyword);
    setMode('local');
    setLoadingServer(false);
    setServerError(null);
  }, []);

  /** 根据 shared 群关系三态进入会话或既有申请页。 */
  const openServerGroup = useCallback(async (group: WebIMGroupSearchItem) => {
    if (!runtime || openingGroupID || group.status === 'pending') return;
    if (group.status === 'available') {
      navigate(`/groups/${encodeURIComponent(group.groupID)}/apply`, {
        replace: true,
        state: {
          sourceType: 'search',
          backHref: '/contacts/search',
          searchKeyword: normalizedKeyword,
          searchBackHref: routeState.searchBackHref,
        },
      });
      return;
    }
    setOpeningGroupID(group.groupID);
    setServerError(null);
    try {
      /** conversation 由 SDK 校验真实群身份并生成规范会话 ID。 */
      const conversation = await runtime.getSync().conversations.openGroup({
        groupID: group.groupID,
        conversationID: group.conversationID,
      });
      /** route 与本地群入口共用关闭搜索层和消息 Tab 路由语义。 */
      const route = buildConversationRoute(conversation.conversationID, true);
      if (!route) throw new Error('群会话 ID 不可用');
      navigate(route.href, { replace: route.replace });
    } catch {
      setServerError('该群聊暂不可进入');
    } finally {
      setOpeningGroupID('');
    }
  }, [navigate, normalizedKeyword, openingGroupID, routeState.searchBackHref, runtime]);

  if (restoring) return <ContactSearchPageState label="正在恢复会话" />;
  if (!runtime) {
    return <ContactSearchPageState label="运行配置不可用" detail={startupError} />;
  }
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main className="rn-contact-search-page">
      <section className="rn-contact-search-surface" aria-busy={loadingLocal || loadingServer}>
        <header className="rn-contact-search-header">
          <label className="rn-contact-search-box">
            <span className="sr-only">搜索联系人</span>
            <RNAssetIcon assetURL={searchIconURL} />
            <input
              autoFocus
              type="search"
              value={keyword}
              placeholder="搜索"
              autoCapitalize="none"
              autoComplete="off"
              enterKeyHint="search"
              onChange={event => updateKeyword(event.target.value)}
              onKeyDown={event => {
                if (!shouldDismissContactSearchKeyboard({
                  key: event.key,
                  isComposing: event.nativeEvent.isComposing,
                  repeat: event.repeat,
                })) return;
                event.preventDefault();
                event.currentTarget.blur();
              }}
            />
            {keyword ? (
              <button type="button" aria-label="清除" onClick={() => updateKeyword('')}>
                <RNAssetIcon assetURL={clearIconURL} />
              </button>
            ) : null}
          </label>
          <button
            type="button"
            className="rn-contact-search-cancel"
            onClick={() => navigate(routeState.searchBackHref, { replace: true })}
          >取消</button>
        </header>

        {mode === 'local' ? (
          <section className="rn-contact-search-results" aria-label="本地联系人搜索结果">
            {!normalizedKeyword ? (
              <p className="rn-contact-search-hint">支持搜索联系人ID、昵称、手机号、邮箱</p>
            ) : (
              <>
                <button
                  type="button"
                  className="rn-contact-search-server-row"
                  onClick={() => void runServerSearch('friends')}
                >
                  <span>去服务器搜索</span>
                  <RNAssetIcon assetURL={rightIconURL} />
                </button>
                {localError ? (
                  <ContactSearchError label={localError} onRetry={() => void loadLocalData()} />
                ) : null}
                {loadingLocal && contacts.length === 0 && joinedGroups.length === 0 ? (
                  <ContactSearchLoading label="正在加载联系人和群聊" />
                ) : localResults.length ? localResults.map(item => item.type === 'friend' ? (
                  <ContactSearchUserRow
                    key={item.key}
                    userID={item.contact.userID}
                    displayName={item.contact.displayName}
                    avatarURL={item.contact.avatarURL}
                    description={getContactSearchDescription(
                      toContactSearchDescriptionSource(item.contact),
                      normalizedKeyword,
                    )}
                    keyword={normalizedKeyword}
                    profileState={createContactSearchProfileState(
                      normalizedKeyword,
                      null,
                      routeState.searchBackHref,
                    )}
                  />
                ) : (
                  <ContactSearchGroupRow
                    key={item.key}
                    group={item.group}
                    keyword={normalizedKeyword}
                    opening={openingGroupID === item.group.groupID}
                    onOpen={() => void openLocalGroup(item.group)}
                  />
                )) : localError ? null : (
                  <p className="rn-contact-search-empty">去服务器进行搜索</p>
                )}
              </>
            )}
          </section>
        ) : (
          <section className="rn-contact-search-server" aria-label="服务器联系人和群聊搜索结果">
            <div className="rn-contact-search-tabs" role="tablist">
              <button type="button" role="tab" aria-selected={serverTab === 'friends'} className={serverTab === 'friends' ? 'is-active' : ''} onClick={() => void runServerSearch('friends')}>好友</button>
              <button type="button" role="tab" aria-selected={serverTab === 'groups'} className={serverTab === 'groups' ? 'is-active' : ''} onClick={() => void runServerSearch('groups')}>群聊</button>
            </div>
            {serverError ? (
              <ContactSearchError label={serverError} onRetry={() => void runServerSearch(serverTab)} />
            ) : null}
            {loadingServer ? (
              <ContactSearchLoading label="正在搜索" />
            ) : serverTab === 'friends' && serverUsers.length ? serverUsers.map(user => (
              <ContactSearchUserRow
                key={user.userID}
                userID={user.userID}
                displayName={user.displayName}
                avatarURL={user.avatarURL}
                description={getContactSearchDescription(user, normalizedKeyword)}
                keyword={normalizedKeyword}
                profileState={createContactSearchProfileState(
                  normalizedKeyword,
                  serverTab,
                  routeState.searchBackHref,
                )}
              />
            )) : serverTab === 'groups' && serverGroups.length ? serverGroups.map(group => (
              <ContactSearchGroupRow
                key={group.groupID}
                group={group}
                keyword={normalizedKeyword}
                opening={openingGroupID === group.groupID}
                onOpen={() => void openServerGroup(group)}
              />
            )) : serverError ? null : (
              <p className="rn-contact-search-empty">{serverTab === 'friends' ? '未找到相关好友' : '没有找到相关群聊'}</p>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
