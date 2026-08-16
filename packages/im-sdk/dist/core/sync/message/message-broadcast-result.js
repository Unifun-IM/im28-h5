import { ConversationRepository, mapGatewayConversationToCore, mapGatewayMessageToCore, } from '@im28/im-sdk/core';
import { createConversationUpsertStatement } from '../../modules/conversation/repository.js';
import { createMessageUpsertStatement } from '../../modules/message/message-upsert.js';
import { createWebIMSyncError } from '../sync-context.js';
/** 按选择顺序解释 Gateway 逐目标结果并收敛可确认的本地缓存。 */
export async function resolveIMBroadcastTargetResults(context, gatewayClient, targets, responseList) {
    /** responseByClientID 只接受稳定 client ID 作为关联键。 */
    const responseByClientID = indexBroadcastResults(responseList);
    /** results 保留用户选择顺序和逐目标状态。 */
    const results = [];
    for (const target of targets) {
        /** remoteResult 缺失时状态未知，不能伪装成明确失败或成功。 */
        const remoteResult = responseByClientID.get(target.clientMsgID);
        results.push(await resolveBroadcastTargetResult(context, gatewayClient, target, remoteResult));
    }
    return results;
}
/** 将 Gateway 逐目标结果按 client message ID 建立唯一索引。 */
function indexBroadcastResults(values) {
    /** indexed 忽略空身份和重复回包，避免错误结果覆盖首个事实。 */
    const indexed = new Map();
    for (const value of values) {
        /** clientMsgID 是请求与响应唯一安全关联键。 */
        const clientMsgID = value.client_msg_id?.trim() ?? '';
        if (clientMsgID && !indexed.has(clientMsgID))
            indexed.set(clientMsgID, value);
    }
    return indexed;
}
/** 将单个 Gateway 结果解释为明确失败、未知或已发送状态。 */
async function resolveBroadcastTargetResult(context, gatewayClient, target, remoteResult) {
    if (!remoteResult) {
        return {
            target,
            clientMsgID: target.clientMsgID,
            status: 'unknown',
            cacheState: 'none',
            error: 'Gateway did not return this broadcast target result.',
        };
    }
    if (remoteResult.code !== 0) {
        return {
            target,
            clientMsgID: target.clientMsgID,
            status: 'failed',
            cacheState: 'none',
            error: remoteResult.msg?.trim()
                || `Gateway rejected broadcast target with code ${remoteResult.code ?? 'unknown'}.`,
        };
    }
    /** conversationID 必须来自目标结果或成功消息，不允许客户端拼接。 */
    const conversationID = remoteResult.conversation_id?.trim()
        || remoteResult.message?.conversation_id?.trim()
        || '';
    if (!conversationID || !remoteResult.message) {
        return {
            target,
            clientMsgID: target.clientMsgID,
            ...(conversationID ? { conversationID } : {}),
            status: 'sent',
            cacheState: 'remote-only',
            error: 'Gateway accepted the target but omitted its confirmed message identity.',
        };
    }
    try {
        /** message 使用 canonical Gateway mapper 并校验幂等身份。 */
        const message = mapGatewayMessageToCore(remoteResult.message, {
            currentUserID: context.userID,
            conversationID,
        });
        if (message.clientMsgID !== target.clientMsgID || message.conversationID !== conversationID) {
            throw createWebIMSyncError('BROADCAST_MESSAGE_IDENTITY_MISMATCH', 'Gateway returned a different broadcast message identity.');
        }
        /** conversation 解析 cache 或权威详情，禁止构造约定式会话。 */
        const conversation = await resolveBroadcastConversation(context, gatewayClient, target, conversationID, message);
        await persistBroadcastSuccess(context, conversation, message);
        return {
            target,
            clientMsgID: target.clientMsgID,
            conversationID,
            status: 'sent',
            cacheState: 'local',
            message,
        };
    }
    catch (cause) {
        return {
            target,
            clientMsgID: target.clientMsgID,
            conversationID,
            status: 'sent',
            cacheState: 'remote-only',
            error: readBroadcastError(cause, 'Broadcast was sent but local cache convergence failed.'),
        };
    }
}
/** 读取或拉取服务端确认的目标会话并校验其目标身份。 */
async function resolveBroadcastConversation(context, gatewayClient, target, conversationID, message) {
    /** repository 只读取当前账号缓存。 */
    const repository = new ConversationRepository(context.database);
    /** cached 优先保留本地置顶、静音和草稿等平台状态。 */
    const cached = await repository.getByID(conversationID);
    /** resolved 缓存缺失时读取权威 Gateway 会话详情。 */
    const resolved = cached ?? mapGatewayConversationToCore(await gatewayClient.getConversation({ conversation_id: conversationID }), context.userID).conversation;
    /** expectedType 防止好友和群目标被错误会话结果串联。 */
    const expectedType = target.kind === 'group' ? 'group' : 'single';
    if (resolved.type !== expectedType || resolved.targetID !== target.targetID) {
        throw createWebIMSyncError('BROADCAST_CONVERSATION_TARGET_MISMATCH', 'Gateway broadcast conversation does not match its requested target.');
    }
    return {
        ...resolved,
        latestMessageID: message.clientMsgID,
        updatedAt: Math.max(resolved.updatedAt, message.sendTime),
        listHidden: false,
    };
}
/** 在单个事务中保存服务端确认消息与会话最新消息指针。 */
async function persistBroadcastSuccess(context, conversation, message) {
    await context.database.transaction(async (transaction) => {
        await transaction.execute(createMessageUpsertStatement(message));
        await transaction.execute(createConversationUpsertStatement(conversation));
    });
}
/** 将未知异常转换为不含凭据的逐目标错误。 */
function readBroadcastError(cause, fallback) {
    return cause instanceof Error && cause.message ? cause.message : fallback;
}
//# sourceMappingURL=message-broadcast-result.js.map