import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { WebIMConversationListItem } from '@im28/im-sdk/web';
import { Navigate, useNavigate } from 'react-router-dom';

import emptyChatIconURL from '../../assets/rn/assets/icons/empty-chat.svg';
import archiveIconURL from '../../assets/rn/assets/icons/imm28/file.collection.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { HomeActionMenu } from '../../components/home-actions/HomeActionMenu.js';
import { PullRefreshIndicator } from '../../components/interaction/index.js';
import { usePrimaryTabBadges } from '../../components/primary-tabs/index.js';
import { usePullRefresh } from '../../hooks/use-pull-refresh.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { ConversationRow } from './ConversationRow.js';
import {
  ConversationActionMenu,
} from './ConversationActionMenu.js';
import { ConversationDeleteSheet } from './ConversationDeleteSheet.js';
import { shouldUsePinnedArchiveBackground } from './conversation-archive-view.js';
import { getConversationPresenceUserID } from './conversation-presence-view.js';
import {
  getConversationUnreadTotal,
  getNextUnreadConversationID,
} from './conversation-list-view.js';
import { useConversationActions } from './useConversationActions.js';
import { useConversationsPageState } from './useConversationsPageState.js';
import './conversations-page.css';

/** RN 会话列表页复用 Web SDK cache-first 同步链和 React Router 路由。 */
export function ConversationsPage() {
  /** navigate 负责进入 RN 对齐的独立搜索路由。 */
  const navigate = useNavigate();
  // reportConversationUnreadTotal 将真实页面汇总同步给全局底栏。
  const {
    reportConversationUnreadTotal,
    registerConversationTabReselect,
  } = usePrimaryTabBadges();
  // runtime context 是页面唯一允许消费的 SDK facade owner。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // sync 只在 runtime 已完成配置装配时存在。
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  /** pageState 统一承载 cache-first、realtime、归档摘要和 presence 状态。 */
  const pageState = useConversationsPageState({
    runtime,
    accountUserID: snapshot.userID,
    dataVersion: snapshot.dataVersion,
    sync,
  });
  /** 页面渲染只读取状态 owner 投影。 */
  const { items, archivedItems, loading, refreshing, error, onlineByID } = pageState;
  /** listRef 提供当前真实会话行的可见位置和滚动容器。 */
  const listRef = useRef<HTMLElement | null>(null);
  /** lastUnreadTargetIDRef 让连续双击按 RN 规则循环未读会话。 */
  const lastUnreadTargetIDRef = useRef('');
  /** pullRefresh 把触屏或 PC 鼠标下拉映射为一次只读远端刷新。 */
  const pullRefresh = usePullRefresh({
    refreshing,
    onRefresh: pageState.refreshConversations,
  });

  // unreadTotal 仅汇总非静音会话。
  const unreadTotal = useMemo(() => getConversationUnreadTotal(items), [items]);

  /** scrollToNextUnreadConversation 只改变滚动位置，不触发已读 mutation。 */
  const scrollToNextUnreadConversation = useCallback((): boolean => {
    /** listElement 必须属于当前挂载的会话主列表。 */
    const listElement = listRef.current;
    if (!listElement) return false;
    /** rows 使用稳定会话 ID 与当前 DOM 顺序对应。 */
    const rows = [...listElement.querySelectorAll<HTMLElement>('[data-conversation-id]')];
    /** headerBottom 排除粘性 header 覆盖的行。 */
    const headerBottom = listElement.closest('.rn-conversation-surface')
      ?.querySelector<HTMLElement>('.rn-conversation-header')
      ?.getBoundingClientRect().bottom ?? 0;
    /** firstVisibleIndex 对齐 RN FlatList 首个可见行索引。 */
    const firstVisibleIndex = rows.findIndex(row => row.getBoundingClientRect().bottom > headerBottom);
    /** targetID 由纯规则统一处理手动未读、当前位置和循环目标。 */
    const targetID = getNextUnreadConversationID(
      items,
      lastUnreadTargetIDRef.current,
      firstVisibleIndex < 0 ? 0 : firstVisibleIndex,
    );
    if (!targetID) {
      lastUnreadTargetIDRef.current = '';
      return false;
    }
    /** target 只从已渲染稳定 ID 行中解析，不拼 CSS selector。 */
    const target = rows.find(row => row.dataset.conversationId === targetID);
    if (!target) return false;
    lastUnreadTargetIDRef.current = targetID;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return true;
  }, [items]);

  useEffect(() => {
    registerConversationTabReselect(scrollToNextUnreadConversation);
    return () => registerConversationTabReselect(null);
  }, [registerConversationTabReselect, scrollToNextUnreadConversation]);

  useEffect(() => {
    reportConversationUnreadTotal(unreadTotal);
  }, [reportConversationUnreadTotal, unreadTotal]);
  // hasPinned 控制 RN 在置顶区存在时延续到 header 的背景色。
  const hasPinned = useMemo(
    () => items.some(item => Boolean(item.conversation.isPinned)),
    [items],
  );
  /** archiveUsesPinnedBackground 对齐 RN 任一列表存在置顶时的通栏背景。 */
  const archiveUsesPinnedBackground = useMemo(
    () => shouldUsePinnedArchiveBackground(items, archivedItems),
    [archivedItems, items],
  );
  // headerTitle 对齐 RN 999+ 的总未读标题上限。
  const headerTitle = unreadTotal
    ? `聊天(${unreadTotal > 999 ? '999+' : unreadTotal})`
    : '聊天';
  /** actions 让普通与归档列表共用同一 UI 动作编排。 */
  const actions = useConversationActions({
    sync,
    archiveValue: true,
    reloadCachedConversations: pageState.reloadCachedConversations,
    reportError: pageState.reportError,
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
      onPointerDown={pullRefresh.onPointerDown}
      onPointerMove={pullRefresh.onPointerMove}
      onPointerUp={pullRefresh.onPointerUp}
      onPointerCancel={pullRefresh.onPointerCancel}
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

        <PullRefreshIndicator
          refreshing={refreshing}
          armed={pullRefresh.armed}
          pullDistance={pullRefresh.pullDistance}
        />

        {error ? (
          <p className="rn-conversation-error" role="status">
            {error}
          </p>
        ) : null}

        <section ref={listRef} className="rn-conversation-list" aria-label="会话列表">
          {loading && items.length === 0 ? (
            <div className="rn-conversation-loading" aria-label="正在加载会话">
              <span />
            </div>
          ) : items.length || archivedItems.length ? (
            <>
              {archivedItems.length ? (
                <button
                  type="button"
                  className={`rn-conversation-archive-row${archiveUsesPinnedBackground ? ' is-pinned' : ''}`}
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
                online={Boolean(onlineByID[
                  getConversationPresenceUserID(item.conversation)
                ])}
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
