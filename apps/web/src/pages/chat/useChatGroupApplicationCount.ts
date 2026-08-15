import { useEffect, useState } from 'react';
import type { Conversation, WebIMSync } from '@im28/im-sdk/web';

import { countPendingGroupApplications } from '../contacts/group-application-view.js';

/** 聊天头部计数读取所需的最小 shared facade。 */
type ChatGroupApplicationCountSync = Pick<WebIMSync, 'groupApplications'>;

/** 从当前群会话读取待审核申请数量，非群聊不发请求。 */
export async function readChatGroupApplicationCount(
  sync: ChatGroupApplicationCountSync,
  groupID: string,
): Promise<number> {
  if (!groupID) return 0;
  /** applications 只来自 shared 审核列表 facade。 */
  const applications = await sync.groupApplications.list({ pageSize: 100 });
  return countPendingGroupApplications(applications, groupID);
}

/** 随群会话和 runtime 数据版本恢复 RN 头部待审核角标。 */
export function useChatGroupApplicationCount(
  conversation: Conversation | null,
  sync: WebIMSync | null,
  dataVersion: number,
): number {
  /** count 只保存当前聊天页的可见数量投影。 */
  const [count, setCount] = useState(0);
  // groupID 隔离草稿更新产生的 Conversation 新引用，只在群身份变化时重读。
  const groupID = conversation?.type === 'group' ? conversation.targetID.trim() : '';
  useEffect(() => {
    if (!sync || !groupID) {
      setCount(0);
      return;
    }
    /** active 阻止切换会话后的旧审核响应覆盖新页面。 */
    let active = true;
    void readChatGroupApplicationCount(sync, groupID)
      .then(nextCount => { if (active) setCount(nextCount); })
      .catch(() => { if (active) setCount(0); });
    return () => { active = false; };
  }, [dataVersion, groupID, sync]);
  return count;
}
