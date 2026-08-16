import { type GatewayHTTPClient } from '@im28/im-sdk/core';
import type { WebIMSyncContext } from '../sync-context.js';
/** 账号 Difference 同步结果只公开受影响会话和最终账号游标。 */
export interface IMGatewayDifferenceSyncResult {
    readonly conversationIDs: readonly string[];
    readonly pts: string;
}
/** 按新 OpenAPI Difference 协议收敛账号与会话差量。 */
export declare function syncIMGatewayDifference(gatewayClient: GatewayHTTPClient, context: WebIMSyncContext, pageSize?: number): Promise<IMGatewayDifferenceSyncResult>;
//# sourceMappingURL=gateway-difference-sync.d.ts.map