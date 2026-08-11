import { statement } from '../../db/database.js';
import { Repository } from '../../db/repository.js';
import { parseJsonColumn, readOptionalNumber, readOptionalString, readRequiredNumber, readRequiredString, } from '../../db/row.js';
import { createMessageUpsertStatement } from './message-upsert.js';
import { assertMessageStatusTransition } from './status.js';
import { normalizePresetEmojiEntities } from './preset-emoji.js';
import { normalizeMessageMentions } from './mention.js';
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
function escapeLike(value) {
    return value.replace(/[\\%_]/g, match => `\\${match}`);
}
function mapMessageRow(row) {
    const serverMsgID = readOptionalString(row, 'server_msg_id');
    const seq = readOptionalNumber(row, 'seq');
    const localEx = readOptionalString(row, 'local_extra_json');
    // forwardSourceMsgID 保留普通转发失败行的服务端源身份。
    const forwardSourceMsgID = readOptionalString(row, 'forward_source_msg_id');
    // forwardBatchID 关联同一次批量提交的 optimistic 行。
    const forwardBatchID = readOptionalString(row, 'forward_batch_id');
    // payload 先解析一次，供正文与实体边界共同校验。
    const payload = parseJsonColumn(row, 'payload_json', null);
    // entities 独立于 payload 保存，读取时仍需按 Unicode 正文验证区间。
    const entities = normalizePresetEmojiEntities(parseJsonColumn(row, 'entities_json', []), readPayloadText(payload));
    // mentions 分列保存，避免服务端正文未回显 targets 时丢失提醒身份。
    const mentions = normalizeMessageMentions(parseJsonColumn(row, 'mentions_json', []));
    // forwardOrigin 与正文分列读取，避免 body 兼容字段成为第二真相。
    const forwardOrigin = parseForwardOrigin(row);
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
        ...(forwardOrigin ? { forwardOrigin } : {}),
        ...(forwardSourceMsgID ? { forwardSourceMsgID } : {}),
        ...(forwardBatchID ? { forwardBatchID } : {}),
        ...(localEx !== undefined ? { localEx } : {}),
        ...(entities.length ? { entities } : {}),
        ...(mentions.length ? { mentions } : {}),
        payload,
    };
}
/** 从 SQLite JSON 列恢复严格的转发来源快照。 */
function parseForwardOrigin(row) {
    // value 只接受普通对象，畸形缓存按无来源降级。
    const value = parseJsonColumn(row, 'forward_origin_json', null);
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return undefined;
    // record 用于逐字段收窄，不信任 JSON 的静态类型。
    const record = value;
    // userID 是来源快照的最低有效身份。
    const userID = typeof record.userID === 'string' ? record.userID.trim() : '';
    if (!userID)
        return undefined;
    // type/name/avatarURL 仅保留非空字符串。
    const type = typeof record.type === 'string' ? record.type.trim() : '';
    const name = typeof record.name === 'string' ? record.name.trim() : '';
    const avatarURL = typeof record.avatarURL === 'string' ? record.avatarURL.trim() : '';
    return {
        userID,
        ...(type ? { type } : {}),
        ...(name ? { name } : {}),
        ...(avatarURL ? { avatarURL } : {}),
    };
}
/** 从 core 文本 payload 安全读取 Unicode 正文。 */
function readPayloadText(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload))
        return '';
    // textContainer 对应 Gateway body.text 对象。
    const textContainer = payload.text;
    if (!textContainer || typeof textContainer !== 'object' || Array.isArray(textContainer))
        return '';
    // value 对应最终 UTF-16 正文。
    const value = textContainer.text;
    return typeof value === 'string' ? value : '';
}
//# sourceMappingURL=repository.js.map