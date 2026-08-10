import { type GatewayHTTPClient, type GatewayRealtimeEvent } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from './sync-context.js';
import { type WebIMSyncMutationQueueDependencies } from './sync-mutation-queue.js';
/** 实时同步只公开串行消费 normalized Gateway event 的入口。 */
export interface WebIMRealtimeSync {
    handle(event: GatewayRealtimeEvent): Promise<boolean>;
}
/** 实时同步复用 runtime 唯一 Gateway client 与账号数据库 owner。 */
export interface WebIMRealtimeSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
}
/** 创建与 runtime 同生命周期的实时持久化队列。 */
export declare function createWebIMRealtimeSync(dependencies: WebIMRealtimeSyncDependencies): WebIMRealtimeSync;
//# sourceMappingURL=realtime-sync.d.ts.map