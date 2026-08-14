import { type Conversation, type ConversationListOptions, type Message } from '@im28/im-sdk/core';
import { type IMConversationClearOptions, type IMConversationClearSyncDependencies } from './conversation-clear-sync.js';
import { type IMConversationSettingsSync } from './conversation-settings.js';
import { type IMConversationListActionsSync } from './conversation-list-actions.js';
import { type WebIMUnreadMentionSnapshot } from './conversation-unread-mention.js';
import { type IMOpenGroupConversationOptions } from './group-conversation-open.js';
import { type IMConversationDraftSync } from './conversation-draft.js';
/** 单次远端会话同步的分页限制。 */
export interface WebIMConversationSyncOptions {
    readonly pageSize?: number;
}
/** 会话列表缓存项同时提供对应的最新消息，避免页面直接查询 Repository。 */
export interface WebIMConversationListItem {
    readonly conversation: Conversation;
    readonly latestMessage: Message | null;
    /** latestSenderDisplayName 为群最新消息提供 RN 优先级的缓存展示名。 */
    readonly latestSenderDisplayName?: string;
    readonly unreadMention: WebIMUnreadMentionSnapshot | null;
}
/** 页面可消费的 cache-first 会话能力。 */
export interface WebIMConversationSync extends IMConversationSettingsSync, IMConversationListActionsSync, IMConversationDraftSync {
    listCached(options?: ConversationListOptions): Promise<readonly Conversation[]>;
    listCachedItems(options?: ConversationListOptions): Promise<readonly WebIMConversationListItem[]>;
    sync(options?: WebIMConversationSyncOptions): Promise<readonly Conversation[]>;
    /** 按群身份读取或拉取规范会话并收敛当前账号缓存。 */
    openGroup(options: IMOpenGroupConversationOptions): Promise<Conversation>;
    /** 通过独立归档端点收敛完整归档快照。 */
    syncArchived(options?: WebIMConversationSyncOptions): Promise<readonly Conversation[]>;
    /** 通过共享 success-only 状态机清空会话历史。 */
    clear(options: IMConversationClearOptions): Promise<Conversation>;
}
/** 会话同步依赖只接收 runtime 已持有的 canonical owners。 */
export interface WebIMConversationSyncDependencies extends IMConversationClearSyncDependencies {
    /** Web 新协议显式启用 Difference，Desktop/兼容测试默认保留列表同步。 */
    readonly useGatewayDifference?: boolean;
}
/** 创建认证账号绑定的浏览器会话同步服务。 */
export declare function createWebIMConversationSync(dependencies: WebIMConversationSyncDependencies): WebIMConversationSync;
//# sourceMappingURL=conversation-sync.d.ts.map