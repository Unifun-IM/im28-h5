import { useEffect, useState } from 'react';
import type {
  WebIMPeerProfileRelationship,
  WebIMRuntime,
} from '@im28/im-sdk/web';

/** 只在好友关系成立时观察 SDK presence，并在离页时释放。 */
export function useContactProfilePresence(
  runtime: WebIMRuntime | null,
  accountUserID: string | null,
  userID: string,
  relationship: WebIMPeerProfileRelationship | undefined,
): boolean | null {
  /** peerOnline 保存当前资料目标的内存在线状态。 */
  const [peerOnline, setPeerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    if (!runtime || !accountUserID || !userID || relationship !== 'friend') {
      setPeerOnline(null);
      return;
    }
    /** active 防止取消后的首值失败回写已离开的资料页。 */
    let active = true;
    /** observation 由 SDK 处理首值/实时竞态和账号隔离。 */
    const observation = runtime.getSync().presence.observe(
      [userID],
      presence => {
        if (!active) return;
        /** status 只匹配当前路由目标，空列表按 RN 订阅语义显示离线。 */
        const status = presence.find(item => item.userID === userID);
        setPeerOnline(Boolean(status?.online));
      },
    );
    void observation.ready.catch(() => {
      if (active) setPeerOnline(null);
    });
    return () => {
      active = false;
      observation.unsubscribe();
    };
  }, [accountUserID, relationship, runtime, userID]);

  return peerOnline;
}
