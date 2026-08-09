import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Conversation } from '@im28/im-sdk-web';
import { LogOut, MessageCircle, RefreshCw } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

import { useWebIMRuntime } from '../../runtime/index.js';

/** 会话页先读取 SQLite cache，再用 Gateway 完整同步刷新。 */
export function ConversationsPage() {
  // runtime context 决定 auth guard 与 sync owner。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // sync facade 动态绑定当前认证账号和 account database。
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  // conversations 始终来自 Repository 返回的排序结果。
  const [conversations, setConversations] = useState<readonly Conversation[]>([]);
  // loading 只在首次 cache/remote 读取尚未完成时显示。
  const [loading, setLoading] = useState(true);
  // refreshing 区分工具栏主动刷新状态。
  const [refreshing, setRefreshing] = useState(false);
  // error 不覆盖已存在的 SQLite cache。
  const [error, setError] = useState<string | null>(null);

  /** 读取 cache 后执行真实远端全量同步。 */
  const loadConversations = useCallback(async () => {
    if (!sync || !snapshot.userID) {
      return;
    }
    setError(null);
    try {
      // cached 让刷新后的页面无需等待网络即可呈现。
      const cached = await sync.conversations.listCached();
      setConversations(cached);
      // synced 只有在所有 Gateway pages 成功后替换 cache。
      const synced = await sync.conversations.sync();
      setConversations(synced);
    } catch (cause) {
      setError(readErrorMessage(cause));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [snapshot.userID, sync]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  /** 从工具栏触发一次显式远端刷新。 */
  function handleRefresh() {
    setRefreshing(true);
    void loadConversations();
  }

  /** 退出远端会话并清理当前 tab 的 account owners。 */
  async function handleSignOut() {
    await runtime?.signOut();
  }

  if (restoring) {
    return <PageState title="正在恢复会话" />;
  }
  if (!runtime) {
    return (
      <PageState
        title="运行配置不可用"
        {...(startupError ? { detail: startupError } : {})}
      />
    );
  }
  if (!snapshot.userID) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="im-page">
      <header className="topbar">
        <div className="topbar-title">
          <span className="brand-mark brand-mark-small" aria-hidden="true">28</span>
          <div>
            <h1>消息</h1>
            <p>{snapshot.userID}</p>
          </div>
        </div>
        <div className="toolbar" aria-label="会话工具栏">
          <button
            className="icon-button"
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            title="刷新会话"
            aria-label="刷新会话"
          >
            <RefreshCw size={19} className={refreshing ? 'spin' : undefined} />
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={() => void handleSignOut()}
            title="退出登录"
            aria-label="退出登录"
          >
            <LogOut size={19} />
          </button>
        </div>
      </header>
      {error ? <p className="sync-warning" role="alert">{error}</p> : null}
      <section className="conversation-list" aria-label="会话列表">
        {loading ? (
          <PageState title="正在加载会话" compact />
        ) : conversations.length ? (
          conversations.map(conversation => (
            <ConversationRow
              key={conversation.conversationID}
              conversation={conversation}
            />
          ))
        ) : (
          <PageState title="暂无会话" compact />
        )}
      </section>
    </main>
  );
}

/** 单个会话行只负责路由入口和可扫描摘要。 */
function ConversationRow({ conversation }: { readonly conversation: Conversation }) {
  // name 允许后端资料缺失时回退 target identity。
  const name = conversation.name?.trim() || conversation.targetID;
  // initial 用于无远端头像时提供稳定识别符。
  const initial = Array.from(name)[0]?.toUpperCase() ?? '#';
  return (
    <Link
      className="conversation-row"
      to={`/conversations/${encodeURIComponent(conversation.conversationID)}`}
    >
      {conversation.faceURL ? (
        <img className="avatar" src={conversation.faceURL} alt="" />
      ) : (
        <span className="avatar avatar-fallback" aria-hidden="true">{initial}</span>
      )}
      <span className="conversation-copy">
        <strong>{name}</strong>
        <span>{conversation.type === 'group' ? '群聊' : '单聊'}</span>
      </span>
      {conversation.unreadCount > 0 ? (
        <span className="unread-badge" aria-label={`${conversation.unreadCount} 条未读`}>
          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
        </span>
      ) : (
        <MessageCircle className="row-hint" size={18} aria-hidden="true" />
      )}
    </Link>
  );
}

/** 页面级加载、空态和配置错误使用统一非 card 布局。 */
function PageState({
  title,
  detail,
  compact = false,
}: {
  readonly title: string;
  readonly detail?: string;
  readonly compact?: boolean;
}) {
  return (
    <div className={compact ? 'page-state page-state-compact' : 'page-state'}>
      <MessageCircle size={24} aria-hidden="true" />
      <strong>{title}</strong>
      {detail ? <span>{detail}</span> : null}
    </div>
  );
}

/** 将同步异常转换为不包含敏感数据的文本。 */
function readErrorMessage(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '会话同步失败';
}
