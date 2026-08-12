import { type Message, type MessageMention, type PresetEmojiEntity } from '@im28/im-sdk/core';
import { type WebIMGroupMemberSyncDependencies, type WebIMGroupMemberSyncOptions } from './group-member-sync.js';
import { type IMGroupMemberInvitationCacheState, type IMGroupMemberInvitationMode, type IMInviteGroupMembersOptions } from './group-member-invitation.js';
import { type IMGroupMemberRemovalCacheState, type IMRemoveGroupMembersOptions } from './group-member-removal.js';
import type { WebIMMessageSendDependencies } from './message-send-state.js';
import { type WebIMSyncMutationQueueDependencies } from './sync-mutation-queue.js';
/** 跨 RN、Web、Desktop 的群提及成员快照。 */
export interface IMGroupMentionMember {
    readonly groupID: string;
    readonly userID: string;
    readonly remark?: string;
    readonly groupNickname?: string;
    readonly nickname: string;
    readonly avatarURL: string;
    readonly role: 'owner' | 'admin' | 'member';
    readonly roleLevel: number;
}
/** 群提及发送只接收稳定群、会话和用户身份。 */
export interface IMSendGroupMentionOptions {
    readonly groupID: string;
    readonly conversationID: string;
    readonly clientMsgID?: string;
    readonly text: string;
    readonly mentions: readonly MessageMention[];
    readonly entities?: readonly PresetEmojiEntity[];
    readonly maxAttempts?: number;
    readonly onSending?: (message: Message) => void;
    readonly waitBeforeRetry?: (attempt: number) => Promise<void>;
}
/** 群成员移除完成后返回可渲染成员和缓存收敛状态。 */
export interface IMRemoveGroupMembersResult {
    readonly groupID: string;
    readonly removedUserIDs: readonly string[];
    readonly members: readonly IMGroupMentionMember[];
    readonly memberCount: number;
    readonly cacheState: IMGroupMemberRemovalCacheState | 'authoritative';
}
/** 群成员邀请完成后返回分支、成员快照和缓存收敛状态。 */
export interface IMInviteGroupMembersResult {
    readonly groupID: string;
    readonly invitedUserIDs: readonly string[];
    readonly mode: IMGroupMemberInvitationMode;
    readonly members: readonly IMGroupMentionMember[];
    readonly memberCount: number;
    readonly cacheState: IMGroupMemberInvitationCacheState | 'authoritative';
}
/** 群成员 cache/sync 与提及发送的唯一共享业务入口。 */
export interface IMGroupMentionSync {
    listMembers(groupID: string): Promise<readonly IMGroupMentionMember[]>;
    syncMembers(groupID: string, options?: WebIMGroupMemberSyncOptions): Promise<readonly IMGroupMentionMember[]>;
    updateSelfNickname(groupID: string, nickname: string): Promise<IMGroupMentionMember>;
    inviteMembers(options: IMInviteGroupMembersOptions): Promise<IMInviteGroupMembersResult>;
    removeMembers(options: IMRemoveGroupMembersOptions): Promise<IMRemoveGroupMembersResult>;
    send(options: IMSendGroupMentionOptions): Promise<Message>;
}
/** 群提及 facade 复用同一账号库、Gateway、ID 与 mutation queue。 */
export interface IMGroupMentionSyncDependencies extends WebIMGroupMemberSyncDependencies, WebIMMessageSendDependencies, WebIMSyncMutationQueueDependencies {
}
/** 创建 RN、Web、Desktop 共用的群成员与提及 facade。 */
export declare function createIMGroupMentionSync(dependencies: IMGroupMentionSyncDependencies): IMGroupMentionSync;
//# sourceMappingURL=group-mention.d.ts.map