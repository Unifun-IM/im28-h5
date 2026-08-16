import { type GatewayBatchSendMessageResult, type GatewayHTTPClient } from '@im28/im-sdk/core';
import { type WebIMSyncContext } from '../sync-context.js';
import type { IMBroadcastTarget, IMBroadcastTargetResult } from './message-broadcast.js';
/** 已完成身份规范化且必定携带幂等消息 ID 的内部群发目标。 */
export interface IMPreparedBroadcastTarget extends IMBroadcastTarget {
    readonly clientMsgID: string;
}
/** 按选择顺序解释 Gateway 逐目标结果并收敛可确认的本地缓存。 */
export declare function resolveIMBroadcastTargetResults(context: WebIMSyncContext, gatewayClient: GatewayHTTPClient, targets: readonly IMPreparedBroadcastTarget[], responseList: readonly GatewayBatchSendMessageResult[]): Promise<readonly IMBroadcastTargetResult[]>;
//# sourceMappingURL=message-broadcast-result.d.ts.map