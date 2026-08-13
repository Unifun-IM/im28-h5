import { ConversationRepository, MessageRepository, } from '@im28/im-sdk/core';
import { sendWebIMAudioMessage, } from './message-audio-send.js';
import { sendWebIMCardMessage, } from './message-card-send.js';
import { sendWebIMFileMessage, sendWebIMImageMessage, } from './message-media-send.js';
import { sendWebIMCustomEmojiMessage, } from './message-custom-emoji-send.js';
import { sendWebIMQuoteMessage, } from './message-quote-send.js';
import { sendWebIMTextMessage, } from './message-text-send.js';
import { sendWebIMMentionMessage, } from './message-mention-send.js';
import { sendWebIMVideoMessage, } from './message-video-send.js';
import { retryWebIMMessage, } from './message-retry.js';
import { createIMMessageMutationSync, } from './message-mutations.js';
import { createWebIMSyncError, requireWebIMSyncContext, } from './sync-context.js';
import { createWebIMSyncMutationQueue, } from './sync-mutation-queue.js';
import { pullWebIMMessageHistory, pullWebIMMessageHistoryPage, } from './message-history-pull.js';
import { createIMMessageSearchSync, } from './message-search.js';
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
    /** messageMutations 让 Web facade 与 RN 消费同一主动写入实现。 */
    messageMutations;
    /** messageSearch 让 Web facade 与 RN 消费同一只读查询实现。 */
    messageSearch;
    /** 保存 runtime owners，不持有独立认证或数据库状态。 */
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.mutationQueue =
            dependencies.mutationQueue ?? createWebIMSyncMutationQueue();
        this.messageMutations = createIMMessageMutationSync({
            ...dependencies,
            mutationQueue: this.mutationQueue,
        });
        this.messageSearch = createIMMessageSearchSync(dependencies);
    }
    /** 从当前账号 SQLite 返回 newest-first 历史窗口。 */
    async getCachedHistory(options) {
        // context 阻止匿名页面读取其他账号 cache。
        const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
        // repository 每次绑定当前 account database。
        const repository = new MessageRepository(context.database);
        return repository.getHistory(options);
    }
    /** 在当前账号 SQLite 中按会话、关键词和消息类型搜索缓存。 */
    async searchCached(options) {
        return this.messageSearch.search(options);
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
    /** 按 client/server 稳定消息 ID 读取当前账号 SQLite，供引用来源恢复。 */
    async getCachedByStableMsgIDs(messageIDs) {
        /** context 阻止匿名页面或旧账号读取当前数据库。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
        /** normalizedIDs 丢弃空身份并保持首次出现顺序。 */
        const normalizedIDs = Array.from(new Set(messageIDs.map(item => item.trim()).filter(Boolean)));
        /** repository 只绑定本次认证账号数据库。 */
        const repository = new MessageRepository(context.database);
        /** records 先匹配 client ID，再按 Gateway quote 使用的 server ID 回退。 */
        const records = await Promise.all(normalizedIDs.map(async (messageID) => await repository.getByClientMsgID(messageID) ??
            repository.getByServerMsgID(messageID)));
        /** seenClientIDs 防止 caller 同时传 client/server ID 时重复返回同一消息。 */
        const seenClientIDs = new Set();
        return records.filter((message) => {
            if (!message || seenClientIDs.has(message.clientMsgID))
                return false;
            seenClientIDs.add(message.clientMsgID);
            return true;
        });
    }
    /** 从 Gateway 拉取历史并持久化后返回本地窗口。 */
    async pullHistory(options) {
        // context 固定本轮账号与 database owner。
        const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
        return this.mutationQueue.enqueue(() => pullWebIMMessageHistory(context, options, this.dependencies.gatewayClient));
    }
    /** 拉取单页历史并保留 Gateway 的下一页游标与结束事实。 */
    async pullHistoryPage(options) {
        /** context 固定本轮账号与 database owner。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
        return this.mutationQueue.enqueue(() => pullWebIMMessageHistoryPage(context, options, this.dependencies.gatewayClient));
    }
    /** 先落 sending 文本，再按 Gateway 结果收敛为 sent/failed。 */
    async sendText(options) {
        // context 保证发送账号与消息 direction 一致。
        const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
        return this.mutationQueue.enqueue(() => sendWebIMTextMessage(context, options, this.dependencies));
    }
    /** 发送 type106 群聊提及并保存完整目标身份。 */
    async sendMention(options) {
        // 生产 composition 委托 neutral facade；独立单测保留底层状态机入口。
        if (this.dependencies.groupMentionSync) {
            // conversation 从当前账号 cache 读取稳定群目标，禁止从 ID 前缀猜测。
            const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
            // conversationRepository 只负责兼容旧 messages.sendMention 调用的目标投影。
            const conversation = await new ConversationRepository(context.database).getByID(options.conversationID.trim());
            if (!conversation || conversation.type !== 'group') {
                throw createWebIMSyncError('MENTION_GROUP_CONVERSATION_MISMATCH', 'Mention target must be a cached group conversation.');
            }
            return this.dependencies.groupMentionSync.send({
                ...options,
                groupID: conversation.targetID,
            });
        }
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
    /** 发送 type108 用户或群名片，并复用统一消息状态机。 */
    async sendCard(options) {
        /** context 在构造规范卡片 body 前固定账号和 SQLite owner。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
        return this.mutationQueue.enqueue(() => sendWebIMCardMessage(context, options, this.dependencies));
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
        return this.messageMutations.forward(options);
    }
    /** 从当前账号 cache 重读来源并向多个真实会话转发。 */
    async forwardToTargets(options) {
        return this.messageMutations.forwardToTargets(options);
    }
    /** 从当前账号 cache 重读目标并执行 self/all 单删或批删。 */
    async delete(options) {
        return this.messageMutations.delete(options);
    }
    /** 从当前账号 cache 重读目标并编辑同一条已发送文本消息。 */
    async editText(options) {
        return this.messageMutations.editText(options);
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
//# sourceMappingURL=message-sync.js.map