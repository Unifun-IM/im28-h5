import { useCallback, useEffect, useMemo, useState } from 'react';
import type { UIEvent } from 'react';
import type { WebIMConversationListItem } from '@im28/im-sdk/web';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import emptyChatIconURL from '../../assets/rn/assets/icons/empty-chat.svg';
import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { HomeActionMenu } from '../../components/home-actions/HomeActionMenu.js';
import { PullRefreshIndicator } from '../../components/interaction/index.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { usePullRefresh } from '../../hooks/use-pull-refresh.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { ConversationActionMenu } from './ConversationActionMenu.js';
import { ConversationDeleteSheet } from './ConversationDeleteSheet.js';
import { ConversationRow } from './ConversationRow.js';
import { getConversationPresenceUserID } from './conversation-presence-view.js';
import {
  filterArchivedConversationItems,
  mergeArchivedConversationItems,
} from './conversation-archive-view.js';
import { useConversationActions } from './useConversationActions.js';
import { useConversationPresence } from './useConversationPresence.js';
import './conversations-page.css';
import './archived-conversations-page.css';

/** 归档页每次从账号 SQLite 读取的稳定行数。 */
const ARCHIVED_PAGE_SIZE = 30;

/** RN 归档会话页通过共享 SDK cache/sync 与 React Router 独立承载。 */
export function ArchivedConversationsPage() {
  /** navigate 在最后一条归档被移除后恢复 RN 的自动返回行为。 */
  const navigate = useNavigate();
  /** runtime context 是页面唯一 SDK facade owner。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** sync 仅在 runtime 配置完成后存在。 */
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  /** items 保存已加载的归档会话缓存页。 */
  const [items, setItems] = useState<readonly WebIMConversationListItem[]>([]);
  /** keyword 对齐 RN 归档页本地搜索框。 */
  const [keyword, setKeyword] = useState('');
  /** loading 只覆盖首次无缓存加载。 */
  const [loading, setLoading] = useState(false);
  /** refreshing 区分用户触发的远端刷新。 */
  const [refreshing, setRefreshing] = useState(false);
  /** loadingMore 防止滚动底部重复读取同一 offset。 */
  const [loadingMore, setLoadingMore] = useState(false);
  /** hasMore 由 SQLite 短页判定是否到达末尾。 */
  const [hasMore, setHasMore] = useState(true);
  /** error 展示真实同步或缓存错误。 */
  const [error, setError] = useState<string | null>(null);
  /** 归档行延续 RN 与主列表相同的单聊在线状态。 */
  const {
    onlineByID,
    refresh: refreshPresence,
  } = useConversationPresence({
    runtime,
    accountUserID: snapshot.userID,
    items,
  });

  /** readFirstPage 从当前账号 SQLite 重置归档首屏。 */
  const readFirstPage = useCallback(async () => {
    if (!sync || !snapshot.userID) return;
    /** page 保持 SDK Repository 排序。 */
    const page = await sync.conversations.listCachedItems({
      archived: true,
      limit: ARCHIVED_PAGE_SIZE,
      offset: 0,
    });
    setItems(page);
    setHasMore(page.length >= ARCHIVED_PAGE_SIZE);
    return page;
  }, [snapshot.userID, sync]);

  /** loadPage 先读缓存，再静默同步权威归档端点并重读首屏。 */
  const loadPage = useCallback(async () => {
    if (!sync || !snapshot.userID) return;
    setLoading(true);
    setError(null);
    try {
      await readFirstPage();
      await sync.conversations.syncArchived();
      await readFirstPage();
    } catch (cause) {
      setError(readArchivePageError(cause));
    } finally {
      setLoading(false);
    }
  }, [readFirstPage, snapshot.userID, sync]);

  /** refreshPage 强制执行共享归档快照同步。 */
  const refreshPage = useCallback(async () => {
    if (!sync || !snapshot.userID || refreshing) return;
    setRefreshing(true);
    setError(null);
    try {
      await sync.conversations.syncArchived();
      await readFirstPage();
      await refreshPresence();
    } catch (cause) {
      setError(readArchivePageError(cause));
    } finally {
      setRefreshing(false);
    }
  }, [readFirstPage, refreshPresence, refreshing, snapshot.userID, sync]);

  /** loadMore 只追加下一页 SQLite，不触发网络。 */
  const loadMore = useCallback(async () => {
    if (!sync || !snapshot.userID || loadingMore || !hasMore || keyword.trim()) return;
    setLoadingMore(true);
    try {
      /** page offset 使用当前稳定已加载行数。 */
      const page = await sync.conversations.listCachedItems({
        archived: true,
        limit: ARCHIVED_PAGE_SIZE,
        offset: items.length,
      });
      setItems(current => mergeArchivedConversationItems(current, page));
      setHasMore(page.length >= ARCHIVED_PAGE_SIZE);
    } catch (cause) {
      setError(readArchivePageError(cause));
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, items.length, keyword, loadingMore, snapshot.userID, sync]);

  /** handleScroll 接近页面底部时加载下一页缓存。 */
  function handleScroll(event: UIEvent<HTMLElement>): void {
    /** target 读取归档 surface 的滚动位置。 */
    const target = event.currentTarget;
    if (target.scrollHeight - target.scrollTop - target.clientHeight <= 180) {
      void loadMore();
    }
  }

  /** pullRefresh 映射 RN 顶部下拉刷新手势。 */
  const pullRefresh = usePullRefresh({ refreshing, onRefresh: refreshPage });
  /** reloadAfterAction 重读动作结果，归档集合清空时退出空壳页面。 */
  const reloadAfterAction = useCallback(async () => {
    /** page 是取消归档或删除后的最新首屏。 */
    const page = await readFirstPage();
    if (page?.length === 0) navigate('/conversations', { replace: true });
  }, [navigate, readFirstPage]);
  /** actions 在归档模式把菜单动作映射为取消归档。 */
  const actions = useConversationActions({
    sync,
    archiveValue: false,
    reloadCachedConversations: reloadAfterAction,
    reportError: setError,
  });
  /** visibleItems 只过滤当前已加载缓存，不扫描远端或 SQL。 */
  const visibleItems = useMemo(
    () => filterArchivedConversationItems(items, keyword, snapshot.userID ?? ''),
    [items, keyword, snapshot.userID],
  );

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  useEffect(() => {
    if (!sync || !snapshot.userID) return;
    /** active 阻止路由卸载后的 realtime cache 回写。 */
    let active = true;
    void sync.conversations.listCachedItems({
      archived: true,
      limit: Math.max(ARCHIVED_PAGE_SIZE, items.length),
    }).then(page => {
      if (active) setItems(page);
    }).catch(cause => {
      if (active) setError(readArchivePageError(cause));
    });
    return () => { active = false; };
  }, [snapshot.dataVersion, snapshot.userID, sync]);

  if (restoring) return <ArchivePageState label="正在恢复归档会话" />;
  if (!runtime) return <ArchivePageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main
      className="rn-conversation-page rn-conversation-archive-page"
    >
      <section
        className="rn-conversation-surface rn-conversation-archive-surface"
        aria-busy={loading || refreshing}
        onScroll={handleScroll}
        onTouchStart={pullRefresh.onTouchStart}
        onTouchMove={pullRefresh.onTouchMove}
        onTouchEnd={pullRefresh.onTouchEnd}
        onTouchCancel={pullRefresh.onTouchCancel}
        onPointerDown={pullRefresh.onPointerDown}
        onPointerMove={pullRefresh.onPointerMove}
        onPointerUp={pullRefresh.onPointerUp}
        onPointerCancel={pullRefresh.onPointerCancel}
      >
        <section className="rn-conversation-header is-archive">
          <PageNavbar className="rn-conversation-header-top">
            <Link className="rn-conversation-archive-back" to="/conversations" aria-label="返回">
              <RNAssetIcon assetURL={backIconURL} />
            </Link>
            <h1>归档会话</h1>
            <div className="rn-conversation-header-side"><HomeActionMenu /></div>
          </PageNavbar>
          <label className="rn-conversation-search">
            <RNAssetIcon assetURL={searchIconURL} />
            <input
              type="search"
              value={keyword}
              placeholder="搜索"
              onChange={event => setKeyword(event.target.value)}
            />
          </label>
        </section>
        <PullRefreshIndicator
          refreshing={refreshing}
          armed={pullRefresh.armed}
          pullDistance={pullRefresh.pullDistance}
        />
        {error ? <p className="rn-conversation-error" role="status">{error}</p> : null}
        <section className="rn-conversation-list" aria-label="归档会话列表">
          {loading && items.length === 0 ? (
            <div className="rn-conversation-loading" aria-label="正在加载归档会话"><span /></div>
          ) : visibleItems.length ? (
            visibleItems.map(item => (
              <ConversationRow
                key={item.conversation.conversationID}
                item={item}
                currentUserID={snapshot.userID ?? ''}
                online={Boolean(onlineByID[
                  getConversationPresenceUserID(item.conversation)
                ])}
                onOpenActions={actions.openActionMenu}
              />
            ))
          ) : (
            <div className="rn-conversation-empty">
              <img src={emptyChatIconURL} width="72" height="56" alt="" />
              <p>{keyword.trim() ? '没有找到相关会话' : '还没有归档会话'}</p>
            </div>
          )}
          {loadingMore ? <div className="rn-conversation-archive-loading-more">正在加载</div> : null}
        </section>
      </section>
      <ConversationActionMenu
        target={actions.actionTarget}
        anchor={actions.actionAnchor}
        pending={actions.actionPending}
        archiveLabel="取消归档"
        onClose={actions.closeActionMenu}
        onAction={action => void actions.runConversationAction(action)}
      />
      <ConversationDeleteSheet
        target={actions.deleteTarget}
        canDeleteForAll={actions.canDeleteForAll}
        pending={actions.actionPending}
        onClose={actions.closeDeleteSheet}
        onDeleteSelf={() => void actions.confirmDeleteConversation(false)}
        onDeleteAll={() => void actions.confirmDeleteConversation(true)}
      />
    </main>
  );
}

/** 默认导出供 React.lazy 按路由切分归档页面。 */
export default ArchivedConversationsPage;

/** 归档页启动和配置错误保持稳定全屏布局。 */
function ArchivePageState({
  label,
  detail,
}: {
  readonly label: string;
  readonly detail?: string | null;
}) {
  return <main className="rn-conversation-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将未知归档同步异常转换为稳定中文提示。 */
function readArchivePageError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '归档会话加载失败，请稍后重试';
}
