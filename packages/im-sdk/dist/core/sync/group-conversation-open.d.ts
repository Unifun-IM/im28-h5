import { type Conversation, type GatewayHTTPClient } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from './sync-context.js';
import type { WebIMSyncMutationQueueDependencies } from './sync-mutation-queue.js';
/** 按群稳定身份打开规范会话的输入。 */
export interface IMOpenGroupConversationOptions {
    readonly groupID: string;
    readonly conversationID?: string;
}
/** 群会话打开能力只依赖当前账号、共享队列和 Gateway。 */
export interface IMGroupConversationOpenDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
}
/** 打开已加入群的规范会话并在成功后写入当前账号缓存。 */
export declare function openIMGroupConversation(dependencies: IMGroupConversationOpenDependencies, options: IMOpenGroupConversationOptions): Promise<Conversation>;
//# sourceMappingURL=group-conversation-open.d.ts.map