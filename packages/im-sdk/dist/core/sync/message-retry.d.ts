import { serializePresetEmojiEntities, type GatewayClientMessageBody, type Message } from '@im28/im-sdk/core';
import { type WebIMMessageSendDependencies } from './message-send-state.js';
import { type WebIMSyncContext } from './sync-context.js';
/** 当前可由持久化 payload 完整恢复的消息类型。 */
export declare const WEB_IM_RETRYABLE_CONTENT_TYPES: readonly [101, 114, 108, 102, 103, 104, 105, 115];
/** 单条失败消息重试参数只暴露稳定本地 ID 与 sending 通知。 */
export interface WebIMRetryMessageOptions {
    readonly clientMsgID: string;
    readonly onSending?: (message: Message) => void;
}
/** SDK 对 UI 公开的重试能力判断，防止应用复制支持矩阵。 */
export declare function canRetryWebIMMessage(message: Message): boolean;
/** 从当前账号 SQLite 恢复请求并重试同一条失败消息。 */
export declare function retryWebIMMessage(context: WebIMSyncContext, options: WebIMRetryMessageOptions, dependencies: WebIMMessageSendDependencies): Promise<Message>;
/** 恢复后交给通用发送状态机的 Gateway 参数。 */
export interface WebIMPersistedMessageRequest {
    readonly body: GatewayClientMessageBody;
    readonly entities?: ReturnType<typeof serializePresetEmojiEntities>;
}
/** 从受支持消息的持久化 payload 重建精确 Gateway body。 */
export declare function buildWebIMPersistedMessageRequest(message: Message): WebIMPersistedMessageRequest;
//# sourceMappingURL=message-retry.d.ts.map