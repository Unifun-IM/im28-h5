import { type GatewayHTTPClient } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from './sync-context.js';
import type { WebIMSyncMutationQueueDependencies } from './sync-mutation-queue.js';
/** 页面可消费的群成员角色。 */
export type WebIMGroupMemberRole = 'owner' | 'admin' | 'member';
/** 页面可消费的群成员快照。 */
export interface WebIMGroupMember {
    readonly groupID: string;
    readonly userID: string;
    readonly remark?: string;
    readonly groupNickname?: string;
    readonly nickname: string;
    readonly avatarURL: string;
    readonly role: WebIMGroupMemberRole;
    readonly roleLevel: number;
    readonly isMuted?: boolean;
    readonly muteUntil?: string;
}
/** 群成员全量同步参数。 */
export interface WebIMGroupMemberSyncOptions {
    readonly pageSize?: number;
}
/** 群成员 cache-first facade。 */
export interface WebIMGroupMemberSync {
    listCached(groupID: string): Promise<readonly WebIMGroupMember[]>;
    sync(groupID: string, options?: WebIMGroupMemberSyncOptions): Promise<readonly WebIMGroupMember[]>;
    updateSelfNickname(groupID: string, nickname: string): Promise<WebIMGroupMember>;
}
/** 群成员同步复用账号库、Gateway 和共享 mutation queue。 */
export interface WebIMGroupMemberSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
}
/** 创建当前账号绑定的群成员同步 facade。 */
export declare function createWebIMGroupMemberSync(dependencies: WebIMGroupMemberSyncDependencies): WebIMGroupMemberSync;
//# sourceMappingURL=group-member-sync.d.ts.map