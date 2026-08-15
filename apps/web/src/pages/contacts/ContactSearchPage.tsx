import { useCallback, useMemo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import rightIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
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
  createContactSearchProfileState,
  getContactSearchDescription,
  readContactSearchRouteState,
  shouldDismissContactSearchKeyboard,
  toContactSearchDescriptionSource,
} from './contact-search-view.js';
import { useContactSearchPageState } from './useContactSearchPageState.js';
import './contact-search-page.css';

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
  // sync 是页面传入状态 owner 的唯一 shared SDK facade。
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  /** openConversation 将规范会话身份投影为关闭搜索层的 SPA route。 */
  const openConversation = useCallback((conversationID: string): void => {
    /** route 拒绝空身份并固定 replace 关闭搜索历史项。 */
    const route = buildConversationRoute(conversationID, true);
    if (!route) throw new Error('群会话 ID 不可用');
    navigate(route.href, { replace: route.replace });
  }, [navigate]);
  /** openGroupApplication 只构造既有群申请页允许的受控 Router state。 */
  const openGroupApplication = useCallback((group: { readonly groupID: string }, keyword: string): void => {
    navigate(`/groups/${encodeURIComponent(group.groupID)}/apply`, {
      replace: true,
      state: {
        sourceType: 'search',
        backHref: '/contacts/search',
        searchKeyword: keyword,
        searchBackHref: routeState.searchBackHref,
      },
    });
  }, [navigate, routeState.searchBackHref]);
  // searchState 统一拥有本地缓存、服务器请求和打开群聊状态。
  const searchState = useContactSearchPageState({
    sync,
    userID: snapshot.userID ?? '',
    initialKeyword: routeState.searchKeyword,
    initialServerTab: routeState.serverTab,
    onOpenConversation: openConversation,
    onOpenGroupApplication: openGroupApplication,
  });
  // 搜索页面只解构渲染和交互所需的稳定 binding。
  const {
    keyword, normalizedKeyword, mode, serverTab, contacts, joinedGroups,
    localResults, serverUsers, serverGroups, openingGroupID, loadingLocal,
    loadingServer, localError, serverError, loadLocalData, runServerSearch,
    updateKeyword, openLocalGroup, openServerGroup,
  } = searchState;

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
