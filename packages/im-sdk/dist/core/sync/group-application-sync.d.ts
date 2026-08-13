import type { GatewayHTTPClient } from '@im28/im-sdk/core';
/** 页面消费的群申请类型。 */
export type WebIMGroupApplicationType = 'apply' | 'invite';
/** 页面消费的标准化群申请审核记录。 */
export interface WebIMGroupApplication {
    readonly applicationID: string;
    readonly groupID: string;
    readonly groupName: string;
    readonly groupAvatarURL: string;
    readonly ownerUserID: string;
    readonly requesterUserID: string;
    readonly requesterName: string;
    readonly requesterAvatarURL: string;
    readonly inviterUserID: string;
    readonly type: WebIMGroupApplicationType;
    readonly sourceType: string;
    readonly message: string;
    readonly status: string;
    readonly createdAt: string;
    readonly handledAt: string;
}
/** 群申请审核分页参数。 */
export interface WebIMGroupApplicationListOptions {
    readonly pageSize?: number;
}
/** 扫码入群页消费的公开群资料。 */
export interface WebIMPublicGroup {
    readonly groupID: string;
    readonly title: string;
    readonly avatarURL: string;
    readonly description: string;
    readonly memberCount: number;
    readonly joinApprovalRequired: boolean;
    readonly membershipStatus: 'none' | 'active' | 'left' | 'removed' | 'banned';
    readonly applicationStatus: string;
}
/** 提交扫码入群申请的稳定参数。 */
export interface WebIMApplyGroupOptions {
    readonly groupID: string;
    readonly message?: string;
    readonly sourceType?: string;
}
/** 群搜索结果的稳定关系状态。 */
export type WebIMGroupSearchStatus = 'joined' | 'pending' | 'available';
/** 发起群聊页消费的公开群搜索结果。 */
export interface WebIMGroupSearchItem {
    readonly groupID: string;
    readonly title: string;
    readonly avatarURL: string;
    readonly description: string;
    readonly memberCount: number;
    readonly joinApprovalRequired: boolean;
    readonly status: WebIMGroupSearchStatus;
    readonly conversationID: string;
    readonly sourceType: string;
}
/** 已加入群最小投影只提供搜索状态和真实会话路由。 */
export interface WebIMGroupSearchJoinedItem {
    readonly groupID: string;
    readonly conversationID: string;
}
/** 页面可消费的群申请审核能力。 */
export interface WebIMGroupApplicationSync {
    list(options?: WebIMGroupApplicationListOptions): Promise<readonly WebIMGroupApplication[]>;
    getUnreadCount(): Promise<number>;
    accept(applicationID: string): Promise<void>;
    reject(applicationID: string): Promise<void>;
    getPublicGroup(groupID: string): Promise<WebIMPublicGroup>;
    search(keyword: string): Promise<readonly WebIMGroupSearchItem[]>;
    apply(options: WebIMApplyGroupOptions): Promise<void>;
}
/** 群申请 facade 复用 shared Gateway 和动态认证 owner。 */
export interface WebIMGroupApplicationSyncDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly getCurrentUserID: () => string | null;
    /** 生产组合注入 canonical 已加入群列表，避免页面复制关系判断。 */
    readonly listJoinedGroups?: () => Promise<readonly WebIMGroupSearchJoinedItem[]>;
}
/** 创建群申请 Web facade。 */
export declare function createWebIMGroupApplicationSync(dependencies: WebIMGroupApplicationSyncDependencies): WebIMGroupApplicationSync;
//# sourceMappingURL=group-application-sync.d.ts.map