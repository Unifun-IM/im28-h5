import { statement } from '../../db/database.js';
import { mapStoredMessageRow } from './message-row.js';
/** 从当前账号 SQLite 读取未读区间内最近一条命中本人或全员的 incoming mention。 */
export async function findLatestUnreadMention(database, options) {
    /** conversationID 防止空会话扩大查询范围。 */
    const conversationID = options.conversationID.trim();
    /** currentUserID 只用于匹配结构化 mention 身份，不检查正文。 */
    const currentUserID = options.currentUserID.trim();
    /** lastReadSeq 只接受 SQLite/JS 当前共同支持的非负安全整数。 */
    const lastReadSeq = Number.isSafeInteger(options.lastReadSeq) && options.lastReadSeq >= 0
        ? options.lastReadSeq
        : null;
    if (!conversationID || !currentUserID || lastReadSeq === null)
        return null;
    /** userIdentityFragment 使用 JSON 编码避免特殊字符改变精确身份匹配。 */
    const userIdentityFragment = `"userID":${JSON.stringify(currentUserID)}`;
    /** rows 只取服务端有序、未读、未删除且来自他人的结构化 mention。 */
    const rows = await database.query(statement(`SELECT * FROM messages
       WHERE conversation_id = ?
         AND direction = 'incoming'
         AND deleted = 0
         AND revoked = 0
         AND seq IS NOT NULL
         AND seq > ?
         AND mentions_json IS NOT NULL
         AND (
           INSTR(mentions_json, ?) > 0
           OR INSTR(mentions_json, '"type":"all"') > 0
         )
       ORDER BY send_time DESC, seq DESC
       LIMIT 1`, [conversationID, lastReadSeq, userIdentityFragment]));
    return rows[0] ? mapStoredMessageRow(rows[0]) : null;
}
//# sourceMappingURL=unread-mention.js.map