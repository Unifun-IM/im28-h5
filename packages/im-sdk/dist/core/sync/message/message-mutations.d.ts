import type { GatewayHTTPClient, Message } from '@im28/im-sdk/core';
import { type WebIMDeleteMessagesOptions, type WebIMDeleteMessagesResult, type WebIMMessageDeleteScope } from './message-delete.js';
import { type WebIMEditTextMessageOptions } from './message-edit.js';
import { type WebIMForwardMessagesOptions, type WebIMForwardMessagesResult } from './message-forward.js';
import { type WebIMForwardMessagesToTargetsOptions, type WebIMForwardMessagesToTargetsResult } from './message-forward-targets.js';
import type { WebIMMessageSendDependencies } from './message-send-state.js';
import { type WebIMSyncContextDependencies } from '../sync-context.js';
import { type WebIMSyncMutationQueueDependencies } from '../sync-mutation-queue.js';
/** 平台中立的消息删除范围。 */
export type IMMessageDeleteScope = WebIMMessageDeleteScope;
/** 平台中立的消息删除参数。 */
export type IMDeleteMessagesOptions = WebIMDeleteMessagesOptions;
/** 平台中立的消息删除结果。 */
export type IMDeleteMessagesResult = WebIMDeleteMessagesResult;
/** 平台中立的文本编辑参数。 */
export type IMEditTextMessageOptions = WebIMEditTextMessageOptions;
/** 平台中立的消息转发参数。 */
export type IMForwardMessagesOptions = WebIMForwardMessagesOptions;
/** 平台中立的消息转发结果。 */
export type IMForwardMessagesResult = WebIMForwardMessagesResult;
/** RN、Web 与 Desktop 共用的主动消息 mutation facade。 */
export interface IMMessageMutationSync {
    /** 从当前账号缓存重读来源并执行真实转发。 */
    forward(options: IMForwardMessagesOptions): Promise<IMForwardMessagesResult>;
    /** 复用同一来源状态机向最多 50 个真实会话转发。 */
    forwardToTargets(options: WebIMForwardMessagesToTargetsOptions): Promise<WebIMForwardMessagesToTargetsResult>;
    /** 从当前账号缓存重读目标并执行 self/all 删除。 */
    delete(options: IMDeleteMessagesOptions): Promise<IMDeleteMessagesResult>;
    /** 从当前账号缓存重读目标并编辑同一条文本消息。 */
    editText(options: IMEditTextMessageOptions): Promise<Message>;
}
/** 中性 mutation facade 只接收账号数据库、Gateway、时钟与 ID 端口。 */
export interface IMMessageMutationSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies, WebIMMessageSendDependencies {
    readonly gatewayClient: GatewayHTTPClient;
}
/** 创建 RN、Web 与 Desktop 共用的消息 mutation facade。 */
export declare function createIMMessageMutationSync(dependencies: IMMessageMutationSyncDependencies): IMMessageMutationSync;
//# sourceMappingURL=message-mutations.d.ts.map