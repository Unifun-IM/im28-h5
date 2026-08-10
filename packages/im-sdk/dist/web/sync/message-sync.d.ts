import { type GatewayHTTPClient, type Message, type MessageHistoryOptions } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from './sync-context.js';
import { type WebIMSyncMutationQueueDependencies } from './sync-mutation-queue.js';
/** Gateway 历史拉取参数保留 uint64 seq 字符串。 */
export interface WebIMPullMessageHistoryOptions {
    readonly conversationID: string;
    readonly fromSeq: string;
    readonly limit?: number;
    readonly desc?: boolean;
}
/** 文本发送参数由 service 生成稳定 client message ID。 */
export interface WebIMSendTextMessageOptions {
    readonly conversationID: string;
    readonly text: string;
}
/** 页面可消费的消息 cache、pull 与 send 能力。 */
export interface WebIMMessageSync {
    getCachedHistory(options: MessageHistoryOptions): Promise<readonly Message[]>;
    pullHistory(options: WebIMPullMessageHistoryOptions): Promise<readonly Message[]>;
    sendText(options: WebIMSendTextMessageOptions): Promise<Message>;
}
/** 消息同步依赖复用 runtime 的 transport/account owners。 */
export interface WebIMMessageSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly createClientMessageID?: () => string;
    readonly now?: () => number;
}
/** 创建认证账号绑定的浏览器消息同步服务。 */
export declare function createWebIMMessageSync(dependencies: WebIMMessageSyncDependencies): WebIMMessageSync;
//# sourceMappingURL=message-sync.d.ts.map