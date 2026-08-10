import { ConversationRepository, MessageRepository, mapGatewayMessageToCore, } from '@im28/im-sdk/core';
import { createWebIMSyncError, requireWebIMSyncContext, } from './sync-context.js';
import { createWebIMSyncMutationQueue, } from './sync-mutation-queue.js';
/** 创建认证账号绑定的浏览器消息同步服务。 */
export function createWebIMMessageSync(dependencies) {
    return new WebIMMessageSyncImpl(dependencies);
}
/** 消息服务编排 shared Gateway mapper 与 Repository 状态机。 */
class WebIMMessageSyncImpl {
    // dependencies 动态读取当前认证账号和 database。
    dependencies;
    // mutationQueue 在聚合 facade 中与会话和 realtime 共用。
    mutationQueue;
    /** 保存 runtime owners，不持有独立认证或数据库状态。 */
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.mutationQueue =
            dependencies.mutationQueue ?? createWebIMSyncMutationQueue();
    }
    /** 从当前账号 SQLite 返回 newest-first 历史窗口。 */
    async getCachedHistory(options) {
        // context 阻止匿名页面读取其他账号 cache。
        const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
        // repository 每次绑定当前 account database。
        const repository = new MessageRepository(context.database);
        return repository.getHistory(options);
    }
    /** 从 Gateway 拉取历史并持久化后返回本地窗口。 */
    async pullHistory(options) {
        // context 固定本轮账号与 database owner。
        const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
        return this.mutationQueue.enqueue(() => this.pullHistoryDirect(context, options));
    }
    /** 在共享队列内完成历史拉取、映射和持久化。 */
    async pullHistoryDirect(context, options) {
        // conversationID 是远端和本地分区共同主键。
        const conversationID = options.conversationID.trim();
        // fromSeq 保留 uint64 string，禁止经过 JS number 截断。
        const fromSeq = options.fromSeq.trim();
        if (!conversationID || !fromSeq) {
            throw createWebIMSyncError('INVALID_HISTORY_CURSOR', 'Message history requires a conversation ID and fromSeq.');
        }
        // limit 与 Gateway 首批 history window 保持有限范围。
        const limit = clampLimit(options.limit);
        // response failure 直接 reject，不退化为 fake cache success。
        const response = await this.dependencies.gatewayClient.pullMessages({
            conversation_id: conversationID,
            from_seq: fromSeq,
            limit,
            desc: options.desc ?? true,
        });
        // messages 在任何写入前全部完成字段校验和映射。
        const messages = (response.messages ?? []).map(message => mapGatewayMessageToCore(message, {
            currentUserID: context.userID,
            conversationID,
        }));
        // repository 使用稳定 clientMsgID 幂等 upsert。
        const repository = new MessageRepository(context.database);
        // 当前批次按 Gateway 顺序写入，adapter 负责提交串行化。
        for (const message of messages) {
            await repository.upsert(message);
        }
        return repository.getHistory({ conversationID, limit });
    }
    /** 先落 sending 消息，再按 Gateway 结果收敛为 sent/failed。 */
    async sendText(options) {
        // context 保证发送账号与消息 direction 一致。
        const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
        return this.mutationQueue.enqueue(() => this.sendTextDirect(context, options));
    }
    /** 在共享队列内完整执行 optimistic send 状态机。 */
    async sendTextDirect(context, options) {
        // prepared 在任何 sending 写入前完成目标和内容校验。
        const prepared = await this.prepareTextSend(context, options);
        await prepared.messageRepository.upsert(prepared.localMessage);
        await prepared.conversationRepository.updateLatestMessage(prepared.conversationID, prepared.clientMsgID, prepared.localMessage.sendTime);
        return this.completeTextSend(context, prepared);
    }
    /** 校验会话并创建稳定的本地 sending 消息。 */
    async prepareTextSend(context, options) {
        // conversationID 必须指向当前 cache 的已有会话。
        const conversationID = options.conversationID.trim();
        // text 在创建 optimistic row 前统一 trim。
        const text = options.text.trim();
        if (!conversationID || !text) {
            throw createWebIMSyncError('INVALID_TEXT_MESSAGE', 'Text sending requires a conversation ID and non-empty text.');
        }
        // conversationRepository 验证默认聊天路径已打开真实会话。
        const conversationRepository = new ConversationRepository(context.database);
        // conversation 防止向不存在的本地目标构造 fake direct session。
        const conversation = await conversationRepository.getByID(conversationID);
        if (!conversation) {
            throw createWebIMSyncError('CONVERSATION_NOT_FOUND', 'Text sending requires an existing cached conversation.');
        }
        // clientMsgID 在重试和状态更新中保持同一主键。
        const clientMsgID = this.createClientMessageID();
        // sendTime 由注入 clock 提供可测试的 optimistic 排序时间。
        const sendTime = this.dependencies.now?.() ?? Date.now();
        // localMessage 是 Gateway 调用前必须持久化的 sending row。
        const localMessage = {
            clientMsgID,
            conversationID,
            senderID: context.userID,
            direction: 'outgoing',
            contentType: 101,
            status: 'sending',
            sendTime,
            payload: { text: { text } },
        };
        // messageRepository 管理 sending -> sent/failed 状态。
        const messageRepository = new MessageRepository(context.database);
        return {
            conversationID,
            text,
            clientMsgID,
            localMessage,
            conversationRepository,
            messageRepository,
        };
    }
    /** 调用 Gateway 并将 sending 状态收敛为 sent 或 failed。 */
    async completeTextSend(context, prepared) {
        try {
            // remoteMessage 必须回显相同幂等 ID，避免产生双消息。
            const remoteMessage = await this.dependencies.gatewayClient.sendMessage({
                conversation_id: prepared.conversationID,
                client_msg_id: prepared.clientMsgID,
                body: { text: { text: prepared.text } },
            });
            // sentMessage 复用唯一 shared mapper。
            const sentMessage = mapGatewayMessageToCore(remoteMessage, {
                currentUserID: context.userID,
                conversationID: prepared.conversationID,
            });
            if (sentMessage.clientMsgID !== prepared.clientMsgID) {
                throw createWebIMSyncError('CLIENT_MESSAGE_ID_MISMATCH', 'Gateway returned a different client message ID.');
            }
            await prepared.messageRepository.upsert({
                ...sentMessage,
                status: 'sent',
            });
            await prepared.conversationRepository.updateLatestMessage(prepared.conversationID, prepared.clientMsgID, sentMessage.sendTime);
            return { ...sentMessage, status: 'sent' };
        }
        catch (cause) {
            try {
                await prepared.messageRepository.updateStatus(prepared.clientMsgID, 'failed');
            }
            catch (statusCause) {
                throw new AggregateError([cause, statusCause], 'Text send and failed-state persistence both failed.');
            }
            throw cause;
        }
    }
    /** 创建并校验本地消息幂等 ID。 */
    createClientMessageID() {
        // id 优先使用测试/宿主注入生成器，否则使用浏览器 randomUUID。
        const id = (this.dependencies.createClientMessageID?.() ??
            globalThis.crypto?.randomUUID?.())?.trim();
        if (!id) {
            throw createWebIMSyncError('CLIENT_MESSAGE_ID_UNAVAILABLE', 'A stable client message ID generator is required.');
        }
        return id;
    }
}
/** 将 history window 限制在 Gateway 可控范围。 */
function clampLimit(value) {
    if (!Number.isFinite(value)) {
        return 30;
    }
    return Math.min(100, Math.max(1, Math.trunc(value ?? 30)));
}
//# sourceMappingURL=message-sync.js.map