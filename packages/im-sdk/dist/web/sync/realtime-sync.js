import { ConversationRepository, MessageRepository, mapGatewayConversationToCore, mapGatewayMessageToCore, } from '@im28/im-sdk/core';
import { createWebIMSyncError, requireWebIMSyncContext, } from './sync-context.js';
import { collectGatewayConversations, collectGatewayMessages, deduplicateGatewayMessages, groupGatewayMessages, hasDegradedMarker, hasSequenceGap, maxDecimalString, persistMappedMessages, readString, selectLatestMessage, } from './realtime-event-data.js';
import { pullRealtimeMessageRecovery } from './realtime-message-recovery.js';
import { applyLatestConversationAutoDeleteNotice } from './conversation-auto-delete-sync.js';
import { createRealtimeMessageUpdateSync } from './realtime-message-update-sync.js';
import { createWebIMSyncMutationQueue, } from './sync-mutation-queue.js';
/** 创建与 runtime 同生命周期的实时持久化队列。 */
export function createWebIMRealtimeSync(dependencies) {
    return new WebIMRealtimeSyncImpl(dependencies);
}
/** 单队列编排实时事件、HTTP 恢复与 Repository 写入。 */
class WebIMRealtimeSyncImpl {
    // dependencies 动态读取当前认证账号，但 Gateway client 保持唯一。
    dependencies;
    // handleMessageUpdate 在主队列内应用独立 update cursor。
    handleMessageUpdate;
    // mutationQueue 与 HTTP sync/send 共用，防止全量结果覆盖 realtime delta。
    mutationQueue;
    /** 保存 runtime owners，不持有账号外的可变业务状态。 */
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.handleMessageUpdate = createRealtimeMessageUpdateSync(dependencies);
        this.mutationQueue =
            dependencies.mutationQueue ?? createWebIMSyncMutationQueue();
    }
    /** 将当前事件追加到队列，失败后仍允许后续事件继续处理。 */
    handle(event) {
        if (event.type !== 'message' &&
            event.type !== 'conversation' &&
            event.type !== 'message.update') {
            return Promise.resolve(false);
        }
        // context 在入队时冻结，防止旧账号事件写入切换后的新账号数据库。
        const context = requireWebIMSyncContext(this.dependencies, 'Realtime sync');
        // result 保留当前事件的成功、忽略或失败结果。
        return this.mutationQueue.enqueue(() => this.handleDirect(event, context));
    }
    /** 只路由本片明确支持的新消息与会话变更。 */
    async handleDirect(event, context) {
        if (event.type === 'message') {
            return this.persistMessageEvent(event, context);
        }
        if (event.type === 'message.update') {
            return this.handleMessageUpdate(event, context);
        }
        return this.persistConversationEvent(event, context);
    }
    /** 按会话恢复缺口并幂等持久化实时消息。 */
    async persistMessageEvent(event, context) {
        // gatewayMessages 递归解开 normalized event 的常见包装。
        const gatewayMessages = collectGatewayMessages(event.data ?? event.raw);
        if (!gatewayMessages.length) {
            throw createWebIMSyncError('INVALID_REALTIME_MESSAGE', 'Realtime message event has no entity with stable identity.');
        }
        // groups 保证同一会话的 cursor、unread 与 latest 一次收敛。
        const groups = groupGatewayMessages(gatewayMessages);
        for (const [conversationID, eventMessages] of groups) {
            await this.persistConversationMessages(context, conversationID, eventMessages, hasDegradedMarker(event.data ?? event.raw));
        }
        return true;
    }
    /** 持久化单会话消息批次并更新或恢复会话。 */
    async persistConversationMessages(context, conversationID, eventMessages, degraded) {
        // repositories 在当前串行 operation 内共享同一 account database。
        const conversations = new ConversationRepository(context.database);
        // messages 负责稳定 client/server identity 查询与幂等 upsert。
        const messages = new MessageRepository(context.database);
        // existingConversation 提供恢复 cursor 与本地 UI 字段。
        const existingConversation = await conversations.getByID(conversationID);
        // recoveryNeeded 同时覆盖服务端降级标记与 seq 跳号。
        const recoveryNeeded = degraded || hasSequenceGap(existingConversation?.lastMsgSeq, eventMessages);
        // recoveredMessages 必须先于事件消息进入同一去重集合。
        const recoveredMessages = recoveryNeeded
            ? await pullRealtimeMessageRecovery(this.dependencies.gatewayClient, conversationID, existingConversation?.lastMsgSeq ?? '0')
            : [];
        // mergedMessages 按稳定 ID 去重，事件版本覆盖补拉版本。
        const mergedMessages = deduplicateGatewayMessages([
            ...recoveredMessages,
            ...eventMessages,
        ]);
        // mappedMessages 在写库前全部校验，防止半批次落库。
        const mappedMessages = mergedMessages.map(source => ({
            source,
            value: mapGatewayMessageToCore(source, {
                currentUserID: context.userID,
                conversationID,
            }),
        }));
        // persistedBatch 在 Repository 写入后返回幂等 unread 结果。
        const persistedBatch = await persistMappedMessages(messages, mappedMessages);
        if (!existingConversation) {
            await this.restoreConversation(context, conversationID, conversations, messages);
        }
        else {
            await this.updateExistingConversation(existingConversation, conversations, mergedMessages, mappedMessages, persistedBatch.unreadDelta);
        }
        await applyLatestConversationAutoDeleteNotice(conversations, conversationID, mergedMessages);
    }
    /** 只推进已有会话的 latest、cursor、unread 与更新时间。 */
    async updateExistingConversation(existingConversation, conversations, gatewayMessages, mappedMessages, unreadDelta) {
        // latestMessage 以 seq 优先、发送时间兜底选择会话指针。
        const latestMessage = selectLatestMessage(mappedMessages);
        // lastMsgSeq 保留 Gateway uint64 字符串，避免 JS number 截断。
        const lastMsgSeq = maxDecimalString([
            existingConversation.lastMsgSeq,
            ...gatewayMessages.map(message => readString(message.msg_seq)),
        ]);
        // nextConversation 保留本地 pinned/muted/draft 并只推进消息字段。
        const nextConversation = {
            ...existingConversation,
            ...(latestMessage ? { latestMessageID: latestMessage.clientMsgID } : {}),
            ...(lastMsgSeq ? { lastMsgSeq } : {}),
            unreadCount: existingConversation.unreadCount + unreadDelta,
            updatedAt: Math.max(existingConversation.updatedAt, latestMessage?.sendTime ?? 0),
        };
        await conversations.upsert(nextConversation);
    }
    /** 缺失会话时用 Gateway 权威详情补齐，不猜测 target/type。 */
    async restoreConversation(context, conversationID, conversations, messages) {
        // remoteConversation 是缺失会话资料的唯一恢复来源。
        const remoteConversation = await this.dependencies.gatewayClient.getConversation({
            conversation_id: conversationID,
        });
        // mapping 复用 shared canonical DTO 语义。
        const mapping = mapGatewayConversationToCore(remoteConversation, context.userID);
        if (mapping.latestMessage) {
            await messages.upsert(mapping.latestMessage);
        }
        await conversations.upsert(mapping.conversation);
    }
    /** 将会话 delta 及其 latest message 按 Repository 顺序 upsert。 */
    async persistConversationEvent(event, context) {
        // candidates 接受 direct DTO 和常见单条/批量 wrapper。
        const candidates = collectGatewayConversations(event.data ?? event.raw);
        if (!candidates.length) {
            throw createWebIMSyncError('INVALID_REALTIME_CONVERSATION', 'Realtime conversation event has no stable conversation identity.');
        }
        // repositories 保证 latest message 先于 conversation pointer。
        const messages = new MessageRepository(context.database);
        // conversations 执行 delta upsert，绝不清空未出现在事件中的 cache。
        const conversations = new ConversationRepository(context.database);
        for (const candidate of candidates) {
            // mapping 失败时仅允许按稳定 conversation ID 请求权威详情恢复。
            const mapping = await this.mapOrRestoreConversation(context, candidate);
            if (mapping.latestMessage) {
                await messages.upsert(mapping.latestMessage);
            }
            await conversations.upsert(mapping.conversation);
        }
        return true;
    }
    /** 映射完整会话 DTO，字段不足时按 ID 向 Gateway 恢复。 */
    async mapOrRestoreConversation(context, candidate) {
        try {
            return mapGatewayConversationToCore(candidate, context.userID);
        }
        catch (cause) {
            // conversationID 是允许发起权威恢复请求的最低条件。
            const conversationID = readString(candidate.conversation_id);
            if (!conversationID) {
                throw cause;
            }
            // remoteConversation 替代不完整 event DTO，禁止本地猜字段。
            const remoteConversation = await this.dependencies.gatewayClient.getConversation({
                conversation_id: conversationID,
            });
            return mapGatewayConversationToCore(remoteConversation, context.userID);
        }
    }
}
//# sourceMappingURL=realtime-sync.js.map