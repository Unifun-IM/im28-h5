import { ConversationRepository, MessageRepository, type GatewayClientMessageBody, type GatewayHTTPClient, type GatewayPresetEmojiEntity, type Message, type PresetEmojiEntity } from '@im28/im-sdk/core';
import { type WebIMSyncContext } from './sync-context.js';
/** 单条 outgoing message 的稳定内容和本地投影。 */
export interface WebIMMessageSendDefinition {
    readonly conversationID: string;
    readonly contentType: number;
    readonly payload: unknown;
    readonly entities?: readonly PresetEmojiEntity[];
}
/** optimistic message 状态机所需的共享依赖。 */
export interface WebIMMessageSendDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly createClientMessageID?: () => string;
    readonly now?: () => number;
}
/** 已校验会话并完成本地 sending 写入的上下文。 */
export interface PreparedWebIMMessageSend {
    readonly context: WebIMSyncContext;
    readonly conversationID: string;
    readonly clientMsgID: string;
    readonly localMessage: Message;
    readonly conversationRepository: ConversationRepository;
    readonly messageRepository: MessageRepository;
}
/** 校验会话并将 outgoing message 以 sending 状态写入账号 SQLite。 */
export declare function prepareWebIMMessageSend(context: WebIMSyncContext, definition: WebIMMessageSendDefinition, dependencies: WebIMMessageSendDependencies): Promise<PreparedWebIMMessageSend>;
/** 在 Gateway 调用前把可重放 body 持久化到同一 optimistic row。 */
export declare function checkpointWebIMMessageSendBody(prepared: PreparedWebIMMessageSend, body: GatewayClientMessageBody): Promise<PreparedWebIMMessageSend>;
/** 调用 Gateway 并将同一 optimistic row 收敛为 sent。 */
export declare function completeWebIMMessageSend(prepared: PreparedWebIMMessageSend, body: GatewayClientMessageBody, dependencies: WebIMMessageSendDependencies, entities?: readonly GatewayPresetEmojiEntity[]): Promise<Message>;
/** 将远端任一步失败持久化到同一 optimistic row。 */
export declare function failWebIMMessageSend(prepared: PreparedWebIMMessageSend, cause: unknown): Promise<never>;
/** 为无需平台上传的 body 执行完整 optimistic send 状态机。 */
export declare function executeWebIMMessageSend(context: WebIMSyncContext, definition: WebIMMessageSendDefinition, body: GatewayClientMessageBody, dependencies: WebIMMessageSendDependencies, entities?: readonly GatewayPresetEmojiEntity[]): Promise<Message>;
/** 创建并校验本地消息幂等 ID。 */
export declare function createWebIMClientMessageID(dependencies: WebIMMessageSendDependencies): string;
//# sourceMappingURL=message-send-state.d.ts.map