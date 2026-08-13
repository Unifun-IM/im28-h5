import { ConversationRepository, MessageRepository, } from '@im28/im-sdk/core';
import { createWebIMClientMessageID, } from './message-send-state.js';
import { buildWebIMPersistedMessageRequest } from './message-retry.js';
import { assertReusableForwardOutputRows, normalizeForwardOutputIDs, } from './message-forward-identities.js';
import { createWebIMSyncError } from './sync-context.js';
/** 单次共享转发最多接受 Gateway 允许的 100 条源消息。 */
const WEB_IM_FORWARD_MAX_ITEMS = 100;
/** 复用真实转发 guard 判断页面入口与隐藏发送人能力。 */
export function canForwardWebIMMessage(message, options = {}) {
    try {
        assertForwardSource(message);
        if (options.hideSenderName)
            buildHiddenSenderForwardRequest(message);
        return true;
    }
    catch {
        return false;
    }
}
/** 校验目标和全部来源后，原子写入同一批 optimistic 消息。 */
export async function prepareWebIMForwardBatch(context, options, dependencies) {
    // conversationID 必须指向当前账号已缓存的真实会话。
    const conversationID = options.conversationID.trim();
    if (!conversationID) {
        throw createWebIMSyncError('INVALID_FORWARD_TARGET', 'Forwarding requires a conversation ID.');
    }
    // conversationRepository 是目标存在性与 latest 指针的唯一 owner。
    const conversationRepository = new ConversationRepository(context.database);
    // conversation 只用于验证，不从 source payload 猜测目标。
    const conversation = await conversationRepository.getByID(conversationID);
    if (!conversation) {
        throw createWebIMSyncError('FORWARD_CONVERSATION_NOT_FOUND', 'Forwarding requires an existing cached conversation.');
    }
    // sourceClientMsgIDs 在任何写入前完成去空白、数量和重复校验。
    const sourceClientMsgIDs = normalizeForwardSourceIDs(options.sourceClientMsgIDs);
    // messageRepository 绑定当前认证账号 SQLite。
    const messageRepository = new MessageRepository(context.database);
    // sourceMessages 必须全部从 Repository 重读，禁止使用页面快照发送。
    const sourceMessages = await loadForwardSourceMessages(messageRepository, sourceClientMsgIDs);
    // hideSenderName 选择严格 body-copy 分支，不允许发送中途回退。
    const hideSenderName = options.hideSenderName === true;
    // hiddenSenderRequests 在 optimistic 写入前验证全部 body。
    const hiddenSenderRequests = hideSenderName
        ? sourceMessages.map(buildHiddenSenderForwardRequest)
        : [];
    // outputClientMsgIDs 对齐平台预创建的 optimistic 实体，缺省时仍由 SDK 生成。
    const outputClientMsgIDs = normalizeForwardOutputIDs(options, sourceClientMsgIDs);
    // 平台提供的既有 ID 只能复用同一目标中对应来源的 failed outgoing 行。
    await assertReusableForwardOutputRows({
        context,
        conversationID,
        messageRepository,
        sourceMessages,
        outputClientMsgIDs,
        commentText: options.comment?.trim() ?? '',
        commentClientMsgID: options.commentClientMsgID?.trim() ?? '',
    });
    // batchID 同时用于 Gateway 幂等和本地失败行关联。
    const batchID = createWebIMClientMessageID(dependencies);
    // startedAt 保证整批消息在当前会话内具有稳定递增顺序。
    const startedAt = dependencies.now?.() ?? Date.now();
    // items 将每个真实 source 映射为新的目标会话 optimistic 行。
    const items = sourceMessages.map((sourceMessage, index) => createPreparedForwardItem({
        context,
        conversationID,
        batchID,
        sourceMessage,
        hideSenderName,
        sendTime: startedAt + index,
        dependencies,
        ...(outputClientMsgIDs[index]
            ? { clientMsgID: outputClientMsgIDs[index] }
            : {}),
        ...(hiddenSenderRequests[index]
            ? { hiddenSenderRequest: hiddenSenderRequests[index] }
            : {}),
    }));
    // commentText 只在 trim 后非空时生成独立普通文本行。
    const commentText = options.comment?.trim() ?? '';
    // commentMessage 始终位于所有转发项之后。
    const commentMessage = commentText
        ? createForwardCommentMessage(context, conversationID, batchID, commentText, startedAt + items.length, dependencies, options.commentClientMsgID)
        : undefined;
    // optimisticMessages 通过 Repository 事务一次写入，避免半批次可见。
    const optimisticMessages = commentMessage
        ? [...items.map(item => item.localMessage), commentMessage]
        : items.map(item => item.localMessage);
    await messageRepository.upsertMany(optimisticMessages);
    // latest 指向整批最后一条本地消息，与 RN composer 顺序一致。
    const latestMessage = optimisticMessages.at(-1);
    await conversationRepository.updateLatestMessage(conversationID, latestMessage.clientMsgID, latestMessage.sendTime);
    return {
        context,
        batchID,
        conversationID,
        hideSenderName,
        items,
        ...(commentMessage ? { commentMessage } : {}),
        messageRepository,
        conversationRepository,
    };
}
/** 隐藏发送人转发维持既有支持矩阵，不随失败重试类型自动扩张。 */
function buildHiddenSenderForwardRequest(message) {
    if (message.contentType === 108) {
        throw createWebIMSyncError('MESSAGE_RETRY_UNSUPPORTED', 'Card messages do not support hidden-sender forwarding.');
    }
    return buildWebIMPersistedMessageRequest(message);
}
/** 规范化并验证源消息 ID 列表。 */
function normalizeForwardSourceIDs(values) {
    // normalizedIDs 保留用户选择顺序。
    const normalizedIDs = values.map(value => value.trim()).filter(Boolean);
    if (!normalizedIDs.length || normalizedIDs.length > WEB_IM_FORWARD_MAX_ITEMS) {
        throw createWebIMSyncError('INVALID_FORWARD_SOURCE_COUNT', 'Forwarding requires between 1 and 100 source messages.');
    }
    // uniqueIDs 防止同一 source 被意外复制多次。
    const uniqueIDs = new Set(normalizedIDs);
    if (uniqueIDs.size !== normalizedIDs.length) {
        throw createWebIMSyncError('DUPLICATE_FORWARD_SOURCE', 'Forwarding source message IDs must be unique.');
    }
    return normalizedIDs;
}
/** 从当前账号 Repository 逐条读取并校验转发来源。 */
async function loadForwardSourceMessages(repository, sourceClientMsgIDs) {
    // sourceMessages 按 selection 顺序累积，任何一条失败都阻止 optimistic 写入。
    const sourceMessages = [];
    // sourceClientMsgID 是本地稳定主键，不接受页面直接传完整 DTO。
    for (const sourceClientMsgID of sourceClientMsgIDs) {
        // sourceMessage 必须存在于当前 account database。
        const sourceMessage = await repository.getByClientMsgID(sourceClientMsgID);
        if (!sourceMessage) {
            throw createWebIMSyncError('FORWARD_SOURCE_NOT_FOUND', 'Forwarding requires an existing cached source message.');
        }
        assertForwardSource(sourceMessage);
        sourceMessages.push(sourceMessage);
    }
    return sourceMessages;
}
/** 拒绝未完成、系统、撤回、删除或缺少服务端身份的来源。 */
function assertForwardSource(message) {
    // stableRemoteSourceID 是普通转发的服务端权威来源。
    const stableRemoteSourceID = message.serverMsgID?.trim() ?? '';
    // completed 标记已被服务端确认或接收的缓存消息。
    const completed = message.status === 'sent' || message.status === 'received';
    // userMessage 排除 typing 和所有系统事件类型。
    const userMessage = message.contentType !== 113 && message.contentType < 1200;
    if (!stableRemoteSourceID || !completed || !userMessage) {
        throw createWebIMSyncError('FORWARD_SOURCE_NOT_ALLOWED', 'Only completed user messages with a server ID can be forwarded.');
    }
}
/** 创建单条转发 optimistic 行及其可选隐藏来源请求。 */
function createPreparedForwardItem(params) {
    // forwardOrigin 优先保留既有服务端来源，否则使用真实 sender ID 建立最小快照。
    const forwardOrigin = params.hideSenderName
        ? undefined
        : params.sourceMessage.forwardOrigin ?? {
            type: 'user',
            userID: params.sourceMessage.senderID,
        };
    // localMessage 复制正文快照但生成新的目标会话身份。
    const localMessage = {
        clientMsgID: params.clientMsgID ?? createWebIMClientMessageID(params.dependencies),
        conversationID: params.conversationID,
        senderID: params.context.userID,
        direction: 'outgoing',
        contentType: params.sourceMessage.contentType,
        status: 'sending',
        sendTime: params.sendTime,
        ...(forwardOrigin ? { forwardOrigin } : {}),
        forwardSourceMsgID: params.sourceMessage.serverMsgID,
        forwardBatchID: params.batchID,
        ...(params.sourceMessage.entities?.length ? { entities: params.sourceMessage.entities } : {}),
        payload: params.sourceMessage.payload,
    };
    return {
        sourceMessage: params.sourceMessage,
        localMessage,
        ...(params.hiddenSenderRequest ? { hiddenSenderRequest: params.hiddenSenderRequest } : {}),
    };
}
/** 创建批次末尾的普通文本评论 optimistic 行。 */
function createForwardCommentMessage(context, conversationID, batchID, text, sendTime, dependencies, clientMsgID) {
    return {
        clientMsgID: clientMsgID?.trim() || createWebIMClientMessageID(dependencies),
        conversationID,
        senderID: context.userID,
        direction: 'outgoing',
        contentType: 101,
        status: 'sending',
        sendTime,
        forwardBatchID: batchID,
        payload: { text: { text } },
    };
}
//# sourceMappingURL=message-forward-state.js.map