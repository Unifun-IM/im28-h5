import type { ConversationRepository, GatewayPresetEmojiEntity, Message, MessageRepository } from '@im28/im-sdk/core';
import type { WebIMPersistedMessageRequest } from './message-retry.js';
import type { WebIMSyncContext } from './sync-context.js';
/** 批量转发公开参数只接收缓存消息身份，不接收页面构造的消息 body。 */
export interface WebIMForwardMessagesOptions {
    readonly conversationID: string;
    readonly sourceClientMsgIDs: readonly string[];
    /** 平台已创建 optimistic 实体时，按来源顺序复用其稳定 client ID。 */
    readonly forwardClientMsgIDs?: readonly string[];
    readonly hideSenderName?: boolean;
    readonly comment?: string;
    /** 平台已创建附加评论实体时复用其稳定 client ID。 */
    readonly commentClientMsgID?: string;
    readonly onSending?: (messages: readonly Message[]) => void;
}
/** 单条转发结果保留来源身份、最终本地行和可见错误。 */
export interface WebIMForwardItemResult {
    readonly sourceClientMsgID: string;
    readonly message: Message;
    readonly error?: string;
}
/** 附加评论使用独立消息身份和成败结果。 */
export interface WebIMForwardCommentResult {
    readonly message: Message;
    readonly error?: string;
}
/** 批量转发结果要求调用方逐项检查，不提供模糊整批成功布尔值。 */
export interface WebIMForwardMessagesResult {
    readonly batchID: string;
    readonly list: readonly WebIMForwardItemResult[];
    readonly comment?: WebIMForwardCommentResult;
}
/** 多目标转发参数复用现有来源、发送人和附言语义。 */
export interface WebIMForwardMessagesToTargetsOptions {
    readonly conversationIDs: readonly string[];
    readonly sourceClientMsgIDs: readonly string[];
    readonly hideSenderName?: boolean;
    readonly comment?: string;
    readonly onSending?: (messages: readonly Message[]) => void;
}
/** 单个目标保留真实转发结果或可见失败，禁止整批伪成功。 */
export interface WebIMForwardTargetResult {
    readonly conversationID: string;
    readonly result?: WebIMForwardMessagesResult;
    readonly error?: string;
}
/** 多目标转发结果显式汇总目标级成功与失败。 */
export interface WebIMForwardMessagesToTargetsResult {
    readonly successCount: number;
    readonly failedCount: number;
    readonly targets: readonly WebIMForwardTargetResult[];
}
/** 已落库的单条 optimistic 转发上下文。 */
export interface PreparedWebIMForwardItem {
    readonly sourceMessage: Message;
    readonly localMessage: Message;
    readonly hiddenSenderRequest?: WebIMPersistedMessageRequest;
}
/** 已校验并完整落库的转发批次上下文。 */
export interface PreparedWebIMForwardBatch {
    readonly context: WebIMSyncContext;
    readonly batchID: string;
    readonly conversationID: string;
    readonly hideSenderName: boolean;
    readonly items: readonly PreparedWebIMForwardItem[];
    readonly commentMessage?: Message;
    readonly messageRepository: MessageRepository;
    readonly conversationRepository: ConversationRepository;
}
/** 隐藏发送者逐条请求可选携带预设表情实体。 */
export interface WebIMForwardSendRequest {
    readonly body: WebIMPersistedMessageRequest['body'];
    readonly entities?: readonly GatewayPresetEmojiEntity[];
}
//# sourceMappingURL=message-forward-types.d.ts.map