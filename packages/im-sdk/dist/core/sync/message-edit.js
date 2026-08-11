import { getIllustratedPresetEmoji, mapGatewayMessageToCore, MessageRepository, resolvePresetEmojiEntities, serializePresetEmojiEntities, trimPresetEmojiDocument, } from '@im28/im-sdk/core';
import { createWebIMClientMessageID, } from './message-send-state.js';
import { createWebIMSyncError } from './sync-context.js';
/** 判断缓存消息是否具备 RN 对齐的文本编辑资格。 */
export function canEditWebIMTextMessage(message) {
    return (message.direction === 'outgoing' &&
        message.contentType === 101 &&
        message.status === 'sent' &&
        Boolean(message.serverMsgID?.trim()) &&
        !message.forwardOrigin &&
        !message.forwardSourceMsgID &&
        !message.forwardBatchID &&
        Boolean(readMessageText(message).trim()));
}
/** 从当前账号缓存重读目标，成功后更新同一 SQLite 消息行。 */
export async function editWebIMTextMessage(context, options, dependencies) {
    // conversationID 和 clientMsgID 同时约束缓存与远端目标。
    const conversationID = options.conversationID.trim();
    const clientMsgID = options.clientMsgID.trim();
    if (!conversationID || !clientMsgID) {
        throw createWebIMSyncError('INVALID_MESSAGE_EDIT_TARGET', 'Message editing requires a conversation and cached message ID.');
    }
    // document 同步裁剪正文和实体偏移，保持发送与编辑语义一致。
    const document = trimPresetEmojiDocument({
        text: options.text,
        entities: options.entities ?? [],
    });
    if (!document.text) {
        throw createWebIMSyncError('INVALID_MESSAGE_EDIT_TEXT', 'Message editing requires non-empty text.');
    }
    // entities 只保留共享描述可解析且 fallback 完全匹配的身份。
    const entities = resolvePresetEmojiEntities(document.text, document.entities, getIllustratedPresetEmoji);
    // repository 是主动编辑唯一的 SQLite owner。
    const repository = new MessageRepository(context.database);
    // existing 必须从当前账号数据库读取，禁止页面提供消息正文或 server ID。
    const existing = await repository.getByClientMsgID(clientMsgID);
    if (!existing ||
        existing.conversationID !== conversationID ||
        existing.senderID !== context.userID ||
        !canEditWebIMTextMessage(existing)) {
        throw createWebIMSyncError('MESSAGE_EDIT_UNAVAILABLE', 'Only the current user\'s sent text messages can be edited.');
    }
    // operationClientMsgID 是本次 update 的稳定幂等身份。
    const operationClientMsgID = createWebIMClientMessageID(dependencies);
    // response reject 时不得提前修改本地消息。
    const response = await dependencies.gatewayClient.updateMessage({
        conversation_id: conversationID,
        target_msg_id: existing.serverMsgID,
        client_msg_id: operationClientMsgID,
        edit: {
            body: { text: { text: document.text } },
            entities: serializePresetEmojiEntities(entities, document.text),
        },
    });
    // remoteMessage 优先使用 operation 的完整 update，再使用目标消息快照。
    const remoteMessage = response.update?.message ?? response.target_message;
    // mapped 只在 Gateway 返回完整消息时参与正文收敛。
    const mapped = remoteMessage
        ? mapEditedGatewayMessage(remoteMessage, context, conversationID, existing)
        : null;
    // editedAt 优先使用服务端时间，缺失时使用注入时钟。
    const editedAt = readEditedAt(response.update?.occurred_at, remoteMessage) ||
        dependencies.now?.() || Date.now();
    // edited 保留原本地 identity/order/status，并以本次确认输入兜底缺失回显。
    const edited = {
        ...(mapped ?? existing),
        clientMsgID: existing.clientMsgID,
        serverMsgID: existing.serverMsgID,
        conversationID: existing.conversationID,
        senderID: existing.senderID,
        direction: existing.direction,
        contentType: existing.contentType,
        status: existing.status,
        sendTime: existing.sendTime,
        ...(existing.seq === undefined ? {} : { seq: existing.seq }),
        payload: { text: { text: document.text } },
        ...(entities.length ? { entities } : { entities: [] }),
        localEx: createEditedLocalExtra(existing.localEx, editedAt),
    };
    await repository.upsert(edited);
    return edited;
}
/** 映射完整 Gateway 回显并校验它仍指向原服务端消息。 */
function mapEditedGatewayMessage(remoteMessage, context, conversationID, existing) {
    // mapped 复用唯一 DTO -> core mapper。
    const mapped = mapGatewayMessageToCore(remoteMessage, {
        currentUserID: context.userID,
        conversationID,
    });
    if (mapped.serverMsgID && mapped.serverMsgID !== existing.serverMsgID) {
        throw createWebIMSyncError('MESSAGE_EDIT_TARGET_MISMATCH', 'Gateway returned a different edited message target.');
    }
    return mapped;
}
/** 为主动编辑保存与 realtime 相同的可审计时间字段。 */
function createEditedLocalExtra(current, editedAt) {
    // metadata 只保留有效对象 JSON，损坏旧值不向新记录传播。
    let metadata = {};
    try {
        // candidate 是缓存中的未知 localEx JSON。
        const candidate = current ? JSON.parse(current) : null;
        if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
            metadata = candidate;
        }
    }
    catch {
        metadata = {};
    }
    return JSON.stringify({ ...metadata, editedAt });
}
/** 从服务端 operation 或消息时间读取毫秒时间戳。 */
function readEditedAt(occurredAt, message) {
    // value 优先使用 operation 时间，再使用目标消息更新时间。
    const value = occurredAt?.trim() || message?.updated_at?.trim() || '';
    if (!value)
        return 0;
    // timestamp 拒绝无法解析的服务端值。
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? timestamp : 0;
}
/** 从共享消息 payload 读取普通文本正文。 */
function readMessageText(message) {
    if (!message.payload || typeof message.payload !== 'object' || Array.isArray(message.payload)) {
        return '';
    }
    // textValue 只接受 body.text 普通对象。
    const textValue = message.payload.text;
    if (!textValue || typeof textValue !== 'object' || Array.isArray(textValue))
        return '';
    // value 对应 Gateway body.text.text。
    const value = textValue.text;
    return typeof value === 'string' ? value : '';
}
//# sourceMappingURL=message-edit.js.map