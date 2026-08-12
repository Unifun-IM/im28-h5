import { ConversationRepository, MessageRepository, mapGatewayConversationToCore, mapGatewayMessageToCore, } from '@im28/im-sdk/core';
import { applyLatestConversationAutoDeleteNotice } from './conversation-auto-delete-sync.js';
import { isConversationMessageAfterClearBoundary } from './conversation-clear-state.js';
import { collectGatewayMessages, deduplicateGatewayMessages, groupGatewayMessages, hasDegradedMarker, hasSequenceGap, maxDecimalString, persistMappedMessages, readString, selectLatestMessage, } from './realtime-event-data.js';
import { pullRealtimeMessageRecovery } from './realtime-message-recovery.js';
import { requireWebIMSyncContext, createWebIMSyncError, } from './sync-context.js';
import { createWebIMSyncMutationQueue, } from './sync-mutation-queue.js';
/** 创建绑定 runtime 当前账号数据库的实时消息 facade。 */
export function createIMRealtimeMessageSync(dependencies) {
    return new IMRealtimeMessageSyncImpl(dependencies);
}
/** 串行执行 realtime 消息恢复和 Repository 收敛。 */
class IMRealtimeMessageSyncImpl {
    /** dependencies 动态读取当前账号，不缓存用户凭据。 */
    dependencies;
    /** mutationQueue 与 Web 全量同步、RN realtime 共用同一排序模型。 */
    mutationQueue;
    /** 保存 I/O owners，不建立第二份数据库生命周期。 */
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.mutationQueue =
            dependencies.mutationQueue ?? createWebIMSyncMutationQueue();
    }
    /** 冻结入队账号并返回本轮实际写入的 canonical 快照。 */
    handle(payload) {
        /** context 防止排队期间账号切换导致跨账号写入。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Realtime message sync');
        return this.mutationQueue.enqueue(() => this.handleDirect(payload, context));
    }
    /** 按会话聚合 normalized 消息并顺序收敛。 */
    async handleDirect(payload, context) {
        /** gatewayMessages 只保留具备稳定缓存身份的消息。 */
        const gatewayMessages = collectGatewayMessages(payload);
        if (!gatewayMessages.length) {
            throw createWebIMSyncError('INVALID_REALTIME_MESSAGE', 'Realtime message event has no entity with stable identity.');
        }
        /** messages 汇总补拉与事件最终占用的 SQLite 实体。 */
        const messages = [];
        /** conversations 汇总每个受影响会话的最终快照。 */
        const conversations = [];
        /** groups 保证每个会话只推进一次 cursor/unread/latest。 */
        const groups = groupGatewayMessages(gatewayMessages);
        /** degraded 对整个 Gateway batch 采用同一恢复提示。 */
        const degraded = hasDegradedMarker(payload);
        for (const [conversationID, eventMessages] of groups) {
            /** result 是当前会话完整收敛后的快照。 */
            const result = await this.persistConversationMessages(context, conversationID, eventMessages, degraded);
            messages.push(...result.messages);
            conversations.push(result.conversation);
        }
        return { messages, conversations };
    }
    /** 恢复单会话缺口并推进消息、未读和 latest cursor。 */
    async persistConversationMessages(context, conversationID, eventMessages, degraded) {
        /** conversations 持有当前账号会话 Repository。 */
        const conversations = new ConversationRepository(context.database);
        /** messages 持有当前账号消息 Repository。 */
        const messages = new MessageRepository(context.database);
        /** existingConversation 提供缺口恢复 cursor 与本地设置字段。 */
        const existingConversation = await conversations.getByID(conversationID);
        /** eligibleEventMessages 丢弃迟到但已位于清空边界内的旧事件。 */
        const eligibleEventMessages = eventMessages.filter(message => isConversationMessageAfterClearBoundary(message.msg_seq, existingConversation?.clearBeforeSeq));
        if (!eligibleEventMessages.length && existingConversation) {
            return { messages: [], conversation: existingConversation };
        }
        /** recoveryNeeded 只在降级标记或 seq 跳号时请求 Gateway。 */
        const recoveryNeeded = degraded || hasSequenceGap(existingConversation?.lastMsgSeq, eligibleEventMessages);
        /** recoveredMessages 必须在事件版本前合并。 */
        const recoveredMessages = recoveryNeeded
            ? await pullRealtimeMessageRecovery(this.dependencies.gatewayClient, conversationID, existingConversation?.lastMsgSeq ?? '0')
            : [];
        /** mergedMessages 使用事件版本覆盖恢复窗口中的同身份消息。 */
        const mergedMessages = deduplicateGatewayMessages([
            ...recoveredMessages,
            ...eligibleEventMessages,
        ]).filter(message => isConversationMessageAfterClearBoundary(message.msg_seq, existingConversation?.clearBeforeSeq));
        /** mappedMessages 在写库前完成整批 canonical 校验。 */
        const mappedMessages = mergedMessages.map(source => ({
            source,
            value: mapGatewayMessageToCore(source, {
                currentUserID: context.userID,
                conversationID,
            }),
        }));
        /** persistedBatch 返回实际 client identity 与幂等 unread 增量。 */
        const persistedBatch = await persistMappedMessages(messages, mappedMessages);
        /** persistedMapped 让会话 latest 指向最终 SQLite 主键。 */
        const persistedMapped = mappedMessages.map((mapped, index) => ({
            source: mapped.source,
            value: persistedBatch.messages[index],
        }));
        if (!existingConversation) {
            await this.restoreConversation(context, conversationID, conversations, messages);
        }
        else {
            await this.updateExistingConversation(existingConversation, conversations, mergedMessages, persistedMapped, persistedBatch.unreadDelta);
        }
        await applyLatestConversationAutoDeleteNotice(conversations, conversationID, mergedMessages);
        /** conversation 是自动删除通知也收敛后的最终缓存快照。 */
        const conversation = await conversations.getByID(conversationID);
        if (!conversation) {
            throw createWebIMSyncError('REALTIME_CONVERSATION_NOT_PERSISTED', 'Realtime message sync did not persist its conversation.');
        }
        return { messages: persistedBatch.messages, conversation };
    }
    /** 只推进已有会话的 latest、cursor、unread 与更新时间。 */
    async updateExistingConversation(existingConversation, conversations, gatewayMessages, mappedMessages, unreadDelta) {
        /** latestMessage 按 seq、发送时间选择最终指针。 */
        const latestMessage = selectLatestMessage(mappedMessages);
        /** lastMsgSeq 使用 uint64 字符串比较避免精度截断。 */
        const lastMsgSeq = maxDecimalString([
            existingConversation.lastMsgSeq,
            ...gatewayMessages.map(message => readString(message.msg_seq)),
        ]);
        /** nextConversation 保留 pinned/muted/draft 等本地字段。 */
        const nextConversation = {
            ...existingConversation,
            ...(latestMessage
                ? { latestMessageID: latestMessage.clientMsgID, listHidden: false }
                : {}),
            ...(lastMsgSeq ? { lastMsgSeq } : {}),
            unreadCount: existingConversation.unreadCount + unreadDelta,
            updatedAt: Math.max(existingConversation.updatedAt, latestMessage?.sendTime ?? 0),
        };
        await conversations.upsert(nextConversation);
    }
    /** 缺失会话时只用 Gateway 权威详情恢复 target/type。 */
    async restoreConversation(context, conversationID, conversations, messages) {
        /** remoteConversation 是缺失会话资料的唯一恢复来源。 */
        const remoteConversation = await this.dependencies.gatewayClient.getConversation({
            conversation_id: conversationID,
        });
        /** mapping 复用跨端 Gateway canonical DTO。 */
        const mapping = mapGatewayConversationToCore(remoteConversation, context.userID);
        if (mapping.latestMessage)
            await messages.upsert(mapping.latestMessage);
        await conversations.upsert(mapping.conversation);
    }
}
//# sourceMappingURL=realtime-message-sync.js.map