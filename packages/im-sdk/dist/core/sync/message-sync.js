import { MessageRepository, mapGatewayMessageToCore, } from '@im28/im-sdk/core';
import { executeWebIMMessageSend, } from './message-send-state.js';
import { sendWebIMAudioMessage, } from './message-audio-send.js';
import { sendWebIMFileMessage, sendWebIMImageMessage, } from './message-media-send.js';
import { sendWebIMVideoMessage, } from './message-video-send.js';
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
        return this.mutationQueue.enqueue(() => this.sendTextDirect(context, options));
    }
    /** 校验文本并复用通用 optimistic send 状态机。 */
    async sendTextDirect(context, options) {
        // text 在创建 optimistic row 前统一 trim。
        const text = options.text.trim();
        if (!text) {
            throw createWebIMSyncError('INVALID_TEXT_MESSAGE', 'Text sending requires non-empty text.');
        }
        return executeWebIMMessageSend(context, {
            conversationID: options.conversationID,
            contentType: 101,
            payload: { text: { text } },
        }, { text: { text } }, this.dependencies);
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
}
/** 将 history window 限制在 Gateway 可控范围。 */
function clampLimit(value) {
    if (!Number.isFinite(value))
        return 30;
    return Math.min(100, Math.max(1, Math.trunc(value ?? 30)));
}
//# sourceMappingURL=message-sync.js.map