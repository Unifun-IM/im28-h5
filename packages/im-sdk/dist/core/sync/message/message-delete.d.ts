import { type GatewayHTTPClient } from '@im28/im-sdk/core';
import { type WebIMMessageSendDependencies } from './message-send-state.js';
import type { WebIMDeleteMessagesOptions, WebIMDeleteMessagesResult } from './message-delete-types.js';
import { type WebIMSyncContext } from '../sync-context.js';
/** 主动删除复用 Gateway transport 与稳定操作 ID 生成器。 */
export interface WebIMDeleteMessagesDependencies extends WebIMMessageSendDependencies {
    readonly gatewayClient: GatewayHTTPClient;
}
/** 主动删除缓存消息，并只对 Gateway 确认成功的项目本地隐藏。 */
export declare function deleteWebIMMessages(context: WebIMSyncContext, options: WebIMDeleteMessagesOptions, dependencies: WebIMDeleteMessagesDependencies): Promise<WebIMDeleteMessagesResult>;
export type { WebIMDeleteMessageItemResult, WebIMDeleteMessagesOptions, WebIMDeleteMessagesResult, WebIMMessageDeleteScope, } from './message-delete-types.js';
//# sourceMappingURL=message-delete.d.ts.map