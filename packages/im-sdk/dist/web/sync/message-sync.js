import { MessageRepository, mapGatewayMessageToCore, } from '@im28/im-sdk/core';
import { sendWebIMAudioMessage, } from './message-audio-send.js';
import { sendWebIMFileMessage, sendWebIMImageMessage, } from './message-media-send.js';
import { sendWebIMCustomEmojiMessage, } from './message-custom-emoji-send.js';
import { sendWebIMQuoteMessage, } from './message-quote-send.js';
import { sendWebIMTextMessage, } from './message-text-send.js';
import { sendWebIMMentionMessage, } from './message-mention-send.js';
import { sendWebIMVideoMessage, } from './message-video-send.js';
import { retryWebIMMessage, } from './message-retry.js';
import { forwardWebIMMessages, } from './message-forward.js';
import { deleteWebIMMessages, } from './message-delete.js';
import { editWebIMTextMessage, } from './message-edit.js';
import { createWebIMSyncError, requireWebIMSyncContext, } from './sync-context.js';
import { createWebIMSyncMutationQueue, } from './sync-mutation-queue.js';
/** 创建认证账号绑定的浏览器消息同步服务。 */
export function createWebIMMessageSync(dependencies) {
    return new WebIMMessageSyncImpl(dependencies);
}
/** 消息服务编排 shared Gateway mapper、上传端口与 Repository 状态机。 */
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
    /** 按调用顺序读取稳定消息 ID，供跨路由预览复用账号 cache。 */
    async getCachedByClientMsgIDs(clientMsgIDs) {
        // context 阻止匿名页面读取其他账号 cache。
        const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
        // normalizedIDs 丢弃空 ID 并避免重复查询同一消息。
        const normalizedIDs = Array.from(new Set(clientMsgIDs.map(item => item.trim()).filter(Boolean)));
        // repository 每次绑定当前 account database。
        const repository = new MessageRepository(context.database);
        // records 保持 caller 的稳定选择顺序，缺失项由上层显式处理。
        const records = await Promise.all(normalizedIDs.map(clientMsgID => repository.getByClientMsgID(clientMsgID)));
        return records.filter((message) => message !== null);
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
        // response failure 直接 reject，不退化为 fake cache success。
        const response = await this.dependencies.gatewayClient.pullMessages({
            conversation_id: conversationID,
            from_seq: fromSeq,
            limit: clampLimit(options.limit),
            desc: options.desc ?? true,
        });
        // messages 在任何写入前全部完成字段校验和映射。
        const messages = (response.messages ?? []).map(message => mapGatewayMessageToCore(message, {
            currentUserID: context.userID,
            conversationID,
        }));
        // repository 使用稳定 clientMsgID 幂等 upsert。
        const repository = new MessageRepository(context.database);
        for (const message of messages) {
            await repository.upsert(message);
        }
        return repository.getHistory({
            conversationID,
            limit: clampLimit(options.limit),
        });
    }
    /** 先落 sending 文本，再按 Gateway 结果收敛为 sent/failed。 */
    async sendText(options) {
        // context 保证发送账号与消息 direction 一致。
        const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
        return this.mutationQueue.enqueue(() => sendWebIMTextMessage(context, options, this.dependencies));
    }
    /** 发送 type106 群聊提及并保存完整目标身份。 */
    async sendMention(options) {
        // context 保证提及消息与当前账号 SQLite 一致。
        const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
        return this.mutationQueue.enqueue(() => sendWebIMMentionMessage(context, options, this.dependencies));
    }
    /** 发送 type114 引用消息并保留来源身份和文本快照。 */
    async sendQuote(options) {
        // context 在构造 optimistic 行前固定账号与 SQLite owner。
        const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
        return this.mutationQueue.enqueue(() => sendWebIMQuoteMessage(context, options, this.dependencies));
    }
    /** 发送 type 115 自定义表情，并在本地保留展示 URL 快照。 */
    async sendCustomEmoji(options) {
        // context 在发送前固定账号与 SQLite owner。
        const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
        return this.mutationQueue.enqueue(() => sendWebIMCustomEmojiMessage(context, options, this.dependencies));
    }
    /** 通过平台上传端口发送图片，不向页面暴露 transport。 */
    async sendImage(options) {
        // context 在上传前固定账号与 SQLite owner。
        const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
        return sendWebIMImageMessage(context, options, {
            ...this.dependencies,
            mutationQueue: this.mutationQueue,
        });
    }
    /** 通过平台上传端口发送语音并保留录音器实际媒体格式。 */
    async sendAudio(options) {
        // context 在上传前固定账号与 SQLite owner。
        const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
        return sendWebIMAudioMessage(context, options, {
            ...this.dependencies,
            mutationQueue: this.mutationQueue,
        });
    }
    /** 通过平台上传端口发送视频并保留浏览器解析的媒体元数据。 */
    async sendVideo(options) {
        // context 在上传前固定账号与 SQLite owner。
        const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
        return sendWebIMVideoMessage(context, options, {
            ...this.dependencies,
            mutationQueue: this.mutationQueue,
        });
    }
    /** 通过平台上传端口发送普通文件并保留精确元数据。 */
    async sendFile(options) {
        // context 在上传前固定账号与 SQLite owner。
        const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
        return sendWebIMFileMessage(context, options, {
            ...this.dependencies,
            mutationQueue: this.mutationQueue,
        });
    }
    /** 从当前账号 cache 重读来源并执行逐项可审计的批量转发。 */
    async forward(options) {
        // context 在来源读取和 optimistic 写入前固定账号数据库。
        const context = requireWebIMSyncContext(this.dependencies, 'Message forward');
        return this.mutationQueue.enqueue(() => forwardWebIMMessages(context, options, this.dependencies));
    }
    /** 从当前账号 cache 重读目标并执行 self/all 单删或批删。 */
    async delete(options) {
        // context 在 Gateway 和 SQLite mutation 前固定账号 owner。
        const context = requireWebIMSyncContext(this.dependencies, 'Message delete');
        return this.mutationQueue.enqueue(() => deleteWebIMMessages(context, options, this.dependencies));
    }
    /** 从当前账号 cache 重读目标并编辑同一条已发送文本消息。 */
    async editText(options) {
        // context 在 Gateway 和 SQLite mutation 前固定账号 owner。
        const context = requireWebIMSyncContext(this.dependencies, 'Message edit');
        return this.mutationQueue.enqueue(() => editWebIMTextMessage(context, options, this.dependencies));
    }
    /** 从当前账号 cache 恢复并重试同一条受支持的失败消息。 */
    async retry(options) {
        // context 固定失败行、发送者和数据库所属账号。
        const context = requireWebIMSyncContext(this.dependencies, 'Message retry');
        return this.mutationQueue.enqueue(() => retryWebIMMessage(context, options, this.dependencies));
    }
    /** 在 realtime 启动前把当前账号中断的发送恢复为 failed。 */
    async recoverInterruptedSends() {
        // context 固定恢复范围，禁止跨账号修改消息状态。
        const context = requireWebIMSyncContext(this.dependencies, 'Message recovery');
        return this.mutationQueue.enqueue(() => new MessageRepository(context.database).failInterruptedOutgoingSends(context.userID));
    }
}
/** 将 history window 限制在 Gateway 可控范围。 */
function clampLimit(value) {
    if (!Number.isFinite(value))
        return 30;
    return Math.min(100, Math.max(1, Math.trunc(value ?? 30)));
}
//# sourceMappingURL=message-sync.js.map