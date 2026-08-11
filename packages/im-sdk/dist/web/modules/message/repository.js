import { statement } from '../../db/database.js';
import { Repository } from '../../db/repository.js';
import { createMessageUpsertStatement } from './message-upsert.js';
import { mapStoredMessageRow } from './message-row.js';
import { assertMessageStatusTransition } from './status.js';
export class MessageRepository extends Repository {
    constructor(database) {
        super(database);
    }
    async upsert(message) {
        await this.execute(createMessageUpsertStatement(message));
    }
    /** 在一个数据库事务中写入同一批消息，避免 optimistic 批次部分落库。 */
    async upsertMany(messages) {
        if (!messages.length)
            return;
        await this.transaction(async (tx) => {
            // message 按调用顺序写入，保留批量转发的稳定展示顺序。
            for (const message of messages) {
                await tx.execute(createMessageUpsertStatement(message));
            }
        });
    }
    async getByClientMsgID(clientMsgID) {
        const rows = await this.query(statement('SELECT * FROM messages WHERE client_msg_id = ?', [clientMsgID]));
        return rows[0] ? mapStoredMessageRow(rows[0]) : null;
    }
    async getByServerMsgID(serverMsgID) {
        const rows = await this.query(statement('SELECT * FROM messages WHERE server_msg_id = ?', [serverMsgID]));
        return rows[0] ? mapStoredMessageRow(rows[0]) : null;
    }
    async getHistory(options) {
        const limit = options.limit ?? 30;
        const beforeSendTime = options.beforeSendTime ?? Number.MAX_SAFE_INTEGER;
        if (options.maxSeq !== undefined) {
            // 有 seq 的消息严格占用历史窗口，无 seq 的本地发送消息额外保留。
            const sequencedRows = await this.query(statement(`SELECT * FROM messages
           WHERE conversation_id = ? AND send_time < ? AND deleted = 0
             AND seq IS NOT NULL AND seq <= ?
           ORDER BY seq DESC
           LIMIT ?`, [
                options.conversationID,
                beforeSendTime,
                options.maxSeq,
                limit,
            ]));
            // 未取得服务器 seq 的本地消息不能因分段恢复而从聊天页消失。
            const unsequencedRows = await this.query(statement(`SELECT * FROM messages
           WHERE conversation_id = ? AND send_time < ? AND deleted = 0
             AND seq IS NULL
           ORDER BY send_time DESC
           LIMIT ?`, [options.conversationID, beforeSendTime, limit]));
            // 返回顺序保持与普通历史查询一致，调用方仍可按自身规则重排。
            const messages = [...sequencedRows, ...unsequencedRows]
                .map(mapStoredMessageRow)
                .sort((left, right) => right.sendTime - left.sendTime);
            return messages;
        }
        const rows = await this.query(statement(`SELECT * FROM messages
         WHERE conversation_id = ? AND send_time < ? AND deleted = 0
         ORDER BY send_time DESC
         LIMIT ?`, [options.conversationID, beforeSendTime, limit]));
        return rows.map(mapStoredMessageRow);
    }
    async search(options) {
        const params = [];
        const conditions = ['deleted = 0', 'revoked = 0'];
        if (options.conversationID?.trim()) {
            conditions.push('conversation_id = ?');
            params.push(options.conversationID.trim());
        }
        const contentTypes = options.contentTypes ?? [];
        if (contentTypes.length) {
            conditions.push(`content_type IN (${contentTypes.map(() => '?').join(', ')})`);
            params.push(...contentTypes);
        }
        if (Number.isFinite(options.afterSendTime)) {
            conditions.push('send_time >= ?');
            params.push(options.afterSendTime);
        }
        if (Number.isFinite(options.beforeSendTime)) {
            conditions.push('send_time < ?');
            params.push(options.beforeSendTime);
        }
        const keyword = options.keyword?.trim();
        if (keyword) {
            conditions.push("payload_json LIKE ? ESCAPE '\\'");
            params.push(`%${escapeLike(keyword)}%`);
        }
        params.push(options.limit ?? 100, options.offset ?? 0);
        const rows = await this.query(statement(`SELECT * FROM messages
         WHERE ${conditions.join(' AND ')}
         ORDER BY send_time DESC
         LIMIT ? OFFSET ?`, params));
        return rows.map(mapStoredMessageRow);
    }
    async updateStatus(clientMsgID, status) {
        const existing = await this.getByClientMsgID(clientMsgID);
        if (!existing) {
            return;
        }
        assertMessageStatusTransition(existing.status, status);
        await this.execute(statement('UPDATE messages SET status = ?, updated_at = ? WHERE client_msg_id = ?', [status, Date.now(), clientMsgID]));
    }
    /** 将指定账号遗留的 outgoing sending 行恢复为可显式重试状态。 */
    async failInterruptedOutgoingSends(senderID) {
        // normalizedSenderID 防止空 owner 扩大更新范围。
        const normalizedSenderID = senderID.trim();
        if (!normalizedSenderID)
            return 0;
        // result 只统计当前账号、未删除、发送方向明确的中断行。
        const result = await this.database.execute(statement(`UPDATE messages
         SET status = ?, updated_at = ?
         WHERE sender_id = ? AND direction = ? AND status = ? AND deleted = 0`, ['failed', Date.now(), normalizedSenderID, 'outgoing', 'sending']));
        return result.rowsAffected ?? 0;
    }
    async markLocalDeleted(clientMsgID) {
        await this.execute(statement('UPDATE messages SET deleted = 1, status = ?, updated_at = ? WHERE client_msg_id = ?', [
            'deleted_local',
            Date.now(),
            clientMsgID,
        ]));
    }
    /** 在单个事务中隐藏已获确认的消息集合。 */
    async markLocalDeletedMany(clientMsgIDs) {
        // normalizedIDs 防止重复更新并阻止空身份进入 SQL。
        const normalizedIDs = Array.from(new Set(clientMsgIDs.map(clientMsgID => clientMsgID.trim()).filter(Boolean)));
        if (!normalizedIDs.length)
            return;
        await this.transaction(async (tx) => {
            // updatedAt 保证同批删除拥有一致的本地修改时间。
            const updatedAt = Date.now();
            for (const clientMsgID of normalizedIDs) {
                await tx.execute(statement('UPDATE messages SET deleted = 1, status = ?, updated_at = ? WHERE client_msg_id = ?', ['deleted_local', updatedAt, clientMsgID]));
            }
        });
    }
    async deleteByConversationID(conversationID) {
        await this.execute(statement('DELETE FROM messages WHERE conversation_id = ?', [
            conversationID,
        ]));
    }
}
/** 转义 SQLite LIKE 通配符，避免关键词扩大搜索范围。 */
function escapeLike(value) {
    return value.replace(/[\\%_]/g, match => `\\${match}`);
}
//# sourceMappingURL=repository.js.map