import type { GatewayHTTPClient } from '@im28/im-sdk/core';
import type { WebIMMessageSendDependencies } from './message-send-state.js';
import type { WebIMForwardMessagesOptions, WebIMForwardMessagesResult } from './message-forward-types.js';
import type { WebIMSyncContext } from './sync-context.js';
/** 共享转发依赖复用既有 Gateway 与稳定 ID/时间注入。 */
export interface WebIMForwardMessagesDependencies extends WebIMMessageSendDependencies {
    readonly gatewayClient: GatewayHTTPClient;
}
/** 执行真实来源重读、optimistic 落库、Gateway 投递与逐行收敛。 */
export declare function forwardWebIMMessages(context: WebIMSyncContext, options: WebIMForwardMessagesOptions, dependencies: WebIMForwardMessagesDependencies): Promise<WebIMForwardMessagesResult>;
export type { WebIMForwardCommentResult, WebIMForwardItemResult, WebIMForwardMessagesOptions, WebIMForwardMessagesResult, } from './message-forward-types.js';
//# sourceMappingURL=message-forward.d.ts.map