import { MessageRepository, } from '@im28/im-sdk/core';
import { createWebIMClientMessageID, } from './message-send-state.js';
import { createWebIMSyncError } from './sync-context.js';
/** 主动删除缓存消息，并只对 Gateway 确认成功的项目本地隐藏。 */
export async function deleteWebIMMessages(context, options, dependencies) {
    // prepared 在任何远端 I/O 前完成身份、会话和 scope 校验。
    const prepared = await prepareWebIMMessageDelete(context, options);
    // serverMessages 必须先完成远端操作，本地未确认消息稍后统一处理。
    const serverMessages = prepared.messages.filter(message => message.serverMsgID);
    // remoteResults 保持来源选择顺序，便于页面逐项反馈。
    const remoteResults = serverMessages.length === 1
        ? await deleteSingleServerMessage(prepared, serverMessages[0], dependencies)
        : serverMessages.length > 1
            ? await deleteServerMessageBatch(prepared, serverMessages, dependencies)
            : [];
    // remoteResultByClientID 用稳定缓存身份合并服务端和本地项。
    const remoteResultByClientID = new Map(remoteResults.map(result => [result.clientMsgID, result]));
    // list 只有 self 才允许把无 server ID 的本地消息直接视为成功。
    const list = prepared.messages.map(message => remoteResultByClientID.get(message.clientMsgID) ?? createLocalDeleteResult(message));
    // deletedClientMsgIDs 是唯一允许写入本地隐藏状态的集合。
    const deletedClientMsgIDs = list
        .filter(result => result.deleted)
        .map(result => result.clientMsgID);
    await prepared.repository.markLocalDeletedMany(deletedClientMsgIDs);
    return {
        deletedClientMsgIDs,
        failedCount: list.length - deletedClientMsgIDs.length,
        list,
    };
}
/** 重读并校验当前账号 SQLite 中的删除目标。 */
async function prepareWebIMMessageDelete(context, options) {
    // conversationID 同时约束本地查询和 Gateway operation。
    const conversationID = options.conversationID.trim();
    // clientMsgIDs 去空白、稳定去重并保持调用顺序。
    const clientMsgIDs = Array.from(new Set(options.clientMsgIDs.map(item => item.trim()).filter(Boolean)));
    if (!conversationID || !clientMsgIDs.length) {
        throw createWebIMSyncError('INVALID_MESSAGE_DELETE_TARGET', 'Message deletion requires a conversation and at least one message.');
    }
    if (clientMsgIDs.length > 100) {
        throw createWebIMSyncError('MESSAGE_DELETE_LIMIT_EXCEEDED', 'Message deletion supports at most 100 messages.');
    }
    // repository 是本次操作唯一的 SQLite owner。
    const repository = new MessageRepository(context.database);
    // records 禁止页面传入未缓存 body 或 server identity。
    const records = await Promise.all(clientMsgIDs.map(clientMsgID => repository.getByClientMsgID(clientMsgID)));
    if (records.some(message => !message)) {
        throw createWebIMSyncError('MESSAGE_DELETE_SOURCE_NOT_FOUND', 'Every deleted message must exist in the current account cache.');
    }
    // messages 在缺失检查后可安全收窄。
    const messages = records;
    if (messages.some(message => message.conversationID !== conversationID ||
        message.status === 'deleted_local')) {
        throw createWebIMSyncError('INVALID_MESSAGE_DELETE_SOURCE', 'Deleted messages must be active rows from the requested conversation.');
    }
    if (options.scope === 'all' && messages.some(message => !message.serverMsgID)) {
        throw createWebIMSyncError('MESSAGE_DELETE_ALL_UNAVAILABLE', 'Deleting for everyone requires server-backed messages.');
    }
    return { conversationID, scope: options.scope, messages, repository };
}
/** 单条服务端消息沿用 RN 的 update operation。 */
async function deleteSingleServerMessage(prepared, message, dependencies) {
    // operationClientMsgID 是单条删除的稳定幂等 ID。
    const operationClientMsgID = createWebIMClientMessageID(dependencies);
    await dependencies.gatewayClient.updateMessage({
        conversation_id: prepared.conversationID,
        target_msg_id: message.serverMsgID,
        client_msg_id: operationClientMsgID,
        delete: { scope: prepared.scope, reason: 'local_delete' },
    });
    return [{
            clientMsgID: message.clientMsgID,
            serverMsgID: message.serverMsgID,
            deleted: true,
        }];
}
/** 多条服务端消息沿用 RN 的 batch-delete operation 并逐项判定。 */
async function deleteServerMessageBatch(prepared, messages, dependencies) {
    // batchID 在整批网络重试语义中保持稳定。
    const batchID = createWebIMClientMessageID(dependencies);
    // items 将缓存身份和远端操作身份显式关联。
    const items = messages.map(message => ({
        message,
        operationClientMsgID: createWebIMClientMessageID(dependencies),
    }));
    // response 只来自真实 Gateway 成功响应，reject 会阻止任何本地删除。
    const response = await dependencies.gatewayClient.batchDeleteMessage({
        batch_id: batchID,
        conversation_id: prepared.conversationID,
        scope: prepared.scope,
        reason: 'local_delete',
        items: items.map(item => ({
            target_msg_id: item.message.serverMsgID,
            client_msg_id: item.operationClientMsgID,
        })),
    });
    return mapBatchDeleteResults(items, response);
}
/** 将 Gateway 批量响应映射回缓存 client ID。 */
function mapBatchDeleteResults(items, response) {
    // results 是 Gateway 可选的逐项结果。
    const results = response.list ?? [];
    // byOperationID 优先处理服务端重排响应。
    const byOperationID = new Map(results.filter(item => item.client_msg_id).map(item => [item.client_msg_id, item]));
    // byServerID 是旧响应缺 operation ID 时的稳定回退。
    const byServerID = new Map(results.filter(item => item.target_msg_id).map(item => [item.target_msg_id, item]));
    // assumeAllSucceeded 兼容 Gateway 仅返回聚合计数的成功响应。
    const assumeAllSucceeded = results.length === 0 && Number(response.failed_count ?? 0) === 0;
    return items.map((item, index) => {
        // result 最后才按数组位置兼容旧 Gateway。
        const result = byOperationID.get(item.operationClientMsgID) ??
            byServerID.get(item.message.serverMsgID) ?? results[index];
        return createServerDeleteResult(item.message, result, assumeAllSucceeded, response);
    });
}
/** 依据逐项码和聚合失败数创建服务端删除结果。 */
function createServerDeleteResult(message, result, assumeAllSucceeded, response) {
    // deleted 与 RN 逻辑一致：显式 code=0 或无逐项失败的聚合响应均成功。
    const deleted = assumeAllSucceeded || result?.code === 0 ||
        (result?.code === undefined && Number(response.failed_count ?? 0) === 0);
    return {
        clientMsgID: message.clientMsgID,
        serverMsgID: message.serverMsgID,
        deleted,
        ...(!deleted ? { error: result?.msg?.trim() || '部分消息删除失败。' } : {}),
    };
}
/** 将仅本地的 self 删除项标记为成功。 */
function createLocalDeleteResult(message) {
    return { clientMsgID: message.clientMsgID, deleted: true };
}
//# sourceMappingURL=message-delete.js.map