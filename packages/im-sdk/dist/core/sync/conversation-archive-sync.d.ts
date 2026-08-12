import { type Conversation, type GatewayHTTPClient } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from './sync-context.js';
import { type WebIMSyncMutationQueueDependencies } from './sync-mutation-queue.js';
/** 归档会话远端全分页同步参数。 */
export interface IMConversationArchiveSyncOptions {
    readonly pageSize?: number;
}
/** 跨端归档会话快照同步能力。 */
export interface IMConversationArchiveSync {
    /** 全分页读取权威归档列表并收敛当前账号 SQLite。 */
    sync(options?: IMConversationArchiveSyncOptions): Promise<readonly Conversation[]>;
}
/** 归档同步允许平台补齐资料，但分页、映射和持久化只由共享 SDK 持有。 */
export interface IMConversationArchiveSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly enrichConversations?: (conversations: readonly Conversation[]) => Promise<readonly Conversation[]>;
}
/** 创建 RN、Web、Desktop 共用的归档快照同步器。 */
export declare function createIMConversationArchiveSync(dependencies: IMConversationArchiveSyncDependencies): IMConversationArchiveSync;
//# sourceMappingURL=conversation-archive-sync.d.ts.map