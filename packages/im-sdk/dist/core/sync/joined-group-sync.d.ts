import { type GatewayHTTPClient } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from './sync-context.js';
import type { WebIMSyncMutationQueueDependencies } from './sync-mutation-queue.js';
/** 页面消费的当前用户群角色。 */
export type WebIMJoinedGroupRole = 'owner' | 'admin' | 'member';
/** 页面消费的群状态，未知服务端值保持显式 unknown。 */
export type WebIMJoinedGroupStatus = 'active' | 'banned' | 'dismissed' | 'muted' | 'unknown';
/** 页面可消费的标准化“我的群聊”记录。 */
export interface WebIMJoinedGroup {
    readonly groupID: string;
    readonly conversationID: string;
    readonly name: string;
    readonly avatarURL: string;
    readonly introduction: string;
    readonly memberCount: number;
    readonly ownerUserID: string;
    readonly currentUserRole: WebIMJoinedGroupRole;
    readonly isCreatedByCurrentUser: boolean;
    readonly status: WebIMJoinedGroupStatus;
}
/** 我的群聊远端分页参数。 */
export interface WebIMJoinedGroupSyncOptions {
    readonly pageSize?: number;
}
/** 页面可消费的 cache-first 我的群聊能力。 */
export interface WebIMJoinedGroupSync {
    listCached(): Promise<readonly WebIMJoinedGroup[]>;
    sync(options?: WebIMJoinedGroupSyncOptions): Promise<readonly WebIMJoinedGroup[]>;
}
/** 群列表能力复用 runtime 的 Gateway、账号库和共享写队列。 */
export interface WebIMJoinedGroupSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
}
/** 创建当前账号绑定的我的群聊 facade。 */
export declare function createWebIMJoinedGroupSync(dependencies: WebIMJoinedGroupSyncDependencies): WebIMJoinedGroupSync;
//# sourceMappingURL=joined-group-sync.d.ts.map