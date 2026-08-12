import { type Conversation, type GatewayHTTPClient } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from './sync-context.js';
import { type WebIMSyncMutationQueueDependencies } from './sync-mutation-queue.js';
/** 会话列表长按菜单共用的非设置动作。 */
export interface IMConversationListActionsSync {
    /** 成功上报已读后清除未读数和手动未读标记。 */
    markRead(conversationID: string, readSeq?: string | number): Promise<Conversation>;
    /** 成功上报后切换手动未读标记。 */
    markUnread(conversationID: string, manualUnread?: boolean): Promise<Conversation>;
    /** 成功上报后切换归档索引。 */
    setArchived(conversationID: string, archived: boolean): Promise<Conversation>;
}
/** 会话列表动作复用当前账号、Gateway 和共享串行队列。 */
export interface IMConversationListActionsSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
}
/** 创建 RN/Web/Desktop 共用的会话列表动作 facade。 */
export declare function createIMConversationListActionsSync(dependencies: IMConversationListActionsSyncDependencies): IMConversationListActionsSync;
//# sourceMappingURL=conversation-list-actions.d.ts.map