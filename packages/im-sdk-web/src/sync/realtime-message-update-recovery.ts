import type { GatewayHTTPClient } from '@im28/im-sdk/web';

import { maxDecimalString, readString } from './realtime-event-data.js';
import {
  collectRealtimeMessageUpdates,
  normalizeUpdateSeq,
  type ParsedRealtimeMessageUpdate,
} from './realtime-message-update-data.js';
import { createWebIMSyncError } from './sync-context.js';

/** update recovery 返回排序后的操作与服务端最终 cursor。 */
export interface RealtimeMessageUpdateRecovery {
  readonly updates: readonly ParsedRealtimeMessageUpdate[];
  readonly finalCursor?: string;
}

/** 按 realtime cursor 状态选择直用事件或分页恢复。 */
export async function recoverRealtimeMessageUpdates(
  gatewayClient: GatewayHTTPClient,
  conversationID: string,
  storedCursor: string,
  eventUpdates: readonly ParsedRealtimeMessageUpdate[],
): Promise<RealtimeMessageUpdateRecovery> {
  // recovery 仅在 gap/latest cursor 表明缺失时请求 Gateway。
  const recovery = shouldRecoverUpdates(storedCursor, eventUpdates)
    ? await pullMessageUpdateRecovery(gatewayClient, conversationID, storedCursor)
    : { updates: [], finalCursor: undefined };
  return {
    updates: deduplicateAndSortUpdates([
      ...recovery.updates,
      ...eventUpdates,
    ]),
    ...(recovery.finalCursor
      ? { finalCursor: recovery.finalCursor }
      : {}),
  };
}

/** 判断 realtime update 是否遗漏 cursor 窗口。 */
function shouldRecoverUpdates(
  storedCursor: string,
  updates: readonly ParsedRealtimeMessageUpdate[],
): boolean {
  // minimumIncoming 是事件中最早有效 update seq。
  const minimumIncoming = maxDecimalString(
    updates.map(update => update.updateSeq),
    true,
  );
  // latestIncoming 是 batch 声明的服务端最新 update seq。
  const latestIncoming = maxDecimalString(
    updates.flatMap(update => [update.updateSeq, update.latestUpdateSeq]),
  );
  if (minimumIncoming && BigInt(minimumIncoming) > BigInt(storedCursor) + 1n) {
    return true;
  }
  return Boolean(
    latestIncoming &&
      BigInt(latestIncoming) > BigInt(minimumIncoming ?? storedCursor),
  );
}

/** 分页拉取服务端 update 缺口并验证每条 operation。 */
async function pullMessageUpdateRecovery(
  gatewayClient: GatewayHTTPClient,
  conversationID: string,
  fromCursor: string,
): Promise<RealtimeMessageUpdateRecovery> {
  // updates 在完整分页成功前只保存在内存。
  const updates: ParsedRealtimeMessageUpdate[] = [];
  // seenCursors 阻止 next_update_seq 循环。
  const seenCursors = new Set<string>([fromCursor]);
  // cursor 始终是无损十进制字符串。
  let cursor = fromCursor;
  for (let page = 0; page < 100; page += 1) {
    // response failure 直接传播给 runtime reporter。
    const response = await gatewayClient.pullMessageUpdates({
      conversation_id: conversationID,
      after_update_seq: cursor,
      limit: 100,
    });
    // list 必须逐条解析，禁止静默丢弃未知 update。
    const list = response.list ?? [];
    const parsed = collectRealtimeMessageUpdates(list);
    if (parsed.length !== list.length) {
      throw createWebIMSyncError(
        'INVALID_MESSAGE_UPDATE_RECOVERY',
        'Gateway message update recovery returned an invalid operation.',
      );
    }
    updates.push(...parsed);
    // nextCursor 可作为空页的权威最终 cursor。
    const nextCursor = normalizeUpdateSeq(response.next_update_seq);
    if (!response.has_more) {
      return { updates, ...(nextCursor ? { finalCursor: nextCursor } : {}) };
    }
    if (!nextCursor || seenCursors.has(nextCursor)) {
      throw createWebIMSyncError(
        'MESSAGE_UPDATE_CURSOR_INVALID',
        'Gateway message update recovery returned a missing or repeated cursor.',
      );
    }
    seenCursors.add(nextCursor);
    cursor = nextCursor;
  }
  throw createWebIMSyncError(
    'MESSAGE_UPDATE_PAGE_LIMIT_EXCEEDED',
    'Gateway message update recovery exceeded the safety page limit.',
  );
}

/** 按 update identity 去重并按 update_seq 升序排列。 */
function deduplicateAndSortUpdates(
  updates: readonly ParsedRealtimeMessageUpdate[],
): readonly ParsedRealtimeMessageUpdate[] {
  // unique 让 realtime 与 HTTP recovery 回显保持幂等。
  const unique = new Map<string, ParsedRealtimeMessageUpdate>();
  for (const parsed of updates) {
    // key 优先使用服务端 update_id。
    const key =
      readString(parsed.update.update_id) ??
      `${parsed.update.conversation_id}:${parsed.updateSeq ?? ''}:${parsed.update.type}:${parsed.update.target_msg_id}`;
    unique.set(key, parsed);
  }
  return [...unique.values()].sort((left, right) => {
    if (!left.updateSeq) return 1;
    if (!right.updateSeq) return -1;
    if (BigInt(left.updateSeq) === BigInt(right.updateSeq)) return 0;
    return BigInt(left.updateSeq) < BigInt(right.updateSeq) ? -1 : 1;
  });
}
