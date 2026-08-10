import type { GatewayHTTPClient } from '@im28/im-sdk/core';
import { type WebIMCallSync } from './call-sync.js';
import { type WebIMBlacklistSync } from './blacklist-sync.js';
import { type WebIMFriendApplicationSync } from './friend-application-sync.js';
import { type WebIMGroupApplicationSync } from './group-application-sync.js';
import { type WebIMJoinedGroupSync } from './joined-group-sync.js';
import { type WebIMPeerProfileSync } from './peer-profile-sync.js';
import { type WebIMConversationSync } from './conversation-sync.js';
import { type WebIMMessageSync } from './message-sync.js';
import { type WebIMRealtimeSync } from './realtime-sync.js';
import type { WebIMSyncContextDependencies } from './sync-context.js';
import type { IMMediaUploadPort } from './message-media-send.js';
import { type WebIMContactSync } from './contact-sync.js';
import { type WebIMProfileSync } from './profile-sync.js';
/** Runtime 对页面公开的聚合数据同步入口。 */
export interface WebIMSync {
    readonly blacklist: WebIMBlacklistSync;
    readonly calls: WebIMCallSync;
    readonly contacts: WebIMContactSync;
    readonly conversations: WebIMConversationSync;
    readonly friendApplications: WebIMFriendApplicationSync;
    readonly groupApplications: WebIMGroupApplicationSync;
    readonly groups: WebIMJoinedGroupSync;
    readonly messages: WebIMMessageSync;
    readonly peerProfile: WebIMPeerProfileSync;
    readonly profile: WebIMProfileSync;
    readonly realtime: WebIMRealtimeSync;
}
/** 聚合入口依赖复用同一 Gateway、account DB 与 auth owner。 */
export interface WebIMSyncDependencies extends WebIMSyncContextDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly mediaUploadPort?: IMMediaUploadPort;
    readonly createClientMessageID?: () => string;
    readonly now?: () => number;
}
/** 创建联系人、会话与消息共享认证上下文的同步 facade。 */
export declare function createWebIMSync(dependencies: WebIMSyncDependencies): WebIMSync;
//# sourceMappingURL=web-im-sync.d.ts.map