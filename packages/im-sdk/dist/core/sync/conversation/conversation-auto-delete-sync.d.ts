import { ConversationRepository, type ConversationAutoDeleteSeconds, type GatewayHTTPClient, type GatewayMessage } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from '../sync-context.js';
import { type WebIMSyncMutationQueueDependencies } from '../sync-mutation-queue.js';
/** 自动删除设置快照只保存服务端确认的会话元数据。 */
export interface WebIMConversationAutoDeleteSetting {
    readonly conversationID: string;
    readonly autoDeleteSeconds: ConversationAutoDeleteSeconds;
    readonly updatedBy?: string;
    readonly updatedAt: number;
}
/** 中性名称供 RN/Web/Desktop facade 使用，旧名称仅保留兼容。 */
export type IMConversationAutoDeleteSetting = WebIMConversationAutoDeleteSetting;
/** 自动删除能力提供权威读取与 success-only 更新。 */
export interface WebIMConversationAutoDeleteSync {
    getAutoDelete(conversationID: string): Promise<WebIMConversationAutoDeleteSetting>;
    setAutoDelete(conversationID: string, autoDeleteSeconds: number): Promise<WebIMConversationAutoDeleteSetting>;
}
/** 自动删除同步依赖复用 runtime 唯一 Gateway 与账号数据库。 */
export interface WebIMConversationAutoDeleteSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
}
/** 创建认证账号绑定的自动删除设置服务。 */
export declare function createWebIMConversationAutoDeleteSync(dependencies: WebIMConversationAutoDeleteSyncDependencies): WebIMConversationAutoDeleteSync;
/** 从 type1701 系统消息中提取严格自动删除变更。 */
export declare function parseConversationAutoDeleteNotice(message: GatewayMessage, conversationID: string): WebIMConversationAutoDeleteSetting | null;
/** 将批次内最新有效 1701 事件收敛到会话元数据。 */
export declare function applyLatestConversationAutoDeleteNotice(repository: ConversationRepository, conversationID: string, messages: readonly GatewayMessage[]): Promise<void>;
//# sourceMappingURL=conversation-auto-delete-sync.d.ts.map