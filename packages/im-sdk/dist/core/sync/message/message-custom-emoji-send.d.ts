import { type Message } from '@im28/im-sdk/core';
import { type WebIMMessageSendDependencies } from './message-send-state.js';
import type { WebIMSyncContext } from '../sync-context.js';
/** type 115 自定义表情发送参数包含稳定 ID 与本地展示快照。 */
export interface WebIMSendCustomEmojiMessageOptions {
    readonly conversationID: string;
    readonly emojiID: string;
    readonly url: string;
}
/** 使用共享 optimistic 状态机发送自定义表情并保留 URL 快照。 */
export declare function sendWebIMCustomEmojiMessage(context: WebIMSyncContext, options: WebIMSendCustomEmojiMessageOptions, dependencies: WebIMMessageSendDependencies): Promise<Message>;
//# sourceMappingURL=message-custom-emoji-send.d.ts.map