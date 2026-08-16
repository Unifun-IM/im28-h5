import { type Conversation, type GatewayHTTPClient, type Message } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from '../sync-context.js';
import { type WebIMSyncMutationQueueDependencies } from '../sync-mutation-queue.js';
/** RN、Web、Desktop 共用的实时消息缓存收敛结果。 */
export interface IMRealtimeMessageSyncResult {
    readonly messages: readonly Message[];
    readonly conversations: readonly Conversation[];
}
/** 中性实时消息 owner 只依赖认证账号、Gateway 与共享队列。 */
export interface IMRealtimeMessageSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
}
/** 中性实时消息 facade 负责缺口恢复、幂等入库和会话推进。 */
export interface IMRealtimeMessageSync {
    handle(payload: unknown): Promise<IMRealtimeMessageSyncResult>;
}
/** 创建绑定 runtime 当前账号数据库的实时消息 facade。 */
export declare function createIMRealtimeMessageSync(dependencies: IMRealtimeMessageSyncDependencies): IMRealtimeMessageSync;
//# sourceMappingURL=realtime-message-sync.d.ts.map