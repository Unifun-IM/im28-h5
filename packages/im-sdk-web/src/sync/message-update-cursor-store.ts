import type { DatabaseAdapter } from '@im28/im-sdk/web';

import { createWebIMSyncError } from './sync-context.js';

// cursor key 前缀与其他同步能力保持物理隔离。
const MESSAGE_UPDATE_CURSOR_PREFIX = 'message_updates:';

/** 读取指定会话最后成功应用的 message update cursor。 */
export async function readMessageUpdateCursor(
  database: DatabaseAdapter,
  conversationID: string,
): Promise<string> {
  // cursorKey 使用稳定 conversation ID 构造。
  const cursorKey = createCursorKey(conversationID);
  // rows 直接读取 shared schema 的 sync_cursors 表。
  const rows = await database.query({
    sql: 'SELECT cursor_value FROM sync_cursors WHERE cursor_key = ?',
    params: [cursorKey],
  });
  // value 缺失时从服务端 cursor 0 开始恢复。
  const value = rows[0]?.cursor_value;
  return typeof value === 'string' && /^\d+$/.test(value) ? value : '0';
}

/** 在 update 成功应用后推进当前会话 cursor。 */
export async function writeMessageUpdateCursor(
  database: DatabaseAdapter,
  conversationID: string,
  cursor: string,
): Promise<void> {
  if (!/^\d+$/.test(cursor)) {
    throw createWebIMSyncError(
      'INVALID_MESSAGE_UPDATE_CURSOR',
      'Message update cursor must be an unsigned decimal string.',
    );
  }
  // cursorKey 与读取路径完全一致。
  const cursorKey = createCursorKey(conversationID);
  await database.execute({
    sql: `INSERT OR REPLACE INTO sync_cursors (
      cursor_key, cursor_value, updated_at
    ) VALUES (?, ?, ?)`,
    params: [cursorKey, cursor, Date.now()],
  });
}

/** 校验会话 ID 并构造 cursor primary key。 */
function createCursorKey(conversationID: string): string {
  // normalizedConversationID 禁止空 cursor owner。
  const normalizedConversationID = conversationID.trim();
  if (!normalizedConversationID) {
    throw createWebIMSyncError(
      'INVALID_MESSAGE_UPDATE_CONVERSATION',
      'Message update cursor requires a conversation ID.',
    );
  }
  return `${MESSAGE_UPDATE_CURSOR_PREFIX}${normalizedConversationID}`;
}
