import { ConversationRepository, MessageRepository, getIllustratedPresetEmoji, normalizeCustomEmojiID, normalizeCustomEmojiURL, resolvePresetEmojiEntities, serializePresetEmojiEntities, } from '@im28/im-sdk/core';
import { completeWebIMMessageSend, failWebIMMessageSend, } from './message-send-state.js';
import { WEB_IM_UPLOADED_MEDIA_RETRY_CONTENT_TYPES, canRetryWebIMUploadedMediaMessage, normalizeWebIMUploadedMediaBody, } from './message-media-retry.js';
import { createWebIMSyncError } from './sync-context.js';
import { normalizeWebIMQuoteBody } from './message-quote-send.js';
import { normalizeWebIMCardBody } from './message-card-send.js';
/** 当前可由持久化 payload 完整恢复的消息类型。 */
export const WEB_IM_RETRYABLE_CONTENT_TYPES = [
    101,
    114,
    108,
    ...WEB_IM_UPLOADED_MEDIA_RETRY_CONTENT_TYPES,
    115,
];
/** SDK 对 UI 公开的重试能力判断，防止应用复制支持矩阵。 */
export function canRetryWebIMMessage(message) {
    if (message.direction !== 'outgoing' || message.status !== 'failed')
        return false;
    if (WEB_IM_UPLOADED_MEDIA_RETRY_CONTENT_TYPES.some(contentType => contentType === message.contentType)) {
        return canRetryWebIMUploadedMediaMessage(message);
    }
    try {
        buildWebIMPersistedMessageRequest(message);
        return true;
    }
    catch {
        return false;
    }
}
/** 从当前账号 SQLite 恢复请求并重试同一条失败消息。 */
export async function retryWebIMMessage(context, options, dependencies) {
    // clientMsgID 是查询、本地状态和 Gateway 幂等请求的共同身份。
    const clientMsgID = options.clientMsgID.trim();
    if (!clientMsgID) {
        throw createWebIMSyncError('INVALID_RETRY_MESSAGE_ID', 'Message retry requires a client message ID.');
    }
    // messageRepository 只绑定本轮认证账号数据库。
    const messageRepository = new MessageRepository(context.database);
    // localMessage 必须是当前账号已持久化的真实失败行。
    const localMessage = await messageRepository.getByClientMsgID(clientMsgID);
    if (!localMessage) {
        throw createWebIMSyncError('RETRY_MESSAGE_NOT_FOUND', 'Message retry requires an existing cached message.');
    }
    assertRetryableMessage(context, localMessage);
    // conversationRepository 阻止向已删除缓存会话继续发送。
    const conversationRepository = new ConversationRepository(context.database);
    // conversation 只用于存在性校验，不从消息 payload 猜测目标。
    const conversation = await conversationRepository.getByID(localMessage.conversationID);
    if (!conversation) {
        throw createWebIMSyncError('RETRY_CONVERSATION_NOT_FOUND', 'Message retry requires an existing cached conversation.');
    }
    // request 从受支持的持久化快照严格恢复，畸形数据不会改变状态。
    const request = buildWebIMPersistedMessageRequest(localMessage);
    await messageRepository.updateStatus(clientMsgID, 'sending');
    // sendingMessage 供页面立即替换同一可见实体，不创建新身份。
    const sendingMessage = { ...localMessage, status: 'sending' };
    // prepared 复用通用 Gateway 完成与失败状态机。
    const prepared = {
        context,
        conversationID: localMessage.conversationID,
        clientMsgID,
        localMessage: sendingMessage,
        conversationRepository,
        messageRepository,
    };
    // sentMessage 只覆盖 Gateway send 与通用 sent 持久化阶段。
    let sentMessage;
    try {
        // onSending 只收到已落库实体，回调异常也必须恢复 failed。
        options.onSending?.(sendingMessage);
        // Gateway 必须回显相同 client ID 后才能持久化成功。
        sentMessage = await completeWebIMMessageSend(prepared, request.body, dependencies, request.entities);
    }
    catch (cause) {
        return failWebIMMessageSend(prepared, cause);
    }
    // Gateway 已成功后，本地 URL 补全失败不得伪装成远端发送失败。
    return localMessage.contentType === 115
        ? persistCustomEmojiSnapshot(context, localMessage, sentMessage)
        : sentMessage;
}
/** 校验消息归属、失败状态与已注册类型。 */
function assertRetryableMessage(context, message) {
    if (message.direction !== 'outgoing' ||
        message.senderID !== context.userID ||
        message.status !== 'failed') {
        throw createWebIMSyncError('MESSAGE_RETRY_NOT_ALLOWED', 'Only a failed outgoing message from the current account can be retried.');
    }
    if (!canRetryWebIMMessage(message)) {
        throw createWebIMSyncError('MESSAGE_RETRY_UNSUPPORTED', 'This persisted message type cannot be retried safely.');
    }
}
/** 从受支持消息的持久化 payload 重建精确 Gateway body。 */
export function buildWebIMPersistedMessageRequest(message) {
    if (message.contentType === 101)
        return buildTextRetryRequest(message);
    if (message.contentType === 114) {
        return { body: normalizeWebIMQuoteBody(message.payload) };
    }
    if (message.contentType === 108) {
        return { body: normalizeWebIMCardBody(message.payload) };
    }
    if (WEB_IM_UPLOADED_MEDIA_RETRY_CONTENT_TYPES.some(contentType => contentType === message.contentType)) {
        return {
            body: normalizeWebIMUploadedMediaBody(message.contentType, message.payload),
        };
    }
    if (message.contentType === 115)
        return buildCustomEmojiRetryRequest(message);
    throw createWebIMSyncError('MESSAGE_RETRY_UNSUPPORTED', 'This persisted message type cannot be retried safely.');
}
/** 恢复文本正文和经 shared 描述表重新验证的 preset entities。 */
function buildTextRetryRequest(message) {
    // text 从原 optimistic payload 读取，禁止 UI 重新提交草稿。
    const text = readNestedString(message.payload, 'text', 'text').trim();
    if (!text) {
        throw createWebIMSyncError('INVALID_RETRY_MESSAGE_PAYLOAD', 'The cached text message cannot be reconstructed.');
    }
    // entities 重新验证 identity、fallback 和 UTF-16 边界。
    const entities = resolvePresetEmojiEntities(text, message.entities ?? [], getIllustratedPresetEmoji);
    // gatewayEntities 使用既有 snake_case wire contract。
    const gatewayEntities = serializePresetEmojiEntities(entities, text);
    return {
        body: { text: { text } },
        ...(gatewayEntities.length ? { entities: gatewayEntities } : {}),
    };
}
/** 恢复自定义表情 ID，并重新校验仅用于本地展示的 URL。 */
function buildCustomEmojiRetryRequest(message) {
    // emojiID 是 Gateway 唯一接收的自定义表情字段。
    const emojiID = normalizeCustomEmojiID(readNestedString(message.payload, 'emoji', 'emoji_id'));
    // url 必须仍是安全绝对地址，否则整条失败行不可重试。
    normalizeCustomEmojiURL(readNestedString(message.payload, 'emoji', 'url'));
    return { body: { emoji: { emoji_id: emojiID } } };
}
/** 成功回包缺少展示地址时保留原 type115 URL snapshot。 */
async function persistCustomEmojiSnapshot(context, localMessage, sentMessage) {
    // emojiID 继续使用已通过请求构造校验的本地身份。
    const emojiID = normalizeCustomEmojiID(readNestedString(localMessage.payload, 'emoji', 'emoji_id'));
    // localURL 是重试前持久化的最后可信展示快照。
    const localURL = normalizeCustomEmojiURL(readNestedString(localMessage.payload, 'emoji', 'url'));
    // remoteURL 只有身份一致且 URL 安全时才覆盖本地快照。
    const remoteID = readNestedString(sentMessage.payload, 'emoji', 'emoji_id');
    // remoteCandidate 允许 Gateway 省略 URL。
    const remoteCandidate = readNestedString(sentMessage.payload, 'emoji', 'url');
    // remoteURL 校验失败时为空，不让不可信响应破坏原快照。
    let remoteURL = '';
    if (remoteID === emojiID && remoteCandidate) {
        try {
            remoteURL = normalizeCustomEmojiURL(remoteCandidate);
        }
        catch {
            remoteURL = '';
        }
    }
    // persistedMessage 保持同一消息身份与可渲染 URL。
    const persistedMessage = {
        ...sentMessage,
        payload: { emoji: { emoji_id: emojiID, url: remoteURL || localURL } },
    };
    await new MessageRepository(context.database).upsert(persistedMessage);
    return persistedMessage;
}
/** 从两层未知对象中读取字符串字段，拒绝数组和隐式类型转换。 */
function readNestedString(value, containerKey, fieldKey) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return '';
    // container 是 Gateway body 对应的一级对象。
    const container = value[containerKey];
    if (!container || typeof container !== 'object' || Array.isArray(container)) {
        return '';
    }
    // field 保持原始字符串语义，不接受 number coercion。
    const field = container[fieldKey];
    return typeof field === 'string' ? field : '';
}
//# sourceMappingURL=message-retry.js.map