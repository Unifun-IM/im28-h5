import { ConversationRepository, MessageRepository, mapGatewayConversationToCore, } from '@im28/im-sdk/core';
import { createWebIMSyncError, requireWebIMSyncContext, } from '../sync-context.js';
/** 打开已加入群的规范会话并在成功后写入当前账号缓存。 */
export async function openIMGroupConversation(dependencies, options) {
    /** groupID 是群资料和会话目标的唯一稳定身份。 */
    const groupID = options.groupID.trim();
    /** projectedConversationID 仅作为服务端会话查询提示，不允许直接导航。 */
    const projectedConversationID = options.conversationID?.trim() ?? '';
    if (!groupID) {
        throw createWebIMSyncError('GROUP_CONVERSATION_GROUP_ID_REQUIRED', 'Group conversation open requires a group ID.');
    }
    /** operation 在共享队列真正执行时绑定账号，防止排队期间切号。 */
    const operation = async () => {
        /** context 在队列内冻结当前账号和数据库。 */
        const context = requireWebIMSyncContext(dependencies, 'Group conversation open');
        /** repository 只读取当前账号会话缓存。 */
        const repository = new ConversationRepository(context.database);
        /** projectedConversation 优先验证调用方携带的服务端会话 ID。 */
        const projectedConversation = projectedConversationID
            ? await repository.getByID(projectedConversationID)
            : null;
        if (projectedConversation) {
            return requireMatchingGroupConversation(projectedConversation, groupID);
        }
        /** cachedConversation 兼容群列表暂未返回 conversation_id 的数据。 */
        const cachedConversation = (await repository.list({ limit: 10_000 })).find(conversation => conversation.type === 'group' && conversation.targetID === groupID);
        if (cachedConversation)
            return cachedConversation;
        /** mapping 优先读投影 ID，读取失败时才回群资料刷新真实 ID。 */
        const mapping = await fetchCanonicalGroupConversation(context, dependencies.gatewayClient, groupID, projectedConversationID);
        /** conversation 拒绝 direct/其他群或会话 ID 错配。 */
        const conversation = requireMatchingGroupConversation(mapping.conversation, groupID);
        if (mapping.latestMessage) {
            /** messageRepository 先保存会话引用的最新消息。 */
            await new MessageRepository(context.database).upsert(mapping.latestMessage);
        }
        /** conversationRepository 仅在全部身份校验通过后写入。 */
        await repository.upsert(conversation);
        return conversation;
    };
    /** queue 与会话全量同步共享时序；独立使用时仍可直接执行。 */
    const queue = dependencies.mutationQueue;
    return queue ? queue.enqueue(operation) : operation();
}
/** 读取规范群会话；旧投影读取失败时回群资料刷新真实 ID。 */
async function fetchCanonicalGroupConversation(context, gatewayClient, groupID, projectedConversationID) {
    if (projectedConversationID) {
        /** projectedConversation 只把详情读取失败视为 stale ID。 */
        let projectedConversation;
        try {
            projectedConversation = await gatewayClient.getConversation({
                conversation_id: projectedConversationID,
            });
        }
        catch {
            /** stale 投影继续由权威群资料补新 ID。 */
        }
        if (projectedConversation) {
            /** 映射或身份错误保持 fail-closed，不进入 stale fallback。 */
            return mapRequestedGroupConversation(context, projectedConversation, projectedConversationID);
        }
    }
    /** remoteGroup 必须与 caller 群身份一致并提供真实会话 ID。 */
    const remoteGroup = await gatewayClient.getGroup({ group_id: groupID });
    if (remoteGroup.group_id?.trim() !== groupID) {
        throw createWebIMSyncError('GROUP_CONVERSATION_GROUP_MISMATCH', 'Gateway group does not match the requested group.');
    }
    /** resolvedConversationID 只接受群详情返回的权威稳定 ID。 */
    const resolvedConversationID = remoteGroup.conversation_id?.trim() ?? '';
    if (!resolvedConversationID) {
        throw createWebIMSyncError('GROUP_CONVERSATION_ID_UNAVAILABLE', 'Gateway group did not provide a conversation ID.');
    }
    return fetchMappedGroupConversation(context, gatewayClient, resolvedConversationID);
}
/** 拉取会话详情并拒绝响应主键与请求不一致。 */
async function fetchMappedGroupConversation(context, gatewayClient, conversationID) {
    /** remoteConversation 使用规范会话详情保留服务端状态和最新消息。 */
    const remoteConversation = await gatewayClient.getConversation({
        conversation_id: conversationID,
    });
    return mapRequestedGroupConversation(context, remoteConversation, conversationID);
}
/** 映射会话详情并拒绝响应主键与请求不一致。 */
function mapRequestedGroupConversation(context, remoteConversation, conversationID) {
    /** mapping 复用 Gateway 到 core 的唯一 DTO owner。 */
    const mapping = mapGatewayConversationToCore(remoteConversation, context.userID);
    if (mapping.conversation.conversationID !== conversationID) {
        throw createWebIMSyncError('GROUP_CONVERSATION_ID_MISMATCH', 'Gateway conversation does not match the requested conversation.');
    }
    return mapping;
}
/** 校验缓存或 Gateway 会话确实属于目标群。 */
function requireMatchingGroupConversation(conversation, groupID) {
    if (conversation.type !== 'group' || conversation.targetID !== groupID) {
        throw createWebIMSyncError('GROUP_CONVERSATION_TARGET_MISMATCH', 'Conversation does not match the requested group.');
    }
    return conversation;
}
//# sourceMappingURL=group-conversation-open.js.map