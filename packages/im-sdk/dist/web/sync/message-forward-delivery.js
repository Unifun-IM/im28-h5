import { mapGatewayMessageToCore, } from '@im28/im-sdk/core';
import { createWebIMSyncError } from './sync-context.js';
/** 按 normal batch 或 hidden-sender individual 分支投递已落库批次。 */
export async function deliverWebIMForwardBatch(prepared, gatewayClient) {
    return prepared.hideSenderName
        ? deliverHiddenSenderBatch(prepared, gatewayClient)
        : deliverNormalBatch(prepared, gatewayClient);
}
/** 使用 Gateway batch-forward 并按 client ID 逐项解释结果。 */
async function deliverNormalBatch(prepared, gatewayClient) {
    // response 顶层成功不代表每个 item 成功。
    const response = await gatewayClient.batchForwardMessage({
        batch_id: prepared.batchID,
        conversation_id: prepared.conversationID,
        items: prepared.items.map(item => ({
            source_msg_id: item.sourceMessage.serverMsgID,
            client_msg_id: item.localMessage.clientMsgID,
        })),
        ...(prepared.commentMessage
            ? {
                comment: {
                    client_msg_id: prepared.commentMessage.clientMsgID,
                    text: readMessageText(prepared.commentMessage),
                },
            }
            : {}),
    });
    // resultByClientID 禁止用其他 source 的结果误收敛当前行。
    const resultByClientID = indexBatchResults(response);
    // list 保持源 selection 顺序。
    const list = prepared.items.map(item => mapNormalForwardResult(prepared, item, resultByClientID.get(item.localMessage.clientMsgID)));
    // comment 使用独立结果，缺失时按失败处理。
    const comment = prepared.commentMessage
        ? mapForwardCommentResult(prepared, prepared.commentMessage, response.comment)
        : undefined;
    return { batchID: prepared.batchID, list, ...(comment ? { comment } : {}) };
}
/** 隐藏发送者时逐条发送严格恢复的 body，绝不回退 source_msg_id。 */
async function deliverHiddenSenderBatch(prepared, gatewayClient) {
    // list 收集每条独立成败，单条失败不阻断后续来源。
    const list = [];
    // item 已在 optimistic 写入前完成 body 校验。
    for (const item of prepared.items) {
        try {
            if (!item.hiddenSenderRequest) {
                throw createWebIMSyncError('FORWARD_BODY_NOT_PREPARED', 'Hidden-sender forwarding requires a validated body.');
            }
            // remoteMessage 只提交 body/entities，不提交 source_msg_id 或 origin。
            const remoteMessage = await gatewayClient.sendMessage({
                conversation_id: prepared.conversationID,
                client_msg_id: item.localMessage.clientMsgID,
                body: item.hiddenSenderRequest.body,
                ...(item.hiddenSenderRequest.entities?.length
                    ? { entities: item.hiddenSenderRequest.entities }
                    : {}),
            });
            // sentMessage 必须保持 client ID 且不得回显来源身份。
            const sentMessage = mapSuccessfulMessage(prepared, item.localMessage, remoteMessage, false);
            list.push({ sourceClientMsgID: item.sourceMessage.clientMsgID, message: sentMessage });
        }
        catch (cause) {
            list.push({
                sourceClientMsgID: item.sourceMessage.clientMsgID,
                message: { ...item.localMessage, status: 'failed' },
                error: readErrorMessage(cause, 'Forwarding failed.'),
            });
        }
    }
    // hasSuccess 决定 RN fallback 是否允许发送附加评论。
    const hasSuccess = list.some(item => item.message.status === 'sent');
    // comment 仅在至少一条转发成功后执行真实发送。
    const comment = prepared.commentMessage
        ? hasSuccess
            ? await deliverHiddenSenderComment(prepared, gatewayClient)
            : {
                message: { ...prepared.commentMessage, status: 'failed' },
                error: 'All forwarded messages failed, so the comment was not sent.',
            }
        : undefined;
    return { batchID: prepared.batchID, list, ...(comment ? { comment } : {}) };
}
/** 发送 hidden-sender fallback 的独立普通文本评论。 */
async function deliverHiddenSenderComment(prepared, gatewayClient) {
    // localMessage 在 caller 中已确认存在。
    const localMessage = prepared.commentMessage;
    try {
        // remoteMessage 与转发 item 使用同一目标会话但独立 client ID。
        const remoteMessage = await gatewayClient.sendMessage({
            conversation_id: prepared.conversationID,
            client_msg_id: localMessage.clientMsgID,
            body: { text: { text: readMessageText(localMessage) } },
        });
        return { message: mapSuccessfulMessage(prepared, localMessage, remoteMessage, false) };
    }
    catch (cause) {
        return {
            message: { ...localMessage, status: 'failed' },
            error: readErrorMessage(cause, 'Forward comment failed.'),
        };
    }
}
/** 将 batch list 建成严格 client ID 索引。 */
function indexBatchResults(response) {
    // indexed 只收录非空 client ID，缺失结果由 caller 按失败处理。
    const indexed = new Map();
    // result 是服务端逐条业务结果。
    for (const result of response.list ?? []) {
        // clientMsgID 是唯一可接受的结果关联键。
        const clientMsgID = result.client_msg_id?.trim() ?? '';
        if (clientMsgID && !indexed.has(clientMsgID))
            indexed.set(clientMsgID, result);
    }
    return indexed;
}
/** 将普通 batch 单项结果映射为 sent 或同 ID failed 行。 */
function mapNormalForwardResult(prepared, item, result) {
    // remoteMessage 只在业务 code=0 时可作为成功证据。
    const remoteMessage = result?.code === 0 ? result.data?.message : undefined;
    try {
        if (!remoteMessage)
            throw new Error(result?.msg || 'Forward result is missing.');
        // sentMessage 普通转发必须含服务端确认的 forward origin。
        const sentMessage = mapSuccessfulMessage(prepared, item.localMessage, remoteMessage, true);
        return { sourceClientMsgID: item.sourceMessage.clientMsgID, message: sentMessage };
    }
    catch (cause) {
        return {
            sourceClientMsgID: item.sourceMessage.clientMsgID,
            message: { ...item.localMessage, status: 'failed' },
            error: readErrorMessage(cause, result?.msg || 'Forwarding failed.'),
        };
    }
}
/** 将 batch comment 的独立结果映射为最终本地行。 */
function mapForwardCommentResult(prepared, localMessage, result) {
    // remoteMessage 只有独立 code=0 才可使用。
    const remoteMessage = result?.code === 0 ? result.data?.message : undefined;
    try {
        if (!remoteMessage)
            throw new Error(result?.msg || 'Forward comment result is missing.');
        return { message: mapSuccessfulMessage(prepared, localMessage, remoteMessage, false) };
    }
    catch (cause) {
        return {
            message: { ...localMessage, status: 'failed' },
            error: readErrorMessage(cause, result?.msg || 'Forward comment failed.'),
        };
    }
}
/** 校验 Gateway 成功消息并合并本地批次元数据。 */
function mapSuccessfulMessage(prepared, localMessage, remoteMessage, requireForwardOrigin) {
    // mapped 复用 canonical Gateway mapper。
    const mapped = mapGatewayMessageToCore(remoteMessage, {
        currentUserID: prepared.context.userID,
        conversationID: prepared.conversationID,
    });
    if (mapped.clientMsgID !== localMessage.clientMsgID) {
        throw createWebIMSyncError('CLIENT_MESSAGE_ID_MISMATCH', 'Gateway returned a different forward client message ID.');
    }
    if (requireForwardOrigin && !mapped.forwardOrigin) {
        throw createWebIMSyncError('FORWARD_ORIGIN_MISSING', 'Gateway forward result is missing its origin.');
    }
    if (!requireForwardOrigin && mapped.forwardOrigin) {
        throw createWebIMSyncError('HIDDEN_FORWARD_ORIGIN_EXPOSED', 'Gateway exposed an origin for hidden-sender forwarding.');
    }
    return {
        ...mapped,
        status: 'sent',
        forwardBatchID: prepared.batchID,
        ...(localMessage.forwardSourceMsgID
            ? { forwardSourceMsgID: localMessage.forwardSourceMsgID }
            : {}),
        ...(mapped.entities?.length
            ? { entities: mapped.entities }
            : localMessage.entities?.length
                ? { entities: localMessage.entities }
                : {}),
    };
}
/** 从 comment optimistic payload 读取非空文本。 */
function readMessageText(message) {
    // payload 只接受 Gateway text body 形状。
    const payload = message.payload;
    return typeof payload?.text?.text === 'string' ? payload.text.text : '';
}
/** 将未知异常归一化为逐项可见错误文本。 */
function readErrorMessage(cause, fallback) {
    return cause instanceof Error && cause.message ? cause.message : fallback;
}
//# sourceMappingURL=message-forward-delivery.js.map