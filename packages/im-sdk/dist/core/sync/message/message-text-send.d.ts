import { type Message, type PresetEmojiEntity } from '@im28/im-sdk/core';
import { type WebIMMessageSendDependencies } from './message-send-state.js';
import { type WebIMSyncContext } from '../sync-context.js';
/** 文本发送参数由 service 生成稳定 client message ID。 */
export interface WebIMSendTextMessageOptions {
    readonly conversationID: string;
    readonly text: string;
    readonly entities?: readonly PresetEmojiEntity[];
    readonly onSending?: (message: Message) => void;
}
/** 校验文本并复用通用 optimistic send 状态机。 */
export declare function sendWebIMTextMessage(context: WebIMSyncContext, options: WebIMSendTextMessageOptions, dependencies: WebIMMessageSendDependencies): Promise<Message>;
//# sourceMappingURL=message-text-send.d.ts.map