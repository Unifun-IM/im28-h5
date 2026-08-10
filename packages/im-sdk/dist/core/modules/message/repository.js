import { statement } from '../../db/database.js';
import { Repository } from '../../db/repository.js';
import { parseJsonColumn, readOptionalNumber, readOptionalString, readRequiredNumber, readRequiredString, } from '../../db/row.js';
import { assertMessageStatusTransition } from './status.js';
export class MessageRepository extends Repository {
    constructor(database) {
        super(database);
    }
    async upsert(message) {
        await this.execute(statement(`INSERT OR REPLACE INTO messages (
          client_msg_id,
          server_msg_id,
          conversation_id,
          sender_id,
          direction,
          content_type,
          status,
          send_time,
          seq,
          payload_json,
          local_extra_json,
          deleted,
          revoked,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, (SELECT local_extra_json FROM messages WHERE client_msg_id = ?), NULL), COALESCE((SELECT deleted FROM messages WHERE client_msg_id = ?), 0), COALESCE((SELECT revoked FROM messages WHERE client_msg_id = ?), 0), ?)`, [
            message.clientMsgID,
            message.serverMsgID ?? null,
            message.conversationID,
            message.senderID,
            message.direction,
            message.contentType,
            message.status,
            message.sendTime,
            message.seq ?? null,
            JSON.stringify(message.payload),
            message.localEx ?? null,
            message.clientMsgID,
            message.clientMsgID,
            message.clientMsgID,
            Date.now(),
        ]));
    }
    async getByClientMsgID(clientMsgID) {
        const rows = await this.query(statement('SELECT * FROM messages WHERE client_msg_id = ?', [clientMsgID]));
        return rows[0] ? mapMessageRow(rows[0]) : null;
    }
    async getByServerMsgID(serverMsgID) {
        const rows = await this.query(statement('SELECT * FROM messages WHERE server_msg_id = ?', [serverMsgID]));
        return rows[0] ? mapMessageRow(rows[0]) : null;
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
                .map(mapMessageRow)
                .sort((left, right) => right.sendTime - left.sendTime);
            return messages;
        }
        const rows = await this.query(statement(`SELECT * FROM messages
         WHERE conversation_id = ? AND send_time < ? AND deleted = 0
         ORDER BY send_time DESC
         LIMIT ?`, [options.conversationID, beforeSendTime, limit]));
        return rows.map(mapMessageRow);
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
        return rows.map(mapMessageRow);
    }
    async updateStatus(clientMsgID, status) {
        const existing = await this.getByClientMsgID(clientMsgID);
        if (!existing) {
            return;
        }
        assertMessageStatusTransition(existing.status, status);
        await this.execute(statement('UPDATE messages SET status = ?, updated_at = ? WHERE client_msg_id = ?', [status, Date.now(), clientMsgID]));
    }
    async markLocalDeleted(clientMsgID) {
        await this.execute(statement('UPDATE messages SET deleted = 1, status = ?, updated_at = ? WHERE client_msg_id = ?', [
            'deleted_local',
            Date.now(),
            clientMsgID,
        ]));
    }
    async deleteByConversationID(conversationID) {
        await this.execute(statement('DELETE FROM messages WHERE conversation_id = ?', [
            conversationID,
        ]));
    }
}
function escapeLike(value) {
    return value.replace(/[\\%_]/g, match => `\\${match}`);
}
function mapMessageRow(row) {
    const serverMsgID = readOptionalString(row, 'server_msg_id');
    const seq = readOptionalNumber(row, 'seq');
    const localEx = readOptionalString(row, 'local_extra_json');
    return {
        clientMsgID: readRequiredString(row, 'client_msg_id'),
        ...(serverMsgID !== undefined ? { serverMsgID } : {}),
        conversationID: readRequiredString(row, 'conversation_id'),
        senderID: readRequiredString(row, 'sender_id'),
        direction: readRequiredString(row, 'direction'),
        contentType: readRequiredNumber(row, 'content_type'),
        status: readRequiredString(row, 'status'),
        sendTime: readRequiredNumber(row, 'send_time'),
        ...(seq !== undefined ? { seq } : {}),
        ...(localEx !== undefined ? { localEx } : {}),
        payload: parseJsonColumn(row, 'payload_json', null),
    };
}
//# sourceMappingURL=repository.js.map