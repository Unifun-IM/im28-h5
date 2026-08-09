import type { GatewayHTTPClient, GatewayMessage } from '@im28/im-sdk/web';

import { createWebIMSyncError } from './sync-context.js';
import { readString } from './realtime-event-data.js';

/** 从本地消息 cursor 正序分页补拉完整缺失窗口。 */
export async function pullRealtimeMessageRecovery(
  gatewayClient: GatewayHTTPClient,
  conversationID: string,
  fromSeq: string,
): Promise<readonly GatewayMessage[]> {
  // messages 仅在完整恢复成功后返回给持久化阶段。
  const messages: GatewayMessage[] = [];
  // seenCursors 阻止异常 next_seq 导致无限请求。
  const seenCursors = new Set<string>([fromSeq]);
  // cursor 始终保留 Gateway uint64 字符串。
  let cursor = fromSeq;
  for (let page = 0; page < 100; page += 1) {
    // response failure 必须向 runtime reporter 传播，不能伪装成功。
    const response = await gatewayClient.pullMessages({
      conversation_id: conversationID,
      from_seq: cursor,
      limit: 100,
      desc: false,
    });
    messages.push(...(response.messages ?? []));
    if (!response.has_more) return messages;
    // nextCursor 是继续恢复的唯一权威 cursor。
    const nextCursor = readString(response.next_seq);
    if (!nextCursor || seenCursors.has(nextCursor)) {
      throw createWebIMSyncError(
        'SYNC_RECOVERY_CURSOR_INVALID',
        'Gateway message recovery returned a missing or repeated cursor.',
      );
    }
    seenCursors.add(nextCursor);
    cursor = nextCursor;
  }
  throw createWebIMSyncError(
    'SYNC_RECOVERY_PAGE_LIMIT_EXCEEDED',
    'Gateway message recovery exceeded the safety page limit.',
  );
}
