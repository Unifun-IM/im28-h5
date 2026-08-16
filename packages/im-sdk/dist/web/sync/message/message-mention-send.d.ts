import { type Message, type MessageMention, type PresetEmojiEntity } from '@im28/im-sdk/core';
import { type WebIMMessageSendDependencies } from './message-send-state.js';
import { type WebIMSyncContext } from '../sync-context.js';
/** 群聊提及发送参数只包含稳定目标和正文，不接收页面构造的 Gateway body。 */
export interface WebIMSendMentionMessageOptions {
    readonly conversationID: string;
    /** 平台预创建 optimistic 消息时复用其稳定身份。 */
    readonly clientMsgID?: string;
    readonly text: string;
    readonly mentions: readonly MessageMention[];
    readonly entities?: readonly PresetEmojiEntity[];
    /** 平台层只接收已落库的 sending 快照，不参与状态机。 */
    readonly onSending?: (message: Message) => void;
    /** 平台可显式保留有限次幂等发送重试。 */
    readonly maxAttempts?: number;
    /** 重试等待由平台注入，避免共享逻辑依赖运行时计时器。 */
    readonly waitBeforeRetry?: (attempt: number) => Promise<void>;
}
/** 校验提及身份与正文后复用共享 optimistic send 状态机。 */
export declare function sendWebIMMentionMessage(context: WebIMSyncContext, options: WebIMSendMentionMessageOptions, dependencies: WebIMMessageSendDependencies): Promise<Message>;
//# sourceMappingURL=message-mention-send.d.ts.map