import { useEffect, useMemo, useState } from 'react';
import type { WebIMRuntime } from '@im28/im-sdk/web';

/** 群成员在线状态 hook 的输入。 */
interface UseGroupMemberPresenceOptions {
  readonly runtime: WebIMRuntime | null;
  readonly accountUserID: string | null;
  readonly userIDs: readonly string[];
  readonly visible: boolean;
}

/** 批量观察普通群成员在线状态，并在目标变化时释放旧订阅。 */
export function useGroupMemberPresence({
  runtime,
  accountUserID,
  userIDs,
  visible,
}: UseGroupMemberPresenceOptions): Readonly<Record<string, boolean>> {
  /** userIDKey 让成员身份相同的渲染复用同一 observation。 */
  const userIDKey = useMemo(() => Array.from(new Set(
    userIDs.map(userID => userID.trim()).filter(Boolean),
  )).join('\n'), [userIDs]);
  /** onlineByID 只保存当前页面 observation 的内存投影。 */
  const [onlineByID, setOnlineByID] = useState<Readonly<Record<string, boolean>>>({});

  useEffect(() => {
    /** targetUserIDs 来自稳定 key，避免数组引用变化重复订阅。 */
    const targetUserIDs = userIDKey.split('\n').filter(Boolean);
    if (!runtime || !accountUserID || !visible || targetUserIDs.length === 0) {
      setOnlineByID({});
      return;
    }
    /** active 防止离页后的异步回调写回。 */
    let active = true;
    setOnlineByID({});
    /** observation 复用 shared HTTP/realtime 竞态和生命周期 owner。 */
    const observation = runtime.getSync().presence.observe(targetUserIDs, presence => {
      if (!active) return;
      setOnlineByID(current => {
        /** next 仅合并本次初始或 realtime 返回的成员。 */
        const next = { ...current };
        // status 只会包含本 observation 的稳定成员身份。
        for (const status of presence) next[status.userID] = status.online;
        return next;
      });
    });
    void observation.ready.catch(() => undefined);
    return () => {
      active = false;
      observation.unsubscribe();
    };
  }, [accountUserID, runtime, userIDKey, visible]);

  return onlineByID;
}
