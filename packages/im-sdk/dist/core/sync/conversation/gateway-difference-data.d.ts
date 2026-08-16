import type { Conversation, GatewayConversation, GatewayConversationSyncState, GatewayGetConversationDifferenceData, User } from '@im28/im-sdk/core';
/** 单个会话在账号分页提交前已完成网络读取的原子落库包。 */
export interface ConversationDifferenceBundle {
    readonly conversationID: string;
    readonly accountState: GatewayConversationSyncState;
    readonly removed: boolean;
    readonly conversation?: GatewayConversation;
    readonly differences: readonly GatewayGetConversationDifferenceData[];
}
/** 按会话保留账号页最高 pts 状态，并拒绝无效账号更新。 */
export declare function deduplicateGatewayDifferenceStates(updates: readonly {
    readonly type: 'conversation_state';
    readonly pts: string;
    readonly state: GatewayConversationSyncState;
}[]): readonly GatewayConversationSyncState[];
/** 把账号级游标状态覆盖到详情映射，同时保留详情拥有的资料字段。 */
export declare function mergeGatewayDifferenceConversationState(conversation: Conversation, state: GatewayConversationSyncState): Conversation;
/** 将 Gateway user DTO 映射为共享最小用户资料并按 userID 去重。 */
export declare function mapGatewayDifferenceUsers(gatewayUsers: readonly {
    readonly user_id?: string;
    readonly nickname?: string;
    readonly avatar_url?: string;
}[]): readonly User[];
/** 校验会话 Difference 双游标存在、单调且有分页进展。 */
export declare function assertGatewayConversationDifferenceState(difference: GatewayGetConversationDifferenceData, conversationID: string, previousPTS: string, previousQTS: string): void;
//# sourceMappingURL=gateway-difference-data.d.ts.map