import { ConversationRepository, MessageRepository, mapGatewayConversationToCore, } from '@im28/im-sdk/core';
import { createIMConversationClearSync, isIMConversationClearRealtime, } from '../conversation/conversation-clear-sync.js';
import { createWebIMSyncError, requireWebIMSyncContext, } from '../sync-context.js';
import { collectGatewayConversations, readString, } from './realtime-event-data.js';
import { createIMRealtimeMessageSync, } from './realtime-message-sync.js';
import { createRealtimeMessageUpdateSync } from './realtime-message-update-sync.js';
import { createWebIMSyncMutationQueue, } from '../sync-mutation-queue.js';
/** 创建与 runtime 同生命周期的实时持久化队列。 */
export function createIMRealtimeSync(dependencies) {
    return new WebIMRealtimeSyncImpl(dependencies);
}
/** 兼容已发布的 Web 命名；实现与 createIMRealtimeSync 相同。 */
export const createWebIMRealtimeSync = createIMRealtimeSync;
/** 单队列编排实时事件、HTTP 恢复与 Repository 写入。 */
class WebIMRealtimeSyncImpl {
    // dependencies 动态读取当前认证账号，但 Gateway client 保持唯一。
    dependencies;
    // handleMessageUpdate 在主队列内应用独立 update cursor。
    handleMessageUpdate;
    // messageSync 是 RN/Web/Desktop 共用的缺口与缓存收敛 owner。
    messageSync;
    /** clearSync 在普通消息前消费 type2102 destructive 控制通知。 */
    clearSync;
    // mutationQueue 与 HTTP sync/send 共用，防止全量结果覆盖 realtime delta。
    mutationQueue;
    /** 保存 runtime owners，不持有账号外的可变业务状态。 */
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.handleMessageUpdate = createRealtimeMessageUpdateSync(dependencies);
        this.mutationQueue =
            dependencies.mutationQueue ?? createWebIMSyncMutationQueue();
        this.messageSync = createIMRealtimeMessageSync({
            ...dependencies,
            mutationQueue: this.mutationQueue,
        });
        this.clearSync = createIMConversationClearSync({
            ...dependencies,
            mutationQueue: this.mutationQueue,
        });
    }
    /** 将当前事件追加到队列，失败后仍允许后续事件继续处理。 */
    handle(event) {
        if (event.type !== 'message' &&
            event.type !== 'conversation' &&
            event.type !== 'message.update') {
            return Promise.resolve(false);
        }
        if (event.type === 'message') {
            /** payload 同时用于控制通知识别与普通消息收敛。 */
            const payload = event.data ?? event.raw;
            if (isIMConversationClearRealtime(payload)) {
                return this.clearSync.handleRealtime(payload).then(() => true);
            }
            return this.messageSync.handle(payload).then(() => true);
        }
        // context 在入队时冻结，防止旧账号事件写入切换后的新账号数据库。
        const context = requireWebIMSyncContext(this.dependencies, 'Realtime sync');
        // result 保留当前事件的成功、忽略或失败结果。
        return this.mutationQueue.enqueue(() => this.handleDirect(event, context));
    }
    /** 只路由本片明确支持的新消息与会话变更。 */
    async handleDirect(event, context) {
        if (event.type === 'message.update') {
            return this.handleMessageUpdate(event, context);
        }
        return this.persistConversationEvent(event, context);
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