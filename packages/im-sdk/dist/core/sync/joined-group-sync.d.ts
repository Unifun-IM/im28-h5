import { type IMGroupCreationOptions, type IMGroupCreationResult } from './group-creation.js';
import { type GatewayHTTPClient, type Message } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from './sync-context.js';
import type { WebIMSyncMutationQueueDependencies } from './sync-mutation-queue.js';
import type { IMMediaUploadInput, IMMediaUploadPort } from './message-media-send.js';
import type { WebIMMessageSendDependencies } from './message-send-state.js';
import { type IMGroupAnnouncementReadStatus } from './group-announcement.js';
import type { IMGroupManagementPermissions } from './group-management-permissions.js';
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
    readonly announcement: string;
    readonly announcementVersion: string;
    readonly memberCount: number;
    readonly ownerUserID: string;
    readonly currentUserRole: WebIMJoinedGroupRole;
    readonly joinApprovalRequired?: boolean;
    readonly allowMemberInvite?: boolean;
    readonly allowMemberAddFriend?: boolean;
    readonly allowMemberNickname?: boolean;
    readonly muteAll?: boolean;
    readonly muteMember?: boolean;
    readonly speechFrequencyEnabled?: boolean;
    readonly speechFrequencySeconds?: number;
    readonly permissions: IMGroupManagementPermissions;
    readonly canEditAnnouncement: boolean;
    readonly canMentionAll: boolean;
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
    updateName(groupID: string, name: string): Promise<WebIMJoinedGroup>;
    updateAvatar(groupID: string, input: IMMediaUploadInput): Promise<WebIMJoinedGroup>;
    updateIntroduction(groupID: string, introduction: string): Promise<WebIMJoinedGroup>;
    publishAnnouncement(options: IMPublishWebIMGroupAnnouncementOptions): Promise<IMPublishWebIMGroupAnnouncementResult>;
    getAnnouncementReadStatus(groupID: string): Promise<IMGroupAnnouncementReadStatus>;
    markAnnouncementRead(groupID: string, announcementVersion: string): Promise<IMGroupAnnouncementReadStatus>;
    create(options: IMGroupCreationOptions): Promise<IMGroupCreationResult>;
}
/** Web 群公告发布参数绑定当前群与缓存会话。 */
export interface IMPublishWebIMGroupAnnouncementOptions {
    readonly groupID: string;
    readonly conversationID: string;
    readonly announcement: string;
}
/** Web 群公告发布结果复用标准群和消息模型。 */
export interface IMPublishWebIMGroupAnnouncementResult {
    readonly group: WebIMJoinedGroup;
    readonly message: Message;
}
/** 群列表能力复用 runtime 的 Gateway、账号库和共享写队列。 */
export interface WebIMJoinedGroupSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies, WebIMMessageSendDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly mediaUploadPort?: IMMediaUploadPort;
}
/** 创建当前账号绑定的我的群聊 facade。 */
export declare function createWebIMJoinedGroupSync(dependencies: WebIMJoinedGroupSyncDependencies): WebIMJoinedGroupSync;
//# sourceMappingURL=joined-group-sync.d.ts.map