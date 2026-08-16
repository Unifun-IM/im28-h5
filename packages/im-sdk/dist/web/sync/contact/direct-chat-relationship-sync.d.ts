import { type IMDirectChatPeerRelationship, type IMDirectChatRelationshipPresentation } from '@im28/im-sdk/core';
/** 单聊页面可消费的关系读取 facade。 */
export interface IMDirectChatRelationshipSync {
    get(userID: string): Promise<IMDirectChatRelationshipPresentation>;
}
/** 单聊关系 facade 只组合既有资料与黑名单真实 owner。 */
export interface IMDirectChatRelationshipSyncDependencies {
    readonly getPeerRelationship: (userID: string) => Promise<IMDirectChatPeerRelationship>;
    readonly isBlockedByMe: (userID: string) => Promise<boolean>;
}
/** 创建不直接访问 Gateway 或数据库的单聊关系组合 facade。 */
export declare function createIMDirectChatRelationshipSync(dependencies: IMDirectChatRelationshipSyncDependencies): IMDirectChatRelationshipSync;
//# sourceMappingURL=direct-chat-relationship-sync.d.ts.map