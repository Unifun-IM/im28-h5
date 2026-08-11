import { type Conversation, type ConversationListOptions, type GatewayHTTPClient, type Message } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from './sync-context.js';
import { type WebIMSyncMutationQueueDependencies } from './sync-mutation-queue.js';
import { type IMConversationSettingsSync } from './conversation-settings.js';
import { type WebIMUnreadMentionSnapshot } from './conversation-unread-mention.js';
/** 单次远端会话同步的分页限制。 */
export interface WebIMConversationSyncOptions {
    readonly pageSize?: number;
}
/** 会话列表缓存项同时提供对应的最新消息，避免页面直接查询 Repository。 */
export interface WebIMConversationListItem {
    readonly conversation: Conversation;
    readonly latestMessage: Message | null;
    readonly unreadMention: WebIMUnreadMentionSnapshot | null;
}
/** 页面可消费的 cache-first 会话能力。 */
export interface WebIMConversationSync extends IMConversationSettingsSync {
    listCached(options?: ConversationListOptions): Promise<readonly Conversation[]>;
    listCachedItems(options?: ConversationListOptions): Promise<readonly WebIMConversationListItem[]>;
    sync(options?: WebIMConversationSyncOptions): Promise<readonly Conversation[]>;
}
/** 会话同步依赖只接收 runtime 已持有的 canonical owners。 */
export interface WebIMConversationSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly now?: () => number;
}
/** 创建认证账号绑定的浏览器会话同步服务。 */
export declare function createWebIMConversationSync(dependencies: WebIMConversationSyncDependencies): WebIMConversationSync;
//# sourceMappingURL=conversation-sync.d.ts.map