import { type Message } from '@im28/im-sdk/core';
import { type WebIMMessageSendDependencies } from './message-send-state.js';
import { type WebIMSyncContext } from '../sync-context.js';
import type { PreparedWebIMForwardBatch, WebIMForwardMessagesOptions } from './message-forward-types.js';
/** 复用真实转发 guard 判断页面入口与隐藏发送人能力。 */
export declare function canForwardWebIMMessage(message: Message, options?: {
    readonly hideSenderName?: boolean;
}): boolean;
/** 校验目标和全部来源后，原子写入同一批 optimistic 消息。 */
export declare function prepareWebIMForwardBatch(context: WebIMSyncContext, options: WebIMForwardMessagesOptions, dependencies: WebIMMessageSendDependencies): Promise<PreparedWebIMForwardBatch>;
//# sourceMappingURL=message-forward-state.d.ts.map