import { useCallback, useEffect, useState } from 'react';
import type {
  WebIMConversationListItem,
  WebIMRuntime,
  WebIMSync,
} from '@im28/im-sdk/web';

import { useConversationPresence } from './useConversationPresence.js';

/** 会话列表状态 hook 只接收账号、数据版本和共享 runtime 事实。 */
interface UseConversationsPageStateOptions {
  readonly runtime: WebIMRuntime | null;
  readonly sync: WebIMSync | null;
  readonly accountUserID: string | null;
  readonly dataVersion: number;
}

/** 会话列表页面消费的缓存状态和只读刷新动作。 */
interface ConversationsPageStateBinding {
  readonly items: readonly WebIMConversationListItem[];
  readonly archivedItems: readonly WebIMConversationListItem[];
  readonly loading: boolean;
  readonly refreshing: boolean;
  readonly error: string | null;
  readonly onlineByID: Readonly<Record<string, boolean>>;
  readonly reloadCachedConversations: () => Promise<void>;
  readonly refreshConversations: () => Promise<void>;
  readonly reportError: (message: string) => void;
}

/** 统一拥有普通会话页的 SQLite 首屏、归档摘要、实时重读和刷新状态。 */
export function useConversationsPageState({
  runtime,
  sync,
  accountUserID,
  dataVersion,
}: UseConversationsPageStateOptions): ConversationsPageStateBinding {
  /** items 保存由 SDK 组合的会话及其最新消息。 */
  const [items, setItems] = useState<readonly WebIMConversationListItem[]>([]);
  /** archivedItems 只用于 RN 归档通栏的名称和未读摘要。 */
  const [archivedItems, setArchivedItems] = useState<readonly WebIMConversationListItem[]>([]);
  /** loading 仅用于首次无缓存渲染，已有 cache 时保持列表稳定。 */
  const [loading, setLoading] = useState(false);
  /** refreshing 区分用户下拉刷新和首次恢复状态。 */
  const [refreshing, setRefreshing] = useState(false);
  /** error 显示真实 sync 错误，不回退 fake-success。 */
  const [error, setError] = useState<string | null>(null);
  /** onlineByID 和 refreshPresence 共用 SDK presence owner。 */
  const {
    onlineByID,
    refresh: refreshPresence,
  } = useConversationPresence({ runtime, accountUserID, items });

  /** 从 canonical cache 同时重读普通和归档会话列表。 */
  const reloadCachedConversations = useCallback(async (): Promise<void> => {
    if (!sync || !accountUserID) return;
    /** cachedItems 是 SDK 完成状态收敛后的唯一普通列表快照。 */
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
  }, [accountUserID, sync]);

  /** 首屏读完账号 SQLite 即结束 loading，再静默独立同步普通和归档快照。 */
  const loadConversations = useCallback(async (): Promise<void> => {
    if (!sync || !accountUserID) return;
    setLoading(true);
    setError(null);
    try {
      await reloadCachedConversations();
    } catch (cause) {
      setError(readConversationPageError(cause));
    } finally {
      setLoading(false);
    }
    /** results 保证任一列表完整成功后都能独立落库，失败不会阻断另一条同步。 */
    const results = await Promise.allSettled([
      sync.conversations.sync({ forceFullSnapshot: true, pageSize: 100 }),
      sync.conversations.syncArchived({ pageSize: 100 }),
    ]);
    if (results.some(result => result.status === 'fulfilled')) {
      await reloadCachedConversations().catch(() => undefined);
    }
  }, [accountUserID, reloadCachedConversations, sync]);

  /** 下拉刷新强制执行 canonical sync 后重读 SQLite 和 presence。 */
  const refreshConversations = useCallback(async (): Promise<void> => {
    if (!sync || !accountUserID || refreshing) return;
    setRefreshing(true);
    setError(null);
    try {
      /** results 让普通和归档任一成功结果都保留，且不把另一条失败伪装成成功。 */
      const results = await Promise.allSettled([
        sync.conversations.sync({ forceFullSnapshot: true, pageSize: 100 }),
        sync.conversations.syncArchived({ pageSize: 100 }),
      ]);
      await reloadCachedConversations();
      await refreshPresence();
      if (results.some(result => result.status === 'rejected')) {
        setError('部分会话数据同步失败，请稍后重试');
      }
    } catch (cause) {
      setError(readConversationPageError(cause));
    } finally {
      setRefreshing(false);
    }
  }, [accountUserID, refreshPresence, refreshing, reloadCachedConversations, sync]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!sync || !accountUserID) return;
    /** active 阻止路由卸载后的 realtime cache 读取回写页面。 */
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
        if (active) setError(readConversationPageError(cause));
      });
    return () => {
      active = false;
    };
  }, [accountUserID, dataVersion, sync]);

  return {
    items,
    archivedItems,
    loading,
    refreshing,
    error,
    onlineByID,
    reloadCachedConversations,
    refreshConversations,
    reportError: setError,
  };
}

/** 将未知会话页异常转换为稳定中文提示。 */
function readConversationPageError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '会话操作失败，请稍后重试';
}
