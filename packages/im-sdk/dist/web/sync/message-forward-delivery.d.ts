import { type GatewayHTTPClient } from '@im28/im-sdk/core';
import type { PreparedWebIMForwardBatch, WebIMForwardMessagesResult } from './message-forward-types.js';
/** 按 normal batch 或 hidden-sender individual 分支投递已落库批次。 */
export declare function deliverWebIMForwardBatch(prepared: PreparedWebIMForwardBatch, gatewayClient: GatewayHTTPClient): Promise<WebIMForwardMessagesResult>;
//# sourceMappingURL=message-forward-delivery.d.ts.map