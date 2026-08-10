import { type GatewayHTTPClient, type GatewayRealtimeEvent } from '@im28/im-sdk/core';
import { type WebIMSyncContext } from './sync-context.js';
/** Message update handler 复用 runtime Gateway client。 */
export interface RealtimeMessageUpdateSyncDependencies {
    readonly gatewayClient: GatewayHTTPClient;
}
/** 创建无独立队列的 message update 持久化 handler。 */
export declare function createRealtimeMessageUpdateSync(dependencies: RealtimeMessageUpdateSyncDependencies): (event: GatewayRealtimeEvent, context: WebIMSyncContext) => Promise<boolean>;
//# sourceMappingURL=realtime-message-update-sync.d.ts.map