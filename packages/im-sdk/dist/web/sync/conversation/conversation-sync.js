import { ConversationRepository, FriendshipRepository, MessageRepository, mapGatewayConversationToCore, } from '@im28/im-sdk/core';
import { createIMConversationClearSync, } from './conversation-clear-sync.js';
import { createWebIMSyncError, requireWebIMSyncContext, } from '../sync-context.js';
import { createWebIMSyncMutationQueue, } from '../sync-mutation-queue.js';
import { createIMConversationSettingsSync, } from './conversation-settings.js';
import { createIMConversationListActionsSync, } from './conversation-list-actions.js';
import { createIMConversationArchiveSync, } from './conversation-archive-sync.js';
import { readUnreadMentionSnapshot, } from './conversation-unread-mention.js';
import { syncIMGatewayDifference } from './gateway-difference-sync.js';
import { openIMGroupConversation, } from '../group/group-conversation-open.js';
import { createIMConversationDraftSync, } from './conversation-draft.js';
import { resolveGroupSenderDisplayName } from '../contact/sender-display-name.js';
import { resolveFriendshipDisplayProfile } from '../contact/friendship-display-profile.js';
/** 从指定账号上下文组合 cache-only 会话列表，不触发 Gateway 或写入。 */
export async function listWebIMCachedConversationItems(context, options = {}) {
    // conversationRepository 保留共享 SDK 的排序和归档语义。
    const conversationRepository = new ConversationRepository(context.database);
    // messageRepository 是最新消息 payload 的唯一读取 owner。
    const messageRepository = new MessageRepository(context.database);
    // conversations 先冻结本轮列表窗口，避免组合过程中改变排序。
    const conversations = await conversationRepository.list(options);
    /** directTargetIDs 只收集当前列表窗口内需要备注投影的单聊身份。 */
    const directTargetIDs = conversations
        .filter(conversation => conversation.type === 'single')
        .map(conversation => conversation.targetID);
    /** friendships 批量读取已确认好友关系，避免按会话逐行查询。 */
    const friendships = await new FriendshipRepository(context.database)
        .getByUserIDs(directTargetIDs);
    /** friendRemarkByUserID 保存当前账号可证明的非空好友备注。 */
    const friendRemarkByUserID = new Map();
    for (const friendship of friendships) {
        /** remark 复用好友资料唯一字段兼容规则，并自动拒绝非好友 alias。 */
        const remark = resolveFriendshipDisplayProfile(friendship).remark;
        if (remark)
            friendRemarkByUserID.set(friendship.userID, remark);
    }
    return Promise.all(conversations.map(async (conversation) => {
        /** directRemark 对齐 RN“好友备注优先于会话昵称”的列表规则。 */
        const directRemark = conversation.type === 'single'
            ? friendRemarkByUserID.get(conversation.targetID)
            : undefined;
        /** projectedConversation 只修改本次展示快照，不覆盖 SQLite 会话事实。 */
        const projectedConversation = directRemark
            ? { ...conversation, name: directRemark }
            : conversation;
        /** latestMessage 保留会话远端指针指向的普通摘要真相。 */
        const latestMessage = conversation.latestMessageID
            ? await messageRepository.getByClientMsgID(conversation.latestMessageID)
            : null;
        /** latestSenderDisplayName 只为群收到的最新消息组合现有缓存，不触发网络同步。 */
        const latestSenderDisplayName = conversation.type === 'group' &&
            latestMessage?.direction === 'incoming'
            ? await resolveGroupSenderDisplayName(context.database, conversation.targetID, latestMessage.senderID)
            : undefined;
        /** unreadMention 由共享 SQLite 未读窗口查询提供，不扫描页面 history。 */
        const unreadMention = await readUnreadMentionSnapshot(context, conversation);
        return {
            conversation: projectedConversation,
            latestMessage,
            ...(latestSenderDisplayName ? { latestSenderDisplayName } : {}),
            unreadMention,
        };
    }));
}
/** 创建认证账号绑定的跨端会话同步服务。 */
export function createIMConversationSync(dependencies) {
    return new WebIMConversationSyncImpl(dependencies);
}
/** 兼容已发布的 Web 命名；实现与 createIMConversationSync 相同。 */
export const createWebIMConversationSync = createIMConversationSync;
/** 会话服务只编排 Gateway、mapping 和共享 Repository。 */
class WebIMConversationSyncImpl {
    // dependencies 动态读取当前 runtime 账号和数据库。
    dependencies;
    // mutationQueue 在聚合 facade 中与消息和 realtime 共用。
    mutationQueue;
    /** settingsSync 是 RN/Web 共用的会话设置与自动删除 owner。 */
    settingsSync;
    /** clearSync 是 RN/Web/Desktop 共用的 destructive convergence owner。 */
    clearSync;
    /** listActionsSync 是 RN/Web/Desktop 共用的列表动作 owner。 */
    listActionsSync;
    /** archiveSync 是 RN/Web/Desktop 共用的归档分页与快照 owner。 */
    archiveSync;
    /** draftSync 是正文和预设表情实体的本地持久化 owner。 */
    draftSync;
    /** 保存 runtime owners，不复制 transport 或 storage 状态。 */
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.mutationQueue =
            dependencies.mutationQueue ?? createWebIMSyncMutationQueue();
        this.settingsSync = createIMConversationSettingsSync({
            ...dependencies,
            mutationQueue: this.mutationQueue,
        });
        this.clearSync = createIMConversationClearSync({
            ...dependencies,
            mutationQueue: this.mutationQueue,
        });
        this.listActionsSync = createIMConversationListActionsSync({
            ...dependencies,
            mutationQueue: this.mutationQueue,
        });
        this.archiveSync = createIMConversationArchiveSync({
            ...dependencies,
            mutationQueue: this.mutationQueue,
        });
        this.draftSync = createIMConversationDraftSync({
            ...dependencies,
            mutationQueue: this.mutationQueue,
        });
    }
    /** 从当前账号 SQLite 返回排序后的会话 cache。 */
    async listCached(options = {}) {
        // context 保证 auth 与 account database 同时可用。
        const context = requireWebIMSyncContext(this.dependencies, 'Conversation sync');
        // repository 每次绑定当前 database，禁止跨账号复用实例。
        const repository = new ConversationRepository(context.database);
        return repository.list(options);
    }
    /** 从当前账号 SQLite 组合会话与最新消息，供列表稳定渲染摘要。 */
    async listCachedItems(options = {}) {
        // context 保证会话与消息读取始终来自同一账号数据库。
        const context = requireWebIMSyncContext(this.dependencies, 'Conversation sync');
        return listWebIMCachedConversationItems(context, options);
    }
    /** 全分页拉取 Gateway 会话后替换当前账号 cache。 */
    async sync(options = {}) {
        // context 在网络请求前冻结本轮 user/database owner。
        const context = requireWebIMSyncContext(this.dependencies, 'Conversation sync');
        return this.mutationQueue.enqueue(() => this.syncDirect(context, options));
    }
    /** 打开群会话并委托共享身份校验与 success-only cache owner。 */
    openGroup(options) {
        return openIMGroupConversation({ ...this.dependencies, mutationQueue: this.mutationQueue }, options);
    }
    /** 全分页同步归档端点，不复用普通会话替换语义。 */
    syncArchived(options = {}) {
        return this.archiveSync.sync(options);
    }
    /** 清空会话历史并委托共享 Gateway cursor 状态机。 */
    clear(options) {
        return this.clearSync.clear(options);
    }
    /** 从当前账号 SQLite 读取规范草稿文档。 */
    getDraft(conversationID) {
        return this.draftSync.getDraft(conversationID);
    }
    /** 在共享队列内保存本地草稿，不调用 Gateway。 */
    saveDraft(conversationID, document) {
        return this.draftSync.saveDraft(conversationID, document);
    }
    /** 标记已读并委托平台中立列表动作 owner。 */
    markRead(conversationID, readSeq) {
        return this.listActionsSync.markRead(conversationID, readSeq);
    }
    /** 标记未读并委托平台中立列表动作 owner。 */
    markUnread(conversationID, manualUnread = true) {
        return this.listActionsSync.markUnread(conversationID, manualUnread);
    }
    /** 切换归档并委托平台中立列表动作 owner。 */
    setArchived(conversationID, archived) {
        return this.listActionsSync.setArchived(conversationID, archived);
    }
    /** 读取真实 Gateway 设置并委托唯一 setting owner。 */
    getSetting(conversationID) {
        return this.settingsSync.getSetting(conversationID);
    }
    /** 设置免打扰并委托唯一 setting owner。 */
    async setMuted(conversationID, isMuted) {
        return this.settingsSync.setMuted(conversationID, isMuted);
    }
    /** 设置置顶并委托唯一 setting owner。 */
    async setPinned(conversationID, isPinned) {
        return this.settingsSync.setPinned(conversationID, isPinned);
    }
    /** 读取权威自动删除设置并委托唯一生命周期 owner。 */
    getAutoDelete(conversationID) {
        return this.settingsSync.getAutoDelete(conversationID);
    }
    /** 设置自动删除时长并委托唯一生命周期 owner。 */
    setAutoDelete(conversationID, autoDeleteSeconds) {
        return this.settingsSync.setAutoDelete(conversationID, autoDeleteSeconds);
    }
    /** 在共享队列内完成全分页拉取、映射和 cache 替换。 */
    async syncDirect(context, options) {
        // pageSize 限制异常调用造成的服务端或内存压力。
        const pageSize = clampPageSize(options.pageSize);
        if (this.dependencies.useGatewayDifference && !options.forceFullSnapshot) {
            // Difference owner 负责分页、双游标和原子持久化，页面只读取最终 cache。
            await syncIMGatewayDifference(this.dependencies.gatewayClient, context, pageSize);
            return new ConversationRepository(context.database).list();
        }
        // remoteConversations 仅在所有分页成功后进入持久化阶段。
        const remoteConversations = await this.fetchAllPages(pageSize);
        // mappings 在任何写入前完成，字段错误不会替换旧 cache。
        const mappings = remoteConversations.map(conversation => mapGatewayConversationToCore(conversation, context.userID));
        // conversations 按 ID 去重，最后一页版本覆盖早期页版本。
        const conversations = [
            ...new Map(mappings.map(mapping => [
                mapping.conversation.conversationID,
                mapping.conversation,
            ])).values(),
        ];
        // messageRepository 先保存会话引用的 latest message。
        const messageRepository = new MessageRepository(context.database);
        for (const mapping of mappings) {
            if (mapping.latestMessage) {
                await messageRepository.upsert(mapping.latestMessage);
            }
        }
        // conversationRepository 最后原子替换完整会话集合。
        const conversationRepository = new ConversationRepository(context.database);
        await conversationRepository.replaceUnarchived(conversations);
        return conversationRepository.list();
    }
    /** 拉取全部分页，并拒绝循环 token 和无界分页。 */
    async fetchAllPages(pageSize) {
        // conversations 在远端完整成功前只存在于内存。
        const conversations = [];
        // seenTokens 阻止服务端重复 token 导致死循环。
        const seenTokens = new Set();
        // pageToken 为空表示首屏或同步完成。
        let pageToken;
        for (let page = 0; page < 1000; page += 1) {
            // response 由共享 client 验证 HTTP/envelope 错误语义。
            const response = await this.dependencies.gatewayClient.listConversations({
                limit: pageSize,
                ...(pageToken ? { page_token: pageToken } : {}),
            });
            if (!Array.isArray(response.conversations)) {
                throw createWebIMSyncError('SYNC_INVALID_RESPONSE', 'Gateway conversation list did not explicitly return conversations.');
            }
            conversations.push(...response.conversations);
            // nextPageToken 只接受非空稳定 token。
            const nextPageToken = response.next_page_token?.trim();
            if (!nextPageToken) {
                return conversations;
            }
            if (seenTokens.has(nextPageToken)) {
                throw createWebIMSyncError('SYNC_PAGINATION_LOOP', 'Gateway conversation pagination returned a repeated token.');
            }
            seenTokens.add(nextPageToken);
            pageToken = nextPageToken;
        }
        throw createWebIMSyncError('SYNC_PAGE_LIMIT_EXCEEDED', 'Gateway conversation pagination exceeded the safety limit.');
    }
}
/** 将调用方 page size 限制在 Gateway 可控范围。 */
function clampPageSize(value) {
    if (!Number.isFinite(value)) {
        return 100;
    }
    return Math.min(200, Math.max(1, Math.trunc(value ?? 100)));
}
//# sourceMappingURL=conversation-sync.js.map