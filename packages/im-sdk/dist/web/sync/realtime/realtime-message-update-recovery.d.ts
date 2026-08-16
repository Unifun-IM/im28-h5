import type { GatewayHTTPClient } from '@im28/im-sdk/core';
import { type ParsedRealtimeMessageUpdate } from './realtime-message-update-data.js';
/** update recovery 返回排序后的操作与服务端最终 cursor。 */
export interface RealtimeMessageUpdateRecovery {
    readonly updates: readonly ParsedRealtimeMessageUpdate[];
    readonly finalCursor?: string;
}
/** 按 realtime cursor 状态选择直用事件或分页恢复。 */
export declare function recoverRealtimeMessageUpdates(gatewayClient: GatewayHTTPClient, conversationID: string, storedCursor: string, eventUpdates: readonly ParsedRealtimeMessageUpdate[]): Promise<RealtimeMessageUpdateRecovery>;
//# sourceMappingURL=realtime-message-update-recovery.d.ts.map