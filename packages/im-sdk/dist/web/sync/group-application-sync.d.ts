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
/** 页面可消费的群申请审核能力。 */
export interface WebIMGroupApplicationSync {
    list(options?: WebIMGroupApplicationListOptions): Promise<readonly WebIMGroupApplication[]>;
    accept(applicationID: string): Promise<void>;
    reject(applicationID: string): Promise<void>;
}
/** 群申请 facade 复用 shared Gateway 和动态认证 owner。 */
export interface WebIMGroupApplicationSyncDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly getCurrentUserID: () => string | null;
}
/** 创建群申请 Web facade。 */
export declare function createWebIMGroupApplicationSync(dependencies: WebIMGroupApplicationSyncDependencies): WebIMGroupApplicationSync;
//# sourceMappingURL=group-application-sync.d.ts.map