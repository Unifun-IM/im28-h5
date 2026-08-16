import { type GatewayHTTPClient, type Message, type PresetEmojiEntity } from '@im28/im-sdk/core';
import { type WebIMMessageSendDependencies } from './message-send-state.js';
import { type WebIMSyncContext } from '../sync-context.js';
/** 文本编辑入口只接收当前账号缓存身份和最终文档。 */
export interface WebIMEditTextMessageOptions {
    readonly conversationID: string;
    readonly clientMsgID: string;
    readonly text: string;
    readonly entities?: readonly PresetEmojiEntity[];
}
/** 主动编辑复用 Gateway transport 与稳定操作 ID 生成器。 */
export interface WebIMEditTextMessageDependencies extends WebIMMessageSendDependencies {
    readonly gatewayClient: GatewayHTTPClient;
}
/** 判断缓存消息是否具备 RN 对齐的文本编辑资格。 */
export declare function canEditWebIMTextMessage(message: Message): boolean;
/** 从当前账号缓存重读目标，成功后更新同一 SQLite 消息行。 */
export declare function editWebIMTextMessage(context: WebIMSyncContext, options: WebIMEditTextMessageOptions, dependencies: WebIMEditTextMessageDependencies): Promise<Message>;
//# sourceMappingURL=message-edit.d.ts.map