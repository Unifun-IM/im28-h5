import { type GatewayHTTPClient } from '@im28/im-sdk/core';
import type { WebIMSyncContextDependencies } from './sync-context.js';
import { type IMContactActionsSync } from './contact-actions.js';
import type { WebIMSyncMutationQueueDependencies } from './sync-mutation-queue.js';
/** 页面可消费的标准化好友记录。 */
export interface WebIMContact {
    readonly userID: string;
    readonly displayName: string;
    readonly nickname: string;
    readonly remark: string;
    readonly account: string;
    readonly phone: string;
    readonly email: string;
    readonly avatarURL: string;
    readonly isStarred: boolean;
    readonly addedAt: string;
}
/** 通讯录远端分页参数。 */
export interface WebIMContactListOptions {
    readonly pageSize?: number;
}
/** 页面可消费的标准化联系人搜索用户。 */
export interface WebIMContactSearchUser {
    readonly userID: string;
    readonly displayName: string;
    readonly nickname: string;
    readonly account: string;
    readonly phone: string;
    readonly email: string;
    readonly avatarURL: string;
    readonly gender: 0 | 1 | 2;
    readonly bio: string;
}
/** 页面可消费的认证通讯录能力。 */
export interface WebIMContactSync extends IMContactActionsSync {
    listCached(): Promise<readonly WebIMContact[]>;
    list(options?: WebIMContactListOptions): Promise<readonly WebIMContact[]>;
    searchUsers(keyword: string): Promise<readonly WebIMContactSearchUser[]>;
}
/** 通讯录能力只依赖 runtime 已持有的 Gateway 与认证 owner。 */
export interface WebIMContactSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
}
/** 创建只通过共享 Gateway client 读取好友列表的 Web facade。 */
export declare function createWebIMContactSync(dependencies: WebIMContactSyncDependencies): WebIMContactSync;
//# sourceMappingURL=contact-sync.d.ts.map