import { ConversationRepository, MessageRepository, mapGatewayMessageToCore, } from '@im28/im-sdk/core';
import { createWebIMSyncError } from './sync-context.js';
/** 校验会话并将 outgoing message 以 sending 状态写入账号 SQLite。 */
export async function prepareWebIMMessageSend(context, definition, dependencies) {
    // conversationID 是本地与远端发送的共同分区键。
    const conversationID = definition.conversationID.trim();
    if (!conversationID) {
        throw createWebIMSyncError('INVALID_MESSAGE_TARGET', 'Message sending requires a conversation ID.');
    }
    // conversationRepository 阻止向不存在的本地目标构造 fake session。
    const conversationRepository = new ConversationRepository(context.database);
    // conversation 必须来自当前账号 cache。
    const conversation = await conversationRepository.getByID(conversationID);
    if (!conversation) {
        throw createWebIMSyncError('CONVERSATION_NOT_FOUND', 'Message sending requires an existing cached conversation.');
    }
    // messageRepository 管理稳定 ID 冲突校验和同一实体的状态收敛。
    const messageRepository = new MessageRepository(context.database);
    // clientMsgID 在 upload、Gateway send 与状态更新中保持不变。
    const clientMsgID = await resolveWebIMClientMessageID(context, definition, dependencies, messageRepository);
    // localMessage 在任何远端 I/O 前持久化。
    const localMessage = {
        clientMsgID,
        conversationID,
        senderID: context.userID,
        direction: 'outgoing',
        contentType: definition.contentType,
        status: 'sending',
        sendTime: dependencies.now?.() ?? Date.now(),
        ...(definition.entities?.length ? { entities: definition.entities } : {}),
        ...(definition.mentions?.length ? { mentions: definition.mentions } : {}),
        payload: definition.payload,
    };
    await messageRepository.upsert(localMessage);
    await conversationRepository.updateLatestMessage(conversationID, clientMsgID, localMessage.sendTime);
    return {
        context,
        conversationID,
        clientMsgID,
        localMessage,
        conversationRepository,
        messageRepository,
    };
}
/** 在 Gateway 调用前把可重放 body 持久化到同一 optimistic row。 */
export async function checkpointWebIMMessageSendBody(prepared, body) {
    // localMessage 只替换 payload，保留 client ID、状态和发送时间。
    const localMessage = { ...prepared.localMessage, payload: body };
    await prepared.messageRepository.upsert(localMessage);
    return { ...prepared, localMessage };
}
/** 调用 Gateway 并将同一 optimistic row 收敛为 sent。 */
export async function completeWebIMMessageSend(prepared, body, dependencies, entities, mentions) {
    // remoteMessage 必须回显相同幂等 ID，避免产生双消息。
    const remoteMessage = await dependencies.gatewayClient.sendMessage({
        conversation_id: prepared.conversationID,
        client_msg_id: prepared.clientMsgID,
        body,
        ...(entities?.length ? { entities } : {}),
        ...(mentions?.length ? { mentions } : {}),
    });
    // sentMessage 使用共享 Gateway mapper，禁止业务层复制 DTO 解析。
    const sentMessage = mapGatewayMessageToCore(remoteMessage, {
        currentUserID: prepared.context.userID,
        conversationID: prepared.conversationID,
    });
    if (sentMessage.clientMsgID !== prepared.clientMsgID) {
        throw createWebIMSyncError('CLIENT_MESSAGE_ID_MISMATCH', 'Gateway returned a different client message ID.');
    }
    // persistedMessage 显式覆盖异常远端状态为成功终态。
    const persistedMessage = {
        ...sentMessage,
        status: 'sent',
        ...(sentMessage.entities?.length
            ? { entities: sentMessage.entities }
            : prepared.localMessage.entities?.length
                ? { entities: prepared.localMessage.entities }
                : {}),
        ...(sentMessage.mentions?.length
            ? { mentions: sentMessage.mentions }
            : prepared.localMessage.mentions?.length
                ? { mentions: prepared.localMessage.mentions }
                : {}),
    };
    await prepared.messageRepository.upsert(persistedMessage);
    await prepared.conversationRepository.updateLatestMessage(prepared.conversationID, prepared.clientMsgID, sentMessage.sendTime);
    return persistedMessage;
}
/** 将远端任一步失败持久化到同一 optimistic row。 */
export async function failWebIMMessageSend(prepared, cause) {
    try {
        await prepared.messageRepository.updateStatus(prepared.clientMsgID, 'failed');
    }
    catch (statusCause) {
        throw new AggregateError([cause, statusCause], 'Message send and failed-state persistence both failed.');
    }
    throw cause;
}
/** 为无需平台上传的 body 执行完整 optimistic send 状态机。 */
export async function executeWebIMMessageSend(context, definition, body, dependencies, entities, mentions, execution) {
    // prepared 保证 Gateway 调用前已有可见 sending row。
    const prepared = await prepareWebIMMessageSend(context, definition, dependencies);
    // onSending 在本地 sending 行可读取后、任何远端 I/O 前通知平台层。
    execution?.onSending?.(prepared.localMessage);
    // maxAttempts 默认保持 Web 现有单次调用，RN 可显式保留三次策略。
    const maxAttempts = normalizeSendMaxAttempts(execution?.maxAttempts);
    // lastCause 保存最后一次真实发送或状态收敛错误。
    let lastCause;
    try {
        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            try {
                return await completeWebIMMessageSend(prepared, body, dependencies, execution?.entities ?? entities, execution?.mentions ?? mentions);
            }
            catch (cause) {
                lastCause = cause;
                if (attempt >= maxAttempts)
                    break;
                await execution?.waitBeforeRetry?.(attempt);
            }
        }
        throw lastCause;
    }
    catch (cause) {
        return failWebIMMessageSend(prepared, cause);
    }
}
/** 解析平台提供或 SDK 生成的 client ID，并阻止覆盖不相关缓存行。 */
async function resolveWebIMClientMessageID(context, definition, dependencies, repository) {
    // requestedID 缺省时沿用 SDK 生成逻辑。
    const requestedID = definition.clientMsgID?.trim() ?? '';
    if (!requestedID)
        return createWebIMClientMessageID(dependencies);
    // existing 是同一账号库内可能被 optimistic upsert 覆盖的实体。
    const existing = await repository.getByClientMsgID(requestedID);
    if (!existing)
        return requestedID;
    // reusable 只允许同会话、同发送者、同类型的失败 outgoing 重试。
    const reusable = existing.conversationID === definition.conversationID.trim() &&
        existing.senderID === context.userID &&
        existing.direction === 'outgoing' &&
        existing.contentType === definition.contentType &&
        existing.status === 'failed';
    if (!reusable) {
        throw createWebIMSyncError('CLIENT_MESSAGE_ID_CONFLICT', 'Client message ID already belongs to another cached message.');
    }
    return requestedID;
}
/** 将平台重试次数限制在共享发送状态机允许的安全范围。 */
function normalizeSendMaxAttempts(value) {
    if (!Number.isFinite(value))
        return 1;
    return Math.min(3, Math.max(1, Math.trunc(value ?? 1)));
}
/** 创建并校验本地消息幂等 ID。 */
export function createWebIMClientMessageID(dependencies) {
    // id 优先使用测试/宿主注入生成器，否则使用 runtime randomUUID。
    const id = (dependencies.createClientMessageID?.() ?? globalThis.crypto?.randomUUID?.())?.trim();
    if (!id) {
        throw createWebIMSyncError('CLIENT_MESSAGE_ID_UNAVAILABLE', 'A stable client message ID generator is required.');
    }
    return id;
}
//# sourceMappingURL=message-send-state.js.map