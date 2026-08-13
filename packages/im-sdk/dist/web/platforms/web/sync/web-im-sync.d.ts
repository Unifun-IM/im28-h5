import type { GatewayHTTPClient } from '@im28/im-sdk/core';
import { type WebIMCallSync } from '../../../sync/call-sync.js';
import { type WebIMCustomEmojiSync } from '../../../sync/custom-emoji-sync.js';
import { type WebIMBlacklistSync } from '../../../sync/blacklist-sync.js';
import { type WebIMFriendApplicationSync } from '../../../sync/friend-application-sync.js';
import { type WebIMGroupApplicationSync } from '../../../sync/group-application-sync.js';
import { type WebIMJoinedGroupSync } from '../../../sync/joined-group-sync.js';
import { type IMGroupMentionSync } from '../../../sync/group-mention.js';
import { type WebIMPeerProfileSync } from '../../../sync/peer-profile-sync.js';
import { type WebIMConversationSync } from '../../../sync/conversation-sync.js';
import { type WebIMMessageSync } from '../../../sync/message-sync.js';
import { type IMMessageBroadcastSync } from '../../../sync/message-broadcast.js';
import { type WebIMRealtimeSync } from '../../../sync/realtime-sync.js';
import type { WebIMSyncContextDependencies } from '../../../sync/sync-context.js';
import type { IMMediaUploadPort } from '../../../sync/message-media-send.js';
import { type WebIMContactSync } from '../../../sync/contact-sync.js';
import { type WebIMProfileSync } from '../../../sync/profile-sync.js';
import { type IMGroupManagementSync } from '../../../sync/group-settings-mute.js';
import { type IMGroupLifecycleSync } from '../../../sync/group-lifecycle.js';
/** Runtime 对页面公开的聚合数据同步入口。 */
export interface WebIMSync {
    readonly blacklist: WebIMBlacklistSync;
    readonly calls: WebIMCallSync;
    readonly contacts: WebIMContactSync;
    readonly conversations: WebIMConversationSync;
    readonly customEmojis: WebIMCustomEmojiSync;
    readonly friendApplications: WebIMFriendApplicationSync;
    readonly groupApplications: WebIMGroupApplicationSync;
    readonly groups: WebIMJoinedGroupSync;
    readonly groupMentions: IMGroupMentionSync;
    readonly groupManagement: IMGroupManagementSync;
    /** 群生命周期只通过 shared exactly-once facade 对外。 */
    readonly groupLifecycle: IMGroupLifecycleSync;
    /** 兼容非 mention 群成员页面；实现委托同一 neutral facade。 */
    readonly groupMembers: {
        listCached(groupID: string): ReturnType<IMGroupMentionSync['listMembers']>;
        sync(groupID: string, options?: Parameters<IMGroupMentionSync['syncMembers']>[1]): ReturnType<IMGroupMentionSync['syncMembers']>;
        updateSelfNickname(groupID: string, nickname: string): ReturnType<IMGroupMentionSync['updateSelfNickname']>;
        inviteMembers(options: Parameters<IMGroupMentionSync['inviteMembers']>[0]): ReturnType<IMGroupMentionSync['inviteMembers']>;
        removeMembers(options: Parameters<IMGroupMentionSync['removeMembers']>[0]): ReturnType<IMGroupMentionSync['removeMembers']>;
        setAdmins(options: Parameters<IMGroupMentionSync['setAdmins']>[0]): ReturnType<IMGroupMentionSync['setAdmins']>;
        cancelAdmins(options: Parameters<IMGroupMentionSync['cancelAdmins']>[0]): ReturnType<IMGroupMentionSync['cancelAdmins']>;
        transferOwner(options: Parameters<IMGroupMentionSync['transferOwner']>[0]): ReturnType<IMGroupMentionSync['transferOwner']>;
    };
    readonly messages: WebIMMessageSync;
    /** 文本群发使用 shared batch-send 与逐目标收敛 owner。 */
    readonly messageBroadcast: IMMessageBroadcastSync;
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