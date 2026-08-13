import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WebIMConversationListItem } from '@im28/im-sdk/web';
import { Navigate, useNavigate } from 'react-router-dom';

import emptyChatIconURL from '../../assets/rn/assets/icons/empty-chat.svg';
import archiveIconURL from '../../assets/rn/assets/icons/imm28/file.collection.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { HomeActionMenu } from '../../components/home-actions/HomeActionMenu.js';
import { usePrimaryTabBadges } from '../../components/primary-tabs/index.js';
import { usePullRefresh } from '../../hooks/use-pull-refresh.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { ConversationRow } from './ConversationRow.js';
import {
  ConversationActionMenu,
} from './ConversationActionMenu.js';
import { ConversationDeleteSheet } from './ConversationDeleteSheet.js';
import { getConversationUnreadTotal } from './conversation-list-view.js';
import { useConversationActions } from './useConversationActions.js';
import './conversations-page.css';

/** RN 会话列表页复用 Web SDK cache-first 同步链和 React Router 路由。 */
export function ConversationsPage() {
  /** navigate 负责进入 RN 对齐的独立搜索路由。 */
  const navigate = useNavigate();
  // reportConversationUnreadTotal 将真实页面汇总同步给全局底栏。
  const { reportConversationUnreadTotal } = usePrimaryTabBadges();
  // runtime context 是页面唯一允许消费的 SDK facade owner。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // sync 只在 runtime 已完成配置装配时存在。
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  // items 保存由 SDK 组合的会话及其最新消息。
  const [items, setItems] = useState<readonly WebIMConversationListItem[]>([]);
  /** archivedItems 只用于 RN 归档通栏的名称和未读摘要。 */
  const [archivedItems, setArchivedItems] = useState<readonly WebIMConversationListItem[]>([]);
  // loading 仅用于首次无缓存渲染，已有 cache 时保持列表稳定。
  const [loading, setLoading] = useState(false);
  /** refreshing 区分用户下拉刷新和首次恢复状态。 */
  const [refreshing, setRefreshing] = useState(false);
  // error 显示真实 sync 错误，不回退 fake-success。
  const [error, setError] = useState<string | null>(null);
  /** 先读账号 SQLite cache，再执行 Gateway 全量同步并重读组合列表。 */
  const loadConversations = useCallback(async () => {
    if (!sync || !snapshot.userID) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // cachedItems 保证离线或慢网时先显示当前账号已有数据。
      const cachedItems = await sync.conversations.listCachedItems({
        archived: false,
        limit: 100,
      });
      setItems(cachedItems);
      /** cachedArchivedItems 让离线首屏也能展示归档入口。 */
      const cachedArchivedItems = await sync.conversations.listCachedItems({
        archived: true,
        limit: 100,
      });
      setArchivedItems(cachedArchivedItems);
      await sync.conversations.sync();
      // syncedItems 包含同步刚写入的 latest message cache。
      const syncedItems = await sync.conversations.listCachedItems({
        archived: false,
        limit: 100,
      });
      setItems(syncedItems);
      /** 归档端点独立失败时保留旧 cache，不阻断普通会话首屏。 */
      void sync.conversations.syncArchived()
        .then(() => sync.conversations.listCachedItems({ archived: true, limit: 100 }))
        .then(setArchivedItems)
        .catch(() => undefined);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  }, [snapshot.userID, sync]);

  /** 从 canonical cache 重读未归档列表，供 mutation 和 realtime 共用。 */
  const reloadCachedConversations = useCallback(async () => {
    if (!sync || !snapshot.userID) return;
    /** cachedItems 是 SDK 完成状态收敛后的唯一列表快照。 */
    const cachedItems = await sync.conversations.listCachedItems({
      archived: false,
      limit: 100,
    });
    setItems(cachedItems);
    /** cachedArchivedItems 与普通列表在同一动作后共同重读。 */
    const cachedArchivedItems = await sync.conversations.listCachedItems({
      archived: true,
      limit: 100,
    });
    setArchivedItems(cachedArchivedItems);
  }, [snapshot.userID, sync]);

  /** 下拉刷新强制执行 canonical conversation sync 后重读 SQLite。 */
  const refreshConversations = useCallback(async () => {
    if (!sync || !snapshot.userID || refreshing) return;
    setRefreshing(true);
    setError(null);
    try {
      await sync.conversations.sync();
      /** 归档端点失败不覆盖普通会话刷新结果，但成功时同步更新入口。 */
      await sync.conversations.syncArchived().catch(() => undefined);
      await reloadCachedConversations();
    } catch (cause) {
      setError(readConversationPageError(cause));
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, reloadCachedConversations, snapshot.userID, sync]);

  /** pullRefresh 把触屏下拉手势映射为一次只读远端刷新。 */
  const pullRefresh = usePullRefresh({
    refreshing,
    onRefresh: refreshConversations,
  });

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!sync || !snapshot.userID) {
      return;
    }
    // active 阻止路由卸载后的 cache 读取回写页面。
    let active = true;
    void Promise.all([
      sync.conversations.listCachedItems({ archived: false, limit: 100 }),
      sync.conversations.listCachedItems({ archived: true, limit: 100 }),
    ])
      .then(([cachedItems, cachedArchivedItems]) => {
        if (active) {
          setItems(cachedItems);
          setArchivedItems(cachedArchivedItems);
        }
      })
      .catch(cause => {
        if (active) {
          setError(cause instanceof Error ? cause.message : String(cause));
        }
      });
    return () => {
      active = false;
    };
  }, [snapshot.dataVersion, snapshot.userID, sync]);

  // unreadTotal 仅汇总非静音会话。
  const unreadTotal = useMemo(() => getConversationUnreadTotal(items), [items]);

  useEffect(() => {
    reportConversationUnreadTotal(unreadTotal);
  }, [reportConversationUnreadTotal, unreadTotal]);
  // hasPinned 控制 RN 在置顶区存在时延续到 header 的背景色。
  const hasPinned = useMemo(
    () => items.some(item => Boolean(item.conversation.isPinned)),
    [items],
  );
  // headerTitle 对齐 RN 999+ 的总未读标题上限。
  const headerTitle = unreadTotal
    ? `聊天(${unreadTotal > 999 ? '999+' : unreadTotal})`
    : '聊天';
  /** actions 让普通与归档列表共用同一 UI 动作编排。 */
  const actions = useConversationActions({
    sync,
    archiveValue: true,
    reloadCachedConversations,
    reportError: setError,
  });

  if (restoring) {
    return <ConversationPageState label="正在恢复会话" />;
  }

  if (!runtime) {
    return (
      <ConversationPageState
        label="运行配置不可用"
        detail={startupError}
      />
    );
  }

  if (!snapshot.userID) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main
      className="rn-conversation-page"
      onTouchStart={pullRefresh.onTouchStart}
      onTouchMove={pullRefresh.onTouchMove}
      onTouchEnd={pullRefresh.onTouchEnd}
      onTouchCancel={pullRefresh.onTouchCancel}
    >
      <section className="rn-conversation-surface" aria-busy={loading || refreshing}>
        <header
          className={`rn-conversation-header${hasPinned ? ' has-pinned' : ''}`}
        >
          <div className="rn-conversation-header-top">
            <span className="rn-conversation-header-side" aria-hidden="true" />
            <h1>{headerTitle}</h1>
            <div className="rn-conversation-header-side"><HomeActionMenu /></div>
          </div>
          <button
            type="button"
            className="rn-conversation-search"
            aria-label="搜索"
            onClick={() => navigate('/conversations/search')}
          >
            <RNAssetIcon assetURL={searchIconURL} />
            <span className="rn-conversation-search-placeholder">搜索</span>
          </button>
        </header>

        <div
          className={`rn-conversation-pull${pullRefresh.armed ? ' is-armed' : ''}`}
          style={{ height: refreshing ? 36 : pullRefresh.pullDistance }}
          aria-hidden={!refreshing && pullRefresh.pullDistance === 0}
        >
          <span>{refreshing ? '正在刷新' : pullRefresh.armed ? '松开刷新' : '下拉刷新'}</span>
        </div>

        {error ? (
          <p className="rn-conversation-error" role="status">
            {error}
          </p>
        ) : null}

        <section className="rn-conversation-list" aria-label="会话列表">
          {loading && items.length === 0 ? (
            <div className="rn-conversation-loading" aria-label="正在加载会话">
              <span />
            </div>
          ) : items.length || archivedItems.length ? (
            <>
              {archivedItems.length ? (
                <button
                  type="button"
                  className="rn-conversation-archive-row"
                  aria-label="归档会话"
                  onClick={() => navigate('/conversations/archived')}
                >
                  <span className="rn-conversation-archive-icon">
                    <RNAssetIcon assetURL={archiveIconURL} />
                  </span>
                  <span className="rn-conversation-archive-body">
                    <span className="rn-conversation-archive-copy">
                      <strong>归档会话</strong>
                      <span>{archivedItems.map(item => item.conversation.name || item.conversation.targetID).join('，')}</span>
                    </span>
                    <ConversationArchiveUnread items={archivedItems} />
                  </span>
                </button>
              ) : null}
              {items.map(item => (
              <ConversationRow
                key={item.conversation.conversationID}
                item={item}
                currentUserID={snapshot.userID ?? ''}
                onOpenActions={actions.openActionMenu}
              />
              ))}
            </>
          ) : (
            <div className="rn-conversation-empty">
              <img src={emptyChatIconURL} width="72" height="56" alt="" />
              <p>还没有朋友和你聊天</p>
            </div>
          )}
        </section>
      </section>
      <ConversationActionMenu
        target={actions.actionTarget}
        anchor={actions.actionAnchor}
        pending={actions.actionPending}
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

/** 汇总归档通栏未读，静音会话只显示红点语义。 */
function ConversationArchiveUnread({
  items,
}: {
  readonly items: readonly WebIMConversationListItem[];
}) {
  /** unread 合计所有归档会话的真实非负未读数。 */
  const unread = items.reduce(
    (total, item) => total + Math.max(0, Math.trunc(item.conversation.unreadCount)),
    0,
  );
  return unread > 0 ? (
    <span className="rn-conversation-unread-badge" aria-label={`${unread} 条未读`}>
      {unread > 999 ? '999+' : unread}
    </span>
  ) : null;
}

/** 将未知会话页异常转换为稳定中文提示。 */
function readConversationPageError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '会话操作失败，请稍后重试';
}

/** 统一承载启动和配置错误的全屏状态。 */
function ConversationPageState({
  label,
  detail,
}: {
  readonly label: string;
  readonly detail?: string | null;
}) {
  return (
    <main className="rn-conversation-page-state">
      <strong>{label}</strong>
      {detail ? <span>{detail}</span> : null}
    </main>
  );
}
