import { useCallback, useMemo } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { PullRefreshIndicator } from '../../components/interaction/index.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { usePullRefresh } from '../../hooks/use-pull-refresh.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { GroupInviteMemberTile } from '../chat/GroupInviteMemberTile.js';
import { CreateGroupSelectedFriends } from './CreateGroupSelectedFriends.js';
import { readGroupSearchCreateState } from './group-search-route.js';
import { useCreateGroupPageState } from './useCreateGroupPageState.js';
import '../chat/group-remove-members-page.css';
import './create-group-page.css';

/** 建群页可从普通入口或单聊设置的固定对端入口进入。 */
interface CreateGroupPageProps {
  readonly fromSingleSettings?: boolean;
}

/** RN 发起群聊页只编排好友选择与 shared groups.create facade。 */
export function CreateGroupPage({ fromSingleSettings = false }: CreateGroupPageProps) {
  /** navigate 只使用服务端返回的真实会话 ID。 */
  const navigate = useNavigate();
  /** location 只读取主 tab 入口，不接受任意外部返回地址。 */
  const location = useLocation();
  /** conversationID 仅在单聊设置模式下用于从当前账号缓存解析固定对端。 */
  const { conversationID = '' } = useParams();
  /** runtime 提供当前账号和唯一 SDK 聚合 facade。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** sync 只在 runtime 完成配置后存在。 */
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  /** initialSelectedUserIDs 只恢复受控建群搜索 route state。 */
  const initialSelectedUserIDs = useMemo(
    () => fromSingleSettings ? [] : readGroupSearchCreateState(location.state).selectedUserIDs,
    [fromSingleSettings, location.state],
  );
  /** openCreatedConversation 只使用 shared facade 返回的真实会话 ID。 */
  const openCreatedConversation = useCallback((createdConversationID: string): void => {
    navigate(`/conversations/${encodeURIComponent(createdConversationID)}`, { replace: true });
  }, [navigate]);
  /** groupState 统一承载 cache-first 数据、选择和创建事务。 */
  const groupState = useCreateGroupPageState({
    sync,
    userID: snapshot.userID ?? '',
    conversationID,
    fromSingleSettings,
    initialSelectedUserIDs,
    onCreated: openCreatedConversation,
  });
  /** 页面只读取 owner 暴露的稳定展示投影。 */
  const {
    keyword, selectedUserIDs, selectedReviewOpen, candidates, selectedCandidates,
    fixedUserIDs, selectedCount, canSubmit, allSelected, loading, refreshing,
    submitting, remoteCompleted, error,
  } = groupState;

  /** pullRefresh 把普通建群顶部单指下拉翻译为唯一好友刷新调用。 */
  const pullRefresh = usePullRefresh({
    refreshing: refreshing || fromSingleSettings,
    onRefresh: groupState.refreshContacts,
  });
  /** backHref 只允许两个 RN 主入口，刷新深链默认返回会话。 */
  const backHref = fromSingleSettings
    ? `/conversations/${encodeURIComponent(conversationID)}/settings`
    : readCreateGroupBackHref(location.state);

  if (restoring) return <CreateGroupState label="正在恢复会话" />;
  if (!runtime) return <CreateGroupState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main
      className="rn-create-group-page"
      aria-busy={loading || refreshing || submitting}
      onTouchStart={pullRefresh.onTouchStart}
      onTouchMove={pullRefresh.onTouchMove}
      onTouchEnd={pullRefresh.onTouchEnd}
      onTouchCancel={pullRefresh.onTouchCancel}
      onPointerDown={pullRefresh.onPointerDown}
      onPointerMove={pullRefresh.onPointerMove}
      onPointerUp={pullRefresh.onPointerUp}
      onPointerCancel={pullRefresh.onPointerCancel}
    >
      <section className="rn-create-group-surface">
        <PageNavbar className="rn-create-group-header">
          <Link to={backHref} aria-label="返回"><RNAssetIcon assetURL={backIconURL} /></Link>
          <h1>{fromSingleSettings ? `选择好友${selectedCount ? `（${selectedCount}）` : ''}` : '发起群聊'}</h1>
          <span aria-hidden="true" />
        </PageNavbar>
        {!fromSingleSettings && selectedCandidates.length ? (
          <CreateGroupSelectedFriends
            candidates={selectedCandidates}
            disabled={submitting || remoteCompleted}
            open={selectedReviewOpen}
            onOpenSearch={() => navigate('/groups/search', {
              replace: true,
              state: { selectedUserIDs: [...selectedUserIDs], backHref },
            })}
            onOpenReview={groupState.openSelectedReview}
            onClear={groupState.clearSelectedMembers}
            onCloseReview={groupState.closeSelectedReview}
            onToggle={groupState.toggleMember}
          />
        ) : fromSingleSettings ? (
          <label className="rn-create-group-search">
            <RNAssetIcon assetURL={searchIconURL} />
            <span className="sr-only">搜索好友</span>
            <input type="search" value={keyword} placeholder="搜索" onChange={event => groupState.updateKeyword(event.target.value)} />
          </label>
        ) : (
          <>
            <Link className="rn-create-group-search" to="/groups/search" replace state={{ selectedUserIDs: [...selectedUserIDs], backHref }}>
              <RNAssetIcon assetURL={searchIconURL} />
              <span>查找群聊</span>
            </Link>
            <Link className="rn-create-group-existing" to="/contacts/groups">
              <span>选择一个已有的群</span><span aria-hidden="true">›</span>
            </Link>
          </>
        )}
        {!fromSingleSettings ? (
          <PullRefreshIndicator
            refreshing={refreshing}
            armed={pullRefresh.armed}
            pullDistance={pullRefresh.pullDistance}
          />
        ) : null}
        <p className="rn-create-group-caption">选择好友创建群聊</p>
        {error ? <p className="rn-create-group-error" role="alert">{error}</p> : null}
        <section className="rn-group-remove-grid" aria-label="可选择好友">
          {candidates.length ? (
            <button
              className="rn-group-remove-tile"
              type="button"
              aria-label="选择全部好友"
              aria-pressed={allSelected}
              onClick={groupState.toggleAllMembers}
            >
              <span className={`rn-group-remove-avatar rn-create-group-all-avatar${allSelected ? ' is-selected' : ''}`}>
                <span>ALL</span>
                {allSelected ? <em>✓</em> : null}
              </span>
              <span>全部好友</span>
            </button>
          ) : null}
          {candidates.map(candidate => (
            <GroupInviteMemberTile
              key={candidate.contact.userID}
              candidate={candidate}
              selected={selectedUserIDs.has(candidate.contact.userID)}
              onToggle={groupState.toggleMember}
            />
          ))}
        </section>
        {!loading && !error && !candidates.length ? (
          <p className="rn-create-group-empty">暂无可选择好友</p>
        ) : null}
        <footer className="rn-create-group-footer">
          <span>{canSubmit ? `已选 ${selectedCount + fixedUserIDs.length} 位好友` : fromSingleSettings ? '至少再选择 1 位好友' : '至少选择 2 位好友'}</span>
          <button type="button" disabled={!canSubmit || submitting || remoteCompleted} onClick={() => { void groupState.submitCreation(); }}>
            {submitting ? '创建中' : '创建群聊'}
          </button>
        </footer>
      </section>
    </main>
  );
}

/** 只接受首页两个已认证主 tab 作为创建页返回目标。 */
function readCreateGroupBackHref(state: unknown): '/conversations' | '/contacts' {
  if (!state || typeof state !== 'object') return '/conversations';
  /** backHref 来自本应用 HomeActionMenu，不接受外部或任意路由。 */
  const backHref = (state as { readonly backHref?: unknown }).backHref;
  return backHref === '/contacts' ? '/contacts' : '/conversations';
}

/** 创建群启动状态参数。 */
interface CreateGroupStateProps {
  readonly label: string;
  readonly detail?: string | null;
}

/** 统一承载 runtime 恢复和配置失败。 */
function CreateGroupState({ label, detail }: CreateGroupStateProps) {
  return <main className="rn-create-group-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

export default CreateGroupPage;
