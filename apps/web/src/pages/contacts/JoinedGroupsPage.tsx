import { Link, Navigate } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { PullRefreshIndicator } from '../../components/interaction/index.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { usePullRefresh } from '../../hooks/use-pull-refresh.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { GroupOwnerQuitModal } from '../chat/GroupLifecycleSettings.js';
import { JoinedGroupActionMenu, JoinedGroupQuitModal } from './JoinedGroupActionMenu.js';
import { JoinedGroupRow } from './JoinedGroupRow.js';
import { useJoinedGroupsPageState } from './useJoinedGroupsPageState.js';
import './joined-groups-page.css';

/** RN 我的群聊页面使用 cache-first groups facade 和真实会话 facade。 */
export function JoinedGroupsPage() {
  // runtime context 是页面唯一 SDK 入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // state 复用唯一 Hook owner，不在页面复制 shared 事务。
  const state = useJoinedGroupsPageState({
    runtime,
    userID: snapshot.userID ?? '',
  });

  /** pullRefresh 把 RN RefreshControl 投影为浏览器顶部单指下拉。 */
  const pullRefresh = usePullRefresh({
    refreshing: state.refreshing,
    onRefresh: state.refreshGroups,
  });

  if (restoring) return <JoinedGroupsPageState label="正在恢复我的群聊" />;
  if (!runtime) {
    return <JoinedGroupsPageState label="运行配置不可用" detail={startupError} />;
  }
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main
      className="rn-joined-groups-page"
      aria-busy={state.loading || state.refreshing}
      onTouchStart={pullRefresh.onTouchStart}
      onTouchMove={pullRefresh.onTouchMove}
      onTouchEnd={pullRefresh.onTouchEnd}
      onTouchCancel={pullRefresh.onTouchCancel}
      onPointerDown={pullRefresh.onPointerDown}
      onPointerMove={pullRefresh.onPointerMove}
      onPointerUp={pullRefresh.onPointerUp}
      onPointerCancel={pullRefresh.onPointerCancel}
    >
      <section className="rn-joined-groups-surface">
        <PageNavbar className="rn-joined-groups-header">
          <Link to="/contacts" aria-label="返回通讯录">
            <RNAssetIcon assetURL={backIconURL} />
          </Link>
          <h1>我的群聊</h1>
          <span aria-hidden="true" />
        </PageNavbar>
        <label className="rn-joined-groups-search">
          <span className="sr-only">搜索群聊或群ID</span>
          <RNAssetIcon assetURL={searchIconURL} />
          <input
            type="search"
            value={state.keyword}
            placeholder="搜索群聊/群ID"
            onChange={event => state.changeKeyword(event.target.value)}
          />
          {state.keyword ? (
            <button type="button" aria-label="清除" onClick={() => state.changeKeyword('')}>
              <RNAssetIcon assetURL={clearIconURL} />
            </button>
          ) : null}
        </label>
        <PullRefreshIndicator
          refreshing={state.refreshing}
          armed={pullRefresh.armed}
          pullDistance={pullRefresh.pullDistance}
        />
        {state.error ? (
          <div className="rn-joined-groups-error" role="status">
            <span>{state.error}</span>
            <button type="button" onClick={() => void state.loadGroups()}>重试</button>
          </div>
        ) : null}
        <section className="rn-joined-groups-list" aria-label="我的群聊列表">
          {state.visibleGroups.map(group => (
            <JoinedGroupRow
              key={group.groupID}
              group={group}
              opening={state.openingGroupID === group.groupID}
              onOpen={() => void state.openGroup(group)}
              onOpenActions={state.openGroupActions}
            />
          ))}
          {state.loading && state.groups.length === 0 ? (
            <div className="rn-joined-groups-loading" aria-label="正在加载群聊">
              <span />
            </div>
          ) : null}
          {!state.loading && !state.error && state.visibleGroups.length === 0 ? (
            <p className="rn-joined-groups-empty">
              {state.keyword.trim() ? '没有找到相关群聊' : '暂无群聊'}
            </p>
          ) : null}
        </section>
      </section>
      <JoinedGroupActionMenu
        menu={state.actionMenu}
        pending={Boolean(state.openingGroupID) || state.lifecycleSubmitting}
        onClose={state.closeGroupActions}
        onAction={action => { void state.handleGroupAction(action); }}
      />
      <JoinedGroupQuitModal
        groupName={state.quitTarget?.name ?? ''}
        mode={state.quitMode === 'owner' ? null : state.quitMode}
        submitting={state.lifecycleSubmitting}
        onCancel={state.cancelQuit}
        onLeave={clearHistory => { void state.leaveGroup(clearHistory); }}
      />
      <GroupOwnerQuitModal
        open={state.quitMode === 'owner'}
        admin={state.ownerQuitAdmin}
        submitting={state.lifecycleSubmitting}
        onCancel={state.cancelQuit}
        onOpenAdmins={() => { void state.openOwnerAdminSettings(); }}
        onConfirm={clearHistory => { void state.leaveGroup(clearHistory); }}
      />
    </main>
  );
}

/** 我的群聊启动状态参数。 */
interface JoinedGroupsPageStateProps {
  readonly label: string;
  readonly detail?: string | null;
}

/** 统一承载我的群聊启动和配置错误。 */
function JoinedGroupsPageState({
  label,
  detail,
}: JoinedGroupsPageStateProps) {
  return (
    <main className="rn-joined-groups-state">
      <strong>{label}</strong>
      {detail ? <span>{detail}</span> : null}
    </main>
  );
}
