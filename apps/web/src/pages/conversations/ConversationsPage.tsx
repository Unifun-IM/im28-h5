import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WebIMConversationListItem } from '@im28/im-sdk/web';
import { Navigate } from 'react-router-dom';

import emptyChatIconURL from '../../assets/rn/assets/icons/empty-chat.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { usePrimaryTabBadges } from '../../components/primary-tabs/index.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { ConversationRow } from './ConversationRow.js';
import {
  filterConversationListItems,
  getConversationUnreadTotal,
} from './conversation-list-view.js';
import './conversations-page.css';

/** RN 会话列表页复用 Web SDK cache-first 同步链和 React Router 路由。 */
export function ConversationsPage() {
  // reportConversationUnreadTotal 将真实页面汇总同步给全局底栏。
  const { reportConversationUnreadTotal } = usePrimaryTabBadges();
  // runtime context 是页面唯一允许消费的 SDK facade owner。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // sync 只在 runtime 已完成配置装配时存在。
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  // items 保存由 SDK 组合的会话及其最新消息。
  const [items, setItems] = useState<readonly WebIMConversationListItem[]>([]);
  // keyword 对应 RN AppSearchBox 的本地过滤分支。
  const [keyword, setKeyword] = useState('');
  // loading 仅用于首次无缓存渲染，已有 cache 时保持列表稳定。
  const [loading, setLoading] = useState(false);
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
      await sync.conversations.sync();
      // syncedItems 包含同步刚写入的 latest message cache。
      const syncedItems = await sync.conversations.listCachedItems({
        archived: false,
        limit: 100,
      });
      setItems(syncedItems);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  }, [snapshot.userID, sync]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!sync || !snapshot.userID) {
      return;
    }
    // active 阻止路由卸载后的 cache 读取回写页面。
    let active = true;
    void sync.conversations
      .listCachedItems({ archived: false, limit: 100 })
      .then(cachedItems => {
        if (active) {
          setItems(cachedItems);
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

  // filteredItems 保留 Repository 排序，只执行 RN 本地搜索条件。
  const filteredItems = useMemo(
    () => filterConversationListItems(items, keyword),
    [items, keyword],
  );
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
    <main className="rn-conversation-page">
      <section className="rn-conversation-surface" aria-busy={loading}>
        <header
          className={`rn-conversation-header${hasPinned ? ' has-pinned' : ''}`}
        >
          <div className="rn-conversation-header-top">
            <span className="rn-conversation-header-side" aria-hidden="true" />
            <h1>{headerTitle}</h1>
            <span className="rn-conversation-header-side" aria-hidden="true" />
          </div>
          <label className="rn-conversation-search">
            <span className="sr-only">搜索</span>
            <RNAssetIcon assetURL={searchIconURL} />
            <input
              type="search"
              value={keyword}
              placeholder="搜索"
              onChange={event => setKeyword(event.target.value)}
            />
            {keyword ? (
              <button
                type="button"
                aria-label="清除"
                onClick={() => setKeyword('')}
              >
                <RNAssetIcon assetURL={clearIconURL} />
              </button>
            ) : null}
          </label>
        </header>

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
          ) : filteredItems.length ? (
            filteredItems.map(item => (
              <ConversationRow
                key={item.conversation.conversationID}
                item={item}
                currentUserID={snapshot.userID ?? ''}
              />
            ))
          ) : (
            <div className="rn-conversation-empty">
              <img src={emptyChatIconURL} width="72" height="56" alt="" />
              <p>{keyword.trim() ? '没有找到相关会话' : '还没有朋友和你聊天'}</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
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
