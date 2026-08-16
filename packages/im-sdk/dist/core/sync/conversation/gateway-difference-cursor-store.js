import { statement } from '../../db/database.js';
// 账号 Difference 最终或中间 pts 使用独立 key，避免与旧 version cursor 混用。
export const ACCOUNT_DIFFERENCE_CURSOR_KEY = 'gateway_difference:account:pts';
// 分页 token 必须与中间 pts 成对持久化，刷新页面后才能继续同一轮同步。
export const ACCOUNT_DIFFERENCE_PAGE_TOKEN_KEY = 'gateway_difference:account:page_token';
// 会话 Difference 消息游标按会话隔离，且不复用会话展示字段。
const CONVERSATION_DIFFERENCE_PTS_PREFIX = 'gateway_difference:conversation:pts:';
/** 读取十进制游标，缺失时返回调用方提供的迁移回退值。 */
export async function readGatewayDifferenceCursor(database, key, fallback) {
    // value 仅接受无损十进制格式。
    const value = await readGatewayDifferenceValue(database, key);
    return value && /^\d+$/.test(value) ? value : fallback;
}
/** 读取可选同步值，供数字游标和不透明分页 token 复用。 */
export async function readGatewayDifferenceValue(database, key) {
    // rows 只读取单个主键，不扫描账号数据。
    const rows = await database.query({
        sql: 'SELECT cursor_value FROM sync_cursors WHERE cursor_key = ?',
        params: [key],
    });
    // value 空字符串视为缺失，避免构造非法请求。
    const value = rows[0]?.cursor_value;
    return typeof value === 'string' && value ? value : undefined;
}
/** 在当前事务中覆盖同步值。 */
export async function writeGatewayDifferenceValue(database, key, value) {
    await database.execute(statement(`INSERT OR REPLACE INTO sync_cursors (
      cursor_key, cursor_value, updated_at
    ) VALUES (?, ?, ?)`, [key, value, Date.now()]));
}
/** 在当前事务中删除已完成或已失效的同步值。 */
export async function deleteGatewayDifferenceValue(database, key) {
    await database.execute(statement('DELETE FROM sync_cursors WHERE cursor_key = ?', [key]));
}
/** 构造会话消息 Difference pts 的物理隔离 key。 */
export function createConversationDifferencePTSKey(conversationID) {
    return `${CONVERSATION_DIFFERENCE_PTS_PREFIX}${conversationID}`;
}
/** 与既有 message-update store 生成同一个 qts key。 */
export function createMessageUpdateCursorKey(conversationID) {
    return `message_updates:${conversationID}`;
}
//# sourceMappingURL=gateway-difference-cursor-store.js.map