import { MessageRepository, type GatewayHTTPClient, type GatewayRealtimeEvent } from '@im28/im-sdk/core';
import { type ParsedRealtimeMessageUpdate } from './realtime-message-update-data.js';
import { type WebIMSyncContext } from './sync-context.js';
/** Message update handler 复用 runtime Gateway client。 */
export interface RealtimeMessageUpdateSyncDependencies {
    readonly gatewayClient: GatewayHTTPClient;
}
/** 创建无独立队列的 message update 持久化 handler。 */
export declare function createRealtimeMessageUpdateSync(dependencies: RealtimeMessageUpdateSyncDependencies): (event: GatewayRealtimeEvent, context: WebIMSyncContext) => Promise<boolean>;
/** 应用 edited 或 deleted，未知状态必须拒绝。 */
export declare function applyIMMessageUpdate(repository: MessageRepository, context: WebIMSyncContext, parsed: ParsedRealtimeMessageUpdate): Promise<void>;
//# sourceMappingURL=realtime-message-update-sync.d.ts.map