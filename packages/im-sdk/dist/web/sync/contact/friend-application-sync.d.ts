import type { GatewayHTTPClient } from '@im28/im-sdk/core';
/** 页面消费的好友申请方向。 */
export type WebIMFriendApplicationDirection = 'incoming' | 'outgoing';
/** 页面消费的标准化好友申请。 */
export interface WebIMFriendApplication {
    readonly applicationID: string;
    readonly requesterID: string;
    readonly targetID: string;
    readonly direction: WebIMFriendApplicationDirection;
    readonly userID: string;
    readonly displayName: string;
    readonly avatarURL: string;
    readonly message: string;
    readonly sourceType: string;
    readonly status: string;
    readonly isRead: boolean;
    readonly createdAt: string;
    readonly handledAt: string;
}
/** 好友申请分页参数。 */
export interface WebIMFriendApplicationListOptions {
    readonly pageSize?: number;
}
/** 页面可消费的认证好友申请能力。 */
export interface WebIMFriendApplicationSync {
    list(options?: WebIMFriendApplicationListOptions): Promise<readonly WebIMFriendApplication[]>;
    getUnreadCount(): Promise<number>;
    markRead(applicationIDs: readonly string[]): Promise<void>;
    accept(applicationID: string): Promise<void>;
}
/** 好友申请 facade 只复用 shared Gateway 和动态认证 owner。 */
export interface WebIMFriendApplicationSyncDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly getCurrentUserID: () => string | null;
}
/** 创建好友申请跨端 facade。 */
export declare function createIMFriendApplicationSync(dependencies: IMFriendApplicationSyncDependencies): IMFriendApplicationSync;
/** 平台中立的好友申请同步契约。 */
export type IMFriendApplicationSync = WebIMFriendApplicationSync;
/** 平台中立的好友申请同步依赖。 */
export type IMFriendApplicationSyncDependencies = WebIMFriendApplicationSyncDependencies;
/** 兼容已发布的 Web 命名；实现与 createIMFriendApplicationSync 相同。 */
export declare const createWebIMFriendApplicationSync: typeof createIMFriendApplicationSync;
//# sourceMappingURL=friend-application-sync.d.ts.map