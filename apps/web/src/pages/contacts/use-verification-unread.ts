import { useCallback, useEffect, useState } from 'react';

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

  /** 独立容错刷新两个 shared facade，避免一个端点失败清空另一端点。 */
  const refresh = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID) {
      setCounts(EMPTY_VERIFICATION_UNREAD_COUNTS);
      return;
    }
    // results 对齐 RN 两个计数请求互不阻断的行为。
    const results = await Promise.allSettled([
      runtime.getSync().friendApplications.getUnreadCount(),
      runtime.getSync().groupApplications.getUnreadCount(),
    ]);
    setCounts(current => {
      // friend 只在专用未读端点成功时替换。
      const friend = results[0].status === 'fulfilled' ? results[0].value : current.friend;
      // group 只在审核 total 成功时替换。
      const group = results[1].status === 'fulfilled' ? results[1].value : current.group;
      return { friend, group, total: friend + group };
    });
  }, [runtime, snapshot.userID]);

  useEffect(() => { void refresh(); }, [refresh]);

  return { counts, refresh } as const;
}
