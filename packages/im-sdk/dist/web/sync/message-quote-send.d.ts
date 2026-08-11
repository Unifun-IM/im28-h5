import type { GatewayClientMessageBody, Message } from '@im28/im-sdk/core';
import { type WebIMMessageSendDependencies } from './message-send-state.js';
import { type WebIMSyncContext } from './sync-context.js';
/** 引用发送参数保留真实来源消息与可选 optimistic 通知。 */
export interface WebIMSendQuoteMessageOptions {
    readonly conversationID: string;
    readonly text: string;
    readonly sourceMessage: Message;
    readonly onSending?: (message: Message) => void;
}
/** 使用 RN type114 契约发送引用消息并持久化完整可重放 body。 */
export declare function sendWebIMQuoteMessage(context: WebIMSyncContext, options: WebIMSendQuoteMessageOptions, dependencies: WebIMMessageSendDependencies): Promise<Message>;
/** 从来源消息构造唯一合法的 Gateway quote body。 */
export declare function createWebIMQuoteBody(sourceMessage: Message, replyText: string): Extract<GatewayClientMessageBody, {
    readonly quote: unknown;
}>;
/** 严格恢复持久化 quote body，供 failed retry 复用。 */
export declare function normalizeWebIMQuoteBody(payload: unknown): Extract<GatewayClientMessageBody, {
    readonly quote: unknown;
}>;
//# sourceMappingURL=message-quote-send.d.ts.map