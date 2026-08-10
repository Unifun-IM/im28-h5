import type { Conversation, Message } from '../../core/types.js';
import type { GatewayConversation, GatewayMessage } from './types.js';
/** 消息映射参数提供当前账号和会话字段回退。 */
export interface GatewayMessageMappingOptions {
    readonly currentUserID: string;
    readonly conversationID?: string;
}
/** 会话映射结果同时携带可独立持久化的最新消息。 */
export interface GatewayConversationMappingResult {
    readonly conversation: Conversation;
    readonly latestMessage?: Message;
}
/** 将 Gateway message 映射为跨平台 core message。 */
export declare function mapGatewayMessageToCore(message: GatewayMessage, options: GatewayMessageMappingOptions): Message;
/** 将 Gateway conversation 与 latest message 映射为 core entities。 */
export declare function mapGatewayConversationToCore(input: GatewayConversation, currentUserID: string): GatewayConversationMappingResult;
//# sourceMappingURL=domain-mappers.d.ts.map