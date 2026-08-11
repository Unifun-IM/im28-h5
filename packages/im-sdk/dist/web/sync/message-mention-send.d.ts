import { type Message, type MessageMention, type PresetEmojiEntity } from '@im28/im-sdk/core';
import { type WebIMMessageSendDependencies } from './message-send-state.js';
import { type WebIMSyncContext } from './sync-context.js';
/** 群聊提及发送参数只包含稳定目标和正文，不接收页面构造的 Gateway body。 */
export interface WebIMSendMentionMessageOptions {
    readonly conversationID: string;
    readonly text: string;
    readonly mentions: readonly MessageMention[];
    readonly entities?: readonly PresetEmojiEntity[];
}
/** 校验提及身份与正文后复用共享 optimistic send 状态机。 */
export declare function sendWebIMMentionMessage(context: WebIMSyncContext, options: WebIMSendMentionMessageOptions, dependencies: WebIMMessageSendDependencies): Promise<Message>;
//# sourceMappingURL=message-mention-send.d.ts.map