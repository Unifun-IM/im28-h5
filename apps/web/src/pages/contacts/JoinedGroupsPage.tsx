import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Conversation, WebIMJoinedGroup } from '@im28/im-sdk/web';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { PullRefreshIndicator, useAppToast } from '../../components/interaction/index.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { usePullRefresh } from '../../hooks/use-pull-refresh.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { buildGroupCardShareRoute } from '../chat/group-card-share-route.js';
import { JoinedGroupActionMenu, JoinedGroupQuitModal } from './JoinedGroupActionMenu.js';
import { JoinedGroupRow } from './JoinedGroupRow.js';
import {
  filterJoinedGroups,
} from './joined-group-view.js';
import {
  buildJoinedGroupOwnerTransferRoute,
  buildJoinedGroupProfileRoute,
  getJoinedGroupActionMenuState,
  getJoinedGroupQuitMode,
  type JoinedGroupActionKey,
  type JoinedGroupActionMenuState,
  type JoinedGroupActionPoint,
  type JoinedGroupQuitMode,
} from './joined-group-actions-view.js';
import './joined-groups-page.css';

/** RN 我的群聊页面使用 cache-first groups facade 和真实会话 facade。 */
export function JoinedGroupsPage() {
  // runtime context 是页面唯一 SDK 入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // navigate 只负责 React Router SPA 页面切换。
  const navigate = useNavigate();
  // toast 统一承载打开群聊和退群 mutation 反馈。
  const { toast } = useAppToast();
  // groups 保存 SQLite 或完整远端同步结果。
  const [groups, setGroups] = useState<readonly WebIMJoinedGroup[]>([]);
  // keyword 驱动群名和群 ID 本地搜索。
  const [keyword, setKeyword] = useState('');
  // loading 覆盖首次缓存读取和远端刷新。
  const [loading, setLoading] = useState(false);
  /** refreshing 区分用户下拉刷新和首次 cache-first 恢复。 */
  const [refreshing, setRefreshing] = useState(false);
  // openingGroupID 阻止重复打开群会话。
  const [openingGroupID, setOpeningGroupID] = useState('');
  // actionMenu 保存当前长按群和 RN 气泡位置。
  const [actionMenu, setActionMenu] = useState<JoinedGroupActionMenuState | null>(null);
  // quitTarget 保存等待退出确认的真实群快照。
  const [quitTarget, setQuitTarget] = useState<WebIMJoinedGroup | null>(null);
  // quitMode 只消费 shared lifecycle capability。
  const [quitMode, setQuitMode] = useState<JoinedGroupQuitMode | null>(null);
  // lifecycleSubmitting 阻止破坏性群动作重复提交。
  const [lifecycleSubmitting, setLifecycleSubmitting] = useState(false);
  // lifecycleBlockedGroupID 阻止远端已成功动作被页面重放。
  const [lifecycleBlockedGroupID, setLifecycleBlockedGroupID] = useState('');
  // error 显示真实数据库、Gateway 或会话失败。
  const [error, setError] = useState<string | null>(null);

  /** 先读取当前账号 SQLite，再用完整 Gateway 快照刷新。 */
  const loadGroups = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID) return;
    // facade 绑定 runtime 的 account database 和 Gateway owners。
    const facade = runtime.getSync().groups;
    setLoading(true);
    setError(null);
    try {
      // cachedGroups 允许离线或弱网时立即展示上次完整快照。
      const cachedGroups = await facade.listCached();
      setGroups(cachedGroups);
      // syncedGroups 只在远端全分页成功并替换 SQLite 后返回。
      const syncedGroups = await facade.sync({ pageSize: 50 });
      setGroups(syncedGroups);
    } catch (cause) {
      setError(readJoinedGroupError(cause));
    } finally {
      setLoading(false);
    }
  }, [runtime, snapshot.userID]);

  useEffect(() => { void loadGroups(); }, [loadGroups]);

  /** 下拉刷新只执行 shared groups 全量同步，失败时保留当前列表。 */
  const refreshGroups = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID || refreshing) return;
    setRefreshing(true);
    setError(null);
    try {
      setGroups(await runtime.getSync().groups.sync({ pageSize: 50 }));
    } catch (cause) {
      setError(readJoinedGroupError(cause));
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, runtime, snapshot.userID]);

  /** pullRefresh 把 RN RefreshControl 投影为浏览器顶部单指下拉。 */
  const pullRefresh = usePullRefresh({
    refreshing,
    onRefresh: refreshGroups,
  });

  /** 通过 shared 会话 facade 解析规范群会话身份。 */
  const resolveGroupConversation = useCallback(async (
    group: WebIMJoinedGroup,
  ): Promise<Conversation | null> => {
    if (!runtime || openingGroupID) return null;
    setOpeningGroupID(group.groupID);
    setError(null);
    try {
      // conversation 由 SDK 统一完成 cache、Gateway 身份校验和 SQLite 收敛。
      const conversation = await runtime.getSync().conversations.openGroup({
        groupID: group.groupID,
        conversationID: group.conversationID,
      });
      return conversation;
    } catch (cause) {
      toast.error(readJoinedGroupError(cause, '打开群聊失败'));
      return null;
    } finally {
      setOpeningGroupID('');
    }
  }, [openingGroupID, runtime, toast]);

  /** 解析 canonical Conversation 后进入聊天页。 */
  const openGroup = useCallback(async (group: WebIMJoinedGroup): Promise<void> => {
    /** conversation 只能来自 shared openGroup facade。 */
    const conversation = await resolveGroupConversation(group);
    if (conversation) navigate(`/conversations/${encodeURIComponent(conversation.conversationID)}`);
  }, [navigate, resolveGroupConversation]);

  /** 按长按点和 shared capability 打开群列表动作气泡。 */
  function openGroupActions(group: WebIMJoinedGroup, point: JoinedGroupActionPoint): void {
    setActionMenu(getJoinedGroupActionMenuState({
      group,
      point,
      viewportWidth: globalThis.innerWidth,
      viewportHeight: globalThis.innerHeight,
    }));
  }

  /** 菜单动作只进入现有 SPA 路由或 shared lifecycle 前置确认。 */
  async function handleGroupAction(action: JoinedGroupActionKey): Promise<void> {
    /** group 在关闭菜单前冻结，避免异步期间目标漂移。 */
    const group = actionMenu?.group;
    setActionMenu(null);
    if (!group) return;
    if (action === 'quit') {
      setQuitTarget(group);
      setQuitMode(getJoinedGroupQuitMode(group));
      return;
    }
    /** conversation 为分享和资料路由提供 canonical 身份。 */
    const conversation = await resolveGroupConversation(group);
    if (!conversation) return;
    navigate(action === 'share-card'
      ? buildGroupCardShareRoute(conversation.conversationID)
      : buildJoinedGroupProfileRoute(conversation.conversationID, true));
  }

  /** 普通成员确认后仅调用 shared groupLifecycle.leave。 */
  async function leaveGroup(clearHistory: boolean): Promise<void> {
    if (!runtime || !quitTarget || lifecycleSubmitting || lifecycleBlockedGroupID === quitTarget.groupID) return;
    setLifecycleSubmitting(true);
    setError(null);
    try {
      /** result 区分本地收敛和远端成功但本地待同步。 */
      const result = await runtime.getSync().groupLifecycle.leave({
        groupID: quitTarget.groupID,
        clearHistory,
      });
      setQuitMode(null);
      if (result.cacheState === 'remote-only') {
        setLifecycleBlockedGroupID(quitTarget.groupID);
        setError('退群已在服务端完成，本地缓存同步失败；为避免重复操作，请刷新群列表');
        return;
      }
      setGroups(current => current.filter(group => group.groupID !== quitTarget.groupID));
      setQuitTarget(null);
      toast.success('已退出群聊');
    } catch (cause) {
      toast.error(readJoinedGroupError(cause, '退出群聊失败'));
    } finally {
      setLifecycleSubmitting(false);
    }
  }

  /** 群主退出入口解析真实会话后进入既有群主转让页。 */
  async function transferOwnerBeforeLeave(): Promise<void> {
    if (!quitTarget) return;
    /** conversation 防止群 ID 被错误拼成会话路由。 */
    const conversation = await resolveGroupConversation(quitTarget);
    if (!conversation) return;
    setQuitMode(null);
    navigate(buildJoinedGroupOwnerTransferRoute(conversation.conversationID));
  }

  // visibleGroups 保持 SDK 服务端顺序并应用本地搜索。
  const visibleGroups = useMemo(
    () => filterJoinedGroups(groups, keyword),
    [groups, keyword],
  );

  if (restoring) return <JoinedGroupsPageState label="正在恢复我的群聊" />;
  if (!runtime) {
    return <JoinedGroupsPageState label="运行配置不可用" detail={startupError} />;
  }
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main
      className="rn-joined-groups-page"
      aria-busy={loading || refreshing}
      onTouchStart={pullRefresh.onTouchStart}
      onTouchMove={pullRefresh.onTouchMove}
      onTouchEnd={pullRefresh.onTouchEnd}
      onTouchCancel={pullRefresh.onTouchCancel}
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
            value={keyword}
            placeholder="搜索群聊/群ID"
            onChange={event => setKeyword(event.target.value)}
          />
          {keyword ? (
            <button type="button" aria-label="清除" onClick={() => setKeyword('')}>
              <RNAssetIcon assetURL={clearIconURL} />
            </button>
          ) : null}
        </label>
        <PullRefreshIndicator
          refreshing={refreshing}
          armed={pullRefresh.armed}
          pullDistance={pullRefresh.pullDistance}
        />
        {error ? (
          <div className="rn-joined-groups-error" role="status">
            <span>{error}</span>
            <button type="button" onClick={() => void loadGroups()}>重试</button>
          </div>
        ) : null}
        <section className="rn-joined-groups-list" aria-label="我的群聊列表">
          {visibleGroups.map(group => (
            <JoinedGroupRow
              key={group.groupID}
              group={group}
              opening={openingGroupID === group.groupID}
              onOpen={() => void openGroup(group)}
              onOpenActions={openGroupActions}
            />
          ))}
          {loading && groups.length === 0 ? (
            <div className="rn-joined-groups-loading" aria-label="正在加载群聊">
              <span />
            </div>
          ) : null}
          {!loading && !error && visibleGroups.length === 0 ? (
            <p className="rn-joined-groups-empty">
              {keyword.trim() ? '没有找到相关群聊' : '暂无群聊'}
            </p>
          ) : null}
        </section>
      </section>
      <JoinedGroupActionMenu
        menu={actionMenu}
        pending={Boolean(openingGroupID) || lifecycleSubmitting}
        onClose={() => setActionMenu(null)}
        onAction={action => { void handleGroupAction(action); }}
      />
      <JoinedGroupQuitModal
        groupName={quitTarget?.name ?? ''}
        mode={quitMode}
        submitting={lifecycleSubmitting}
        onCancel={() => {
          if (!lifecycleSubmitting) {
            setQuitMode(null);
            setQuitTarget(null);
          }
        }}
        onLeave={clearHistory => { void leaveGroup(clearHistory); }}
        onTransferOwner={() => { void transferOwnerBeforeLeave(); }}
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

/** 将未知异常转换为不包含敏感数据的页面文案。 */
function readJoinedGroupError(
  cause: unknown,
  fallback = '群聊加载失败，请稍后重试',
): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}
