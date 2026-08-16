import { type Conversation, type GatewayHTTPClient } from '@im28/im-sdk/core';
import { type WebIMSyncContext, type WebIMSyncContextDependencies } from '../sync-context.js';
import { type WebIMSyncMutationQueueDependencies } from '../sync-mutation-queue.js';
/** 个人资料页可见的关系状态。 */
export type WebIMPeerProfileRelationship = 'self' | 'friend' | 'stranger';
/** 页面消费的标准化联系人资料。 */
export interface WebIMPeerProfile {
    readonly userID: string;
    readonly displayName: string;
    readonly nickname: string;
    readonly remark: string;
    readonly avatarURL: string;
    readonly gender: 0 | 1 | 2;
    readonly bio: string;
    readonly relationship: WebIMPeerProfileRelationship;
    readonly isStarred: boolean;
    readonly sourceType: string;
    readonly sourceLabel: string;
    readonly addedAt: string;
}
/** 页面可消费的联系人资料主链。 */
export interface WebIMPeerProfileSync {
    get(userID: string): Promise<WebIMPeerProfile>;
    openConversation(userID: string): Promise<Conversation>;
    applyFriend(userID: string, message?: string, sourceType?: string): Promise<void>;
}
/** 资料主链只依赖共享 Gateway、账号数据库和 mutation queue。 */
export interface WebIMPeerProfileSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
}
/** 创建联系人资料、单聊创建和好友申请 facade。 */
export declare function createIMPeerProfileSync(dependencies: IMPeerProfileSyncDependencies): IMPeerProfileSync;
/** 平台中立的联系人资料同步契约。 */
export type IMPeerProfileSync = WebIMPeerProfileSync;
/** 平台中立的联系人资料同步依赖。 */
export type IMPeerProfileSyncDependencies = WebIMPeerProfileSyncDependencies;
/** 兼容已发布的 Web 命名；实现与 createIMPeerProfileSync 相同。 */
export declare const createWebIMPeerProfileSync: typeof createIMPeerProfileSync;
/** 打开真实单聊并持久化共享映射，供资料页与联系人动作共同复用。 */
export declare function openAndCacheWebIMDirectConversation(context: WebIMSyncContext, peerUserID: string, gatewayClient: GatewayHTTPClient): Promise<Conversation>;
//# sourceMappingURL=peer-profile-sync.d.ts.map