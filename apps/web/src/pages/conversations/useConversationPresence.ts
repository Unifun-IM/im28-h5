import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { WebIMConversationListItem, WebIMRuntime } from '@im28/im-sdk/web';

import {
  getConversationPresenceUserIDs,
  mergeConversationPresence,
  projectConversationPresence,
} from './conversation-presence-view.js';

/** 会话列表 presence 与 RN 一致的兜底刷新周期。 */
const CONVERSATION_PRESENCE_REFRESH_INTERVAL_MS = 60_000;

/** 会话在线状态 hook 的输入。 */
interface UseConversationPresenceOptions {
  readonly runtime: WebIMRuntime | null;
  readonly accountUserID: string | null;
  readonly items: readonly WebIMConversationListItem[];
}

/** 会话在线状态 hook 返回内存投影和用户触发的强制刷新动作。 */
interface UseConversationPresenceResult {
  readonly onlineByID: Readonly<Record<string, boolean>>;
  readonly refresh: () => Promise<void>;
}

/** 观察当前单聊会话 presence，并让 HTTP 轮询、WS 和下拉刷新共用一个页面 owner。 */
export function useConversationPresence({
  runtime,
  accountUserID,
  items,
}: UseConversationPresenceOptions): UseConversationPresenceResult {
  /** userIDKey 避免列表对象重建导致相同目标重复订阅。 */
  const userIDKey = useMemo(
    () => getConversationPresenceUserIDs(items).join('\n'),
    [items],
  );
  /** onlineByID 只保存当前账号当前可见单聊的内存状态。 */
  const [onlineByID, setOnlineByID] = useState<Readonly<Record<string, boolean>>>({});
  /** generationRef 阻止切号、离页或目标变化后的旧请求回写。 */
  const generationRef = useRef(0);
  /** stateRevisionRef 阻止迟到 HTTP 覆盖更新后的 WS 状态。 */
  const stateRevisionRef = useRef(0);

  /** refresh 执行一次真实 Gateway presence 查询，供轮询和下拉刷新复用。 */
  const refresh = useCallback(async (): Promise<void> => {
    /** targetUserIDs 来自稳定 key，保持与 observation 完全相同的目标集合。 */
    const targetUserIDs = userIDKey.split('\n').filter(Boolean);
    if (!runtime || !accountUserID || targetUserIDs.length === 0) return;
    /** generation 和 revision 共同保护账号、目标与 realtime 竞态。 */
    const generation = generationRef.current;
    /** stateRevision 是请求发起时页面已知的最新状态版本。 */
    const stateRevision = stateRevisionRef.current;
    try {
      /** presence 直接调用 shared facade，不在页面复制 OpenAPI DTO 逻辑。 */
      const presence = await runtime.getSync().presence.list(targetUserIDs);
      if (
        generation !== generationRef.current
        || stateRevision !== stateRevisionRef.current
      ) return;
      stateRevisionRef.current += 1;
      setOnlineByID(projectConversationPresence(presence));
    } catch {
      // Presence 不可用不阻断会话刷新，保留上次已知状态等待 realtime 收敛。
    }
  }, [accountUserID, runtime, userIDKey]);

  useEffect(() => {
    /** targetUserIDs 同时约束首值、WS 和分钟轮询。 */
    const targetUserIDs = userIDKey.split('\n').filter(Boolean);
    /** generation 标识当前账号与目标集合唯一的一代订阅。 */
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    stateRevisionRef.current = 0;
    setOnlineByID({});
    if (!runtime || !accountUserID || targetUserIDs.length === 0) return;
    /** observation 复用 SDK 的先订阅后查询和 realtime 胜出规则。 */
    const observation = runtime.getSync().presence.observe(targetUserIDs, presence => {
      if (generation !== generationRef.current) return;
      stateRevisionRef.current += 1;
      setOnlineByID(current => mergeConversationPresence(current, presence));
    });
    void observation.ready.catch(() => undefined);
    /** refreshTimer 对齐 RN 每分钟兜底刷新，仅在 Activity 可见 effect 中存活。 */
    const refreshTimer = window.setInterval(
      () => void refresh(),
      CONVERSATION_PRESENCE_REFRESH_INTERVAL_MS,
    );
    return () => {
      generationRef.current += 1;
      window.clearInterval(refreshTimer);
      observation.unsubscribe();
    };
  }, [accountUserID, refresh, runtime, userIDKey]);

  return { onlineByID, refresh };
}
