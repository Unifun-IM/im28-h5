import type { GatewayHTTPClient } from '@im28/im-sdk/core';
import { type WebIMCallSync } from '../../../sync/call/index.js';
import { type WebIMCustomEmojiSync } from '../../../sync/message/index.js';
import { type WebIMBlacklistSync, type WebIMContactSync, type IMDirectChatRelationshipSync, type WebIMFriendApplicationSync, type WebIMPeerProfileSync } from '../../../sync/contact/index.js';
import { type IMGroupLifecycleSync, type IMGroupManagementSync, type IMGroupMentionSync, type WebIMGroupApplicationSync, type WebIMJoinedGroupSync } from '../../../sync/group/index.js';
import { type IMUserPresenceSync, type WebIMProfileSync } from '../../../sync/account/index.js';
import { type WebIMConversationSync } from '../../../sync/conversation/index.js';
import { type WebIMMessageSync } from '../../../sync/message/index.js';
import { type IMMessageBroadcastSync } from '../../../sync/message/index.js';
import { type WebIMRealtimeSync } from '../../../sync/realtime/index.js';
import type { IMSyncContextDependencies } from '../../../sync/sync-context.js';
import type { IMMediaUploadPort } from '../../../sync/message/index.js';
/** Runtime 对页面公开的聚合数据同步入口。 */
export interface WebIMSync {
    readonly blacklist: WebIMBlacklistSync;
    /** 单聊关系只组合资料和我方黑名单的真实读取。 */
    readonly directChatRelationship: IMDirectChatRelationshipSync;
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
    /** Presence 只持有当前 runtime 内存订阅，不写账号数据库。 */
    readonly presence: IMUserPresenceSync;
    readonly profile: WebIMProfileSync;
    readonly realtime: WebIMRealtimeSync;
}
/** 聚合入口依赖复用同一 Gateway、account DB 与 auth owner。 */
export interface WebIMSyncDependencies extends IMSyncContextDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly mediaUploadPort?: IMMediaUploadPort;
    readonly createClientMessageID?: () => string;
    readonly now?: () => number;
    /** Runtime reporter 隔离页面 listener 异常，避免中断后续 realtime 分发。 */
    readonly reportBackgroundError?: (cause: unknown) => void;
}
/** 创建联系人、会话与消息共享认证上下文的同步 facade。 */
export declare function createWebIMSync(dependencies: WebIMSyncDependencies): WebIMSync;
//# sourceMappingURL=web-im-sync.d.ts.map