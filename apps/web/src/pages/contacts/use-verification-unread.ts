import { useCallback, useEffect, useRef, useState } from 'react';

import { useWebIMRuntime } from '../../runtime/index.js';

/** H5 页面消费的验证消息计数。 */
export interface VerificationUnreadCounts {
  readonly friend: number;
  readonly group: number;
  readonly total: number;
}

/** 空验证消息计数使用稳定不可变值。 */
const EMPTY_VERIFICATION_UNREAD_COUNTS: VerificationUnreadCounts = {
  friend: 0,
  group: 0,
  total: 0,
};

/** 并行读取好友未读和群待审核总数，单侧失败时保留另一侧真实结果。 */
export function useVerificationUnreadCounts() {
  // runtime context 是角标唯一 SDK 入口。
  const { runtime, snapshot } = useWebIMRuntime();
  // counts 保存最近一次成功读取的服务端计数。
  const [counts, setCounts] = useState<VerificationUnreadCounts>(
    EMPTY_VERIFICATION_UNREAD_COUNTS,
  );
  /** activeOwnerRef 阻止旧 runtime 或旧账号请求覆盖当前账号。 */
  const activeOwnerRef = useRef({ runtime, userID: snapshot.userID });
  activeOwnerRef.current = { runtime, userID: snapshot.userID };
  /** refreshInFlightRef 只合并同一 runtime 和同一账号的并发读取。 */
  const refreshInFlightRef = useRef<{
    readonly runtime: typeof runtime;
    readonly userID: string;
    readonly task: Promise<void>;
  } | null>(null);

  /** 独立容错刷新两个 shared facade，避免一个端点失败清空另一端点。 */
  const refresh = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID) {
      setCounts(EMPTY_VERIFICATION_UNREAD_COUNTS);
      return;
    }
    /** userID 固定本轮所属账号，供异步完成时校验 owner。 */
    const userID = snapshot.userID;
    /** inFlight 只复用当前 runtime 与账号已经发起的刷新。 */
    const inFlight = refreshInFlightRef.current;
    if (inFlight?.runtime === runtime && inFlight.userID === userID) {
      await inFlight.task;
      return;
    }
    /** refreshTask 保证同一账号同一时刻只发起一组验证计数请求。 */
    const refreshTask = (async (): Promise<void> => {
      // results 对齐 RN 两个计数请求互不阻断的行为。
      const results = await Promise.allSettled([
        runtime.getSync().friendApplications.getUnreadCount(),
        runtime.getSync().groupApplications.getUnreadCount(),
      ]);
      if (
        activeOwnerRef.current.runtime !== runtime ||
        activeOwnerRef.current.userID !== userID
      ) return;
      setCounts(current => {
        // friend 只在专用未读端点成功时替换。
        const friend = results[0].status === 'fulfilled' ? results[0].value : current.friend;
        // group 只在审核 total 成功时替换。
        const group = results[1].status === 'fulfilled' ? results[1].value : current.group;
        return { friend, group, total: friend + group };
      });
    })();
    refreshInFlightRef.current = { runtime, userID, task: refreshTask };
    try {
      await refreshTask;
    } finally {
      if (refreshInFlightRef.current?.task === refreshTask) {
        refreshInFlightRef.current = null;
      }
    }
  }, [runtime, snapshot.userID]);

  useEffect(() => {
    // owner 切换先清零，禁止新账号短暂继承旧账号角标。
    setCounts(EMPTY_VERIFICATION_UNREAD_COUNTS);
    void refresh();
    return () => {
      if (
        activeOwnerRef.current.runtime === runtime &&
        activeOwnerRef.current.userID === snapshot.userID
      ) {
        activeOwnerRef.current = { runtime: null, userID: null };
      }
    };
  }, [refresh, runtime, snapshot.userID]);

  return { counts, refresh } as const;
}
