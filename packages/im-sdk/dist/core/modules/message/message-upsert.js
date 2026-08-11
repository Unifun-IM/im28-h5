import { statement } from '../../db/database.js';
/** 生成单条消息 upsert 语句，供单写和事务批写复用。 */
export function createMessageUpsertStatement(message) {
    return statement(`INSERT OR REPLACE INTO messages (
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
      entities_json,
      forward_origin_json,
      forward_source_msg_id,
      forward_batch_id,
      local_extra_json,
      deleted,
      revoked,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, (SELECT local_extra_json FROM messages WHERE client_msg_id = ?), NULL), COALESCE((SELECT deleted FROM messages WHERE client_msg_id = ?), 0), COALESCE((SELECT revoked FROM messages WHERE client_msg_id = ?), 0), ?)`, [
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
        message.entities?.length ? JSON.stringify(message.entities) : null,
        message.forwardOrigin ? JSON.stringify(message.forwardOrigin) : null,
        message.forwardSourceMsgID ?? null,
        message.forwardBatchID ?? null,
        message.localEx ?? null,
        message.clientMsgID,
        message.clientMsgID,
        message.clientMsgID,
        Date.now(),
    ]);
}
//# sourceMappingURL=message-upsert.js.map