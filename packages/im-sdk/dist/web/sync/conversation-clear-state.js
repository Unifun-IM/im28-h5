import {} from '@im28/im-sdk/core';
import { statement } from '../db/database.js';
import { mapStoredConversationRow } from '../modules/conversation/repository.js';
import { createWebIMSyncError } from './sync-context.js';
/** Gateway 会话 cursor 的无符号 64 位上限。 */
const CONVERSATION_CURSOR_UINT64_MAX = 18446744073709551615n;
/** 归一化 Gateway uint64 cursor，拒绝空值、负数和非十进制输入。 */
export function normalizeConversationClearCursor(value) {
    /** text 只接受 number/string，避免对象隐式转换。 */
    const text = typeof value === 'number' || typeof value === 'string'
        ? String(value).trim()
        : '';
    if (!/^\d+$/.test(text)) {
        throw createWebIMSyncError('INVALID_CONVERSATION_CLEAR_CURSOR', 'Conversation clear requires an unsigned decimal cursor.');
    }
    try {
        /** cursor 拒绝超过 Gateway uint64 协议的十进制值。 */
        const cursor = BigInt(text);
        if (cursor > CONVERSATION_CURSOR_UINT64_MAX)
            throw new RangeError();
        return cursor.toString();
    }
    catch {
        throw createWebIMSyncError('INVALID_CONVERSATION_CLEAR_CURSOR', 'Conversation clear cursor exceeds the supported uint64 format.');
    }
}
/** 判断带精确 seq 的服务端消息是否位于当前清空边界之后。 */
export function isConversationMessageAfterClearBoundary(messageSeq, clearBeforeSeq) {
    if (!clearBeforeSeq || clearBeforeSeq === '0')
        return true;
    /** seq 缺失时不能把本地消息误判为边界内旧服务端消息。 */
    if (messageSeq === undefined || messageSeq === null || messageSeq === '') {
        return true;
    }
    /** normalizedSeq 与边界使用精确 BigInt 比较，不经过 JS number。 */
    const normalizedSeq = normalizeConversationClearCursor(messageSeq);
    /** normalizedBoundary 同时校验旧缓存边界仍满足 uint64 契约。 */
    const normalizedBoundary = normalizeConversationClearCursor(clearBeforeSeq);
    return BigInt(normalizedSeq) > BigInt(normalizedBoundary);
}
/** 比较十进制 cursor，返回更大的单调边界。 */
export function maxConversationClearCursor(left, right) {
    /** normalizedLeft 兼容 migration 默认值和旧缓存缺省。 */
    const normalizedLeft = left
        ? normalizeConversationClearCursor(left)
        : '0';
    return BigInt(normalizedLeft) >= BigInt(right) ? normalizedLeft : right;
}
/** 在一个 SQLite 事务中删除边界内消息并推进会话摘要。 */
export async function applyConversationClearBoundary(database, options) {
    /** conversationID 限定唯一会话分区。 */
    const conversationID = options.conversationID.trim();
    if (!conversationID) {
        throw createWebIMSyncError('INVALID_CONVERSATION_CLEAR_TARGET', 'Conversation clear requires a conversation ID.');
    }
    /** requestedBoundary 是本轮服务端确认的精确 cursor。 */
    const requestedBoundary = normalizeConversationClearCursor(options.clearBeforeSeq);
    return database.transaction(async (tx) => {
        /** rows 在 destructive SQL 前验证当前账号确有目标会话。 */
        const rows = await tx.query(statement('SELECT * FROM conversations WHERE conversation_id = ?', [
            conversationID,
        ]));
        if (!rows[0]) {
            throw createWebIMSyncError('CONVERSATION_NOT_FOUND', 'Conversation clear requires an existing cached conversation.');
        }
        /** current 提供旧边界、会话类型和本地展示字段。 */
        const current = mapStoredConversationRow(rows[0]);
        /** currentBoundary 是本地已经确认并应用过的单调边界。 */
        const currentBoundary = normalizeConversationClearCursor(current.clearBeforeSeq ?? '0');
        /** advancesBoundary 区分新控制通知与重复/乱序通知。 */
        const advancesBoundary = BigInt(requestedBoundary) > BigInt(currentBoundary);
        if (!advancesBoundary && options.removeUnsequencedBefore === undefined) {
            return current;
        }
        /** clearBeforeSeq 只能单调前进，重复/乱序通知保持幂等。 */
        const clearBeforeSeq = maxConversationClearCursor(current.clearBeforeSeq, requestedBoundary);
        /** localCondition 只由主动清空操作删除调用开始前的无 seq 行。 */
        const localCondition = options.removeUnsequencedBefore === undefined
            ? ''
            : ' OR (seq_text IS NULL AND send_time <= ?)';
        await tx.execute(statement(`DELETE FROM messages
         WHERE conversation_id = ? AND (
           (seq_text IS NOT NULL AND (
             length(seq_text) < length(?)
             OR (length(seq_text) = length(?) AND seq_text <= ?)
           ))${localCondition}
         )`, [
            conversationID,
            clearBeforeSeq,
            clearBeforeSeq,
            clearBeforeSeq,
            ...(options.removeUnsequencedBefore === undefined
                ? []
                : [options.removeUnsequencedBefore]),
        ]));
        /** survivingRows 保留并发到达或操作后产生的最新消息。 */
        const survivingRows = await tx.query(statement(`SELECT * FROM messages
         WHERE conversation_id = ? AND deleted = 0
         ORDER BY send_time DESC
         LIMIT 1`, [conversationID]));
        /** latestMessageID 只引用事务内仍存在的消息。 */
        const latestMessageID = readRowString(survivingRows[0], 'client_msg_id');
        /** lastReadSeq 至少推进到清空边界。 */
        const lastReadSeq = maxConversationClearCursor(current.lastReadSeq, clearBeforeSeq);
        /** listHidden 只在无并发新消息的单聊清空后启用。 */
        const listHidden = current.type === 'single' && !latestMessageID;
        /** currentWithoutLatest 避免无幸存消息时保留已删除的旧摘要指针。 */
        const { latestMessageID: previousLatestMessageID, ...currentWithoutLatest } = current;
        void previousLatestMessageID;
        /** next 是事务提交后返回给平台投影的唯一快照。 */
        const next = {
            ...currentWithoutLatest,
            ...(latestMessageID ? { latestMessageID } : {}),
            lastReadSeq,
            clearBeforeSeq,
            listHidden,
            unreadCount: 0,
            updatedAt: Math.max(current.updatedAt, options.updatedAt ?? 0),
        };
        await tx.execute(statement(`UPDATE conversations
         SET latest_message_id = ?, unread_count = 0,
             clear_before_seq = ?, list_hidden = ?, raw_json = ?, updated_at = ?
         WHERE conversation_id = ?`, [
            latestMessageID ?? null,
            clearBeforeSeq,
            Number(listHidden),
            JSON.stringify(next),
            next.updatedAt,
            conversationID,
        ]));
        return next;
    });
}
/** 从可选数据库行安全读取非空字符串。 */
function readRowString(row, key) {
    if (!row)
        return undefined;
    /** value 来自受控 SELECT 列。 */
    const value = row[key];
    return typeof value === 'string' && value ? value : undefined;
}
//# sourceMappingURL=conversation-clear-state.js.map