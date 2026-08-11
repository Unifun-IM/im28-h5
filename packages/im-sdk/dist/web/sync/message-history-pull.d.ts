import { type GatewayHTTPClient, type Message } from '@im28/im-sdk/core';
import { type WebIMSyncContext } from './sync-context.js';
import type { WebIMPullMessageHistoryOptions } from './message-sync-types.js';
/** 从 Gateway 拉取历史并持久化后返回当前本地窗口。 */
export declare function pullWebIMMessageHistory(context: WebIMSyncContext, options: WebIMPullMessageHistoryOptions, gatewayClient: GatewayHTTPClient): Promise<readonly Message[]>;
//# sourceMappingURL=message-history-pull.d.ts.map