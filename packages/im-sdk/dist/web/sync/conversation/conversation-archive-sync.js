import { ConversationRepository, MessageRepository, mapGatewayConversationToCore, } from '@im28/im-sdk/core';
import { createWebIMSyncError, requireWebIMSyncContext, } from '../sync-context.js';
import { createWebIMSyncMutationQueue, } from '../sync-mutation-queue.js';
/** 创建 RN、Web、Desktop 共用的归档快照同步器。 */
export function createIMConversationArchiveSync(dependencies) {
    /** mutationQueue 保证归档快照不与其他会话写操作交错。 */
    const mutationQueue = dependencies.mutationQueue ?? createWebIMSyncMutationQueue();
    return {
        sync: options => mutationQueue.enqueue(async () => {
            /** context 固定本轮账号和数据库，禁止跨账号写入。 */
            const context = requireWebIMSyncContext(dependencies, 'Archived conversation sync');
            /** gatewayItems 在完整分页成功前只存在于内存。 */
            const gatewayItems = await fetchAllArchivedConversations(dependencies.gatewayClient, clampArchivePageSize(options?.pageSize));
            /** mappings 统一复用 Gateway DTO 到 core 会话/消息映射。 */
            const mappings = gatewayItems.map(item => mapGatewayConversationToCore(item, context.userID));
            /** normalized 强制分离归档索引和清空历史隐藏语义。 */
            const normalized = [
                ...new Map(mappings.map(mapping => [
                    mapping.conversation.conversationID,
                    {
                        ...mapping.conversation,
                        isArchived: true,
                        listHidden: false,
                    },
                ])).values(),
            ];
            /** enriched 只允许平台补齐名称头像，不拥有数据源或持久化顺序。 */
            const enriched = dependencies.enrichConversations
                ? await dependencies.enrichConversations(normalized)
                : normalized;
            assertConversationIdentitySet(normalized, enriched);
            /** messages 先保存归档行引用的最新消息，页面回读不会出现悬空摘要。 */
            const messages = new MessageRepository(context.database);
            for (const mapping of mappings) {
                if (mapping.latestMessage)
                    await messages.upsert(mapping.latestMessage);
            }
            /** conversations 单次事务收敛服务端完整归档集合。 */
            const conversations = new ConversationRepository(context.database);
            await conversations.reconcileArchivedSnapshot(enriched.map(item => ({
                ...item,
                isArchived: true,
                listHidden: false,
            })));
            return conversations.list({ archived: true, limit: 10_000 });
        }),
    };
}
/** 拉取归档端点全部分页并拒绝循环游标与无界响应。 */
async function fetchAllArchivedConversations(gatewayClient, pageSize) {
    /** conversations 暂存完整远端快照。 */
    const conversations = [];
    /** seenTokens 拒绝服务端重复游标。 */
    const seenTokens = new Set();
    /** pageToken 为空表示从第一页开始。 */
    let pageToken;
    for (let page = 0; page < 1000; page += 1) {
        /** response 由共享 Gateway client 处理 HTTP/envelope 错误。 */
        const response = await gatewayClient.listArchivedConversations({
            limit: pageSize,
            ...(pageToken ? { page_token: pageToken } : {}),
        });
        if (!Array.isArray(response.conversations)) {
            throw createWebIMSyncError('ARCHIVED_CONVERSATION_INVALID_RESPONSE', 'Gateway archived conversation list did not explicitly return conversations.');
        }
        conversations.push(...response.conversations);
        /** nextToken 只接受非空游标。 */
        const nextToken = response.next_page_token?.trim();
        if (!nextToken)
            return conversations;
        if (seenTokens.has(nextToken)) {
            throw createWebIMSyncError('ARCHIVED_CONVERSATION_PAGINATION_LOOP', 'Gateway archived conversation pagination returned a repeated token.');
        }
        seenTokens.add(nextToken);
        pageToken = nextToken;
    }
    throw createWebIMSyncError('ARCHIVED_CONVERSATION_PAGE_LIMIT_EXCEEDED', 'Gateway archived conversation pagination exceeded the safety limit.');
}
/** 限制归档分页条数，避免异常调用制造无界响应。 */
function clampArchivePageSize(value) {
    if (!Number.isFinite(value))
        return 100;
    return Math.min(200, Math.max(1, Math.trunc(value ?? 100)));
}
/** 平台补齐必须保持会话稳定身份集合，禁止悄悄增删业务对象。 */
function assertConversationIdentitySet(source, enriched) {
    /** sourceIDs 固定服务端映射后的排序无关身份集合。 */
    const sourceIDs = [...source.map(item => item.conversationID)].sort();
    /** enrichedIDs 固定平台补齐后的排序无关身份集合。 */
    const enrichedIDs = [...enriched.map(item => item.conversationID)].sort();
    if (sourceIDs.length !== enrichedIDs.length || sourceIDs.some((id, index) => id !== enrichedIDs[index])) {
        throw createWebIMSyncError('ARCHIVED_CONVERSATION_ENRICHMENT_MISMATCH', 'Archived conversation enrichment must preserve the server identity set.');
    }
}
//# sourceMappingURL=conversation-archive-sync.js.map