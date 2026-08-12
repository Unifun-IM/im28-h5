/** 单聊对端身份解析输入，平台层只负责提取候选字段。 */
export interface ResolveDirectConversationPeerUserIDInput {
    readonly currentUserID: string;
    readonly conversationID: string;
    readonly existingUserID?: string;
    readonly explicitPeerUserID?: string;
    readonly conversationUserID?: string;
    readonly messageSenderID?: string;
    readonly messageReceiverID?: string;
    readonly systemRelatedUserIDs?: readonly string[];
}
/** 按消息关系、明确对端、会话快照和 ID 依次解析单聊对端。 */
export declare function resolveDirectConversationPeerUserID(input: ResolveDirectConversationPeerUserIDInput): string;
//# sourceMappingURL=direct-conversation-peer.d.ts.map