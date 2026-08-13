import { type GatewayHTTPClient, type Message } from '@im28/im-sdk/core';
import { type WebIMSyncContext } from './sync-context.js';
import type { WebIMPullMessageHistoryOptions } from './message-sync-types.js';
import type { WebIMPullMessageHistoryResult } from './message-sync-types.js';
/** 从 Gateway 拉取历史并持久化后返回当前本地窗口。 */
export declare function pullWebIMMessageHistory(context: WebIMSyncContext, options: WebIMPullMessageHistoryOptions, gatewayClient: GatewayHTTPClient): Promise<readonly Message[]>;
/** 从 Gateway 拉取并持久化单页历史，同时保留服务端分页事实。 */
export declare function pullWebIMMessageHistoryPage(context: WebIMSyncContext, options: WebIMPullMessageHistoryOptions, gatewayClient: GatewayHTTPClient, validatePaginationCursor?: boolean): Promise<WebIMPullMessageHistoryResult>;
//# sourceMappingURL=message-history-pull.d.ts.map