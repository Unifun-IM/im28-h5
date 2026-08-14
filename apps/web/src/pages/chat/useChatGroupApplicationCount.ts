import { useEffect, useState } from 'react';
import type { Conversation, WebIMSync } from '@im28/im-sdk/web';

import { countPendingGroupApplications } from '../contacts/group-application-view.js';

/** 聊天头部计数读取所需的最小 shared facade。 */
type ChatGroupApplicationCountSync = Pick<WebIMSync, 'groupApplications'>;

/** 从当前群会话读取待审核申请数量，非群聊不发请求。 */
export async function readChatGroupApplicationCount(
  sync: ChatGroupApplicationCountSync,
  conversation: Pick<Conversation, 'type' | 'targetID'> | null,
): Promise<number> {
  if (conversation?.type !== 'group' || !conversation.targetID.trim()) return 0;
  /** applications 只来自 shared 审核列表 facade。 */
  const applications = await sync.groupApplications.list({ pageSize: 100 });
  return countPendingGroupApplications(applications, conversation.targetID);
}

/** 随群会话和 runtime 数据版本恢复 RN 头部待审核角标。 */
export function useChatGroupApplicationCount(
  conversation: Conversation | null,
  sync: WebIMSync | null,
  dataVersion: number,
): number {
  /** count 只保存当前聊天页的可见数量投影。 */
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!sync || conversation?.type !== 'group' || !conversation.targetID) {
      setCount(0);
      return;
    }
    /** active 阻止切换会话后的旧审核响应覆盖新页面。 */
    let active = true;
    void readChatGroupApplicationCount(sync, conversation)
      .then(nextCount => { if (active) setCount(nextCount); })
      .catch(() => { if (active) setCount(0); });
    return () => { active = false; };
  }, [conversation, dataVersion, sync]);
  return count;
}
