import { type GatewayHTTPClient, type Group } from '@im28/im-sdk/core';
import { type WebIMSyncContext } from './sync-context.js';
/** 群成员邀请只接收稳定群身份、好友身份和可选验证消息。 */
export interface IMInviteGroupMembersOptions {
    readonly groupID: string;
    readonly userIDs: readonly string[];
    readonly message?: string;
}
/** 邀请候选只依赖跨端稳定身份和好友权限。 */
export interface IMInvitableGroupContact {
    readonly userID: string;
    readonly allowGroupInvite?: boolean;
}
/** 群邀请按群设置选择直接入群或待审核申请。 */
export type IMGroupMemberInvitationMode = 'direct' | 'application';
/** 直接邀请远端成功后的群缓存收敛状态。 */
export type IMGroupMemberInvitationCacheState = 'local' | 'remote-only' | 'unchanged';
/** 一次邀请写入的稳定结果禁止调用方猜测是否可重放。 */
export interface IMGroupMemberInvitationCommit {
    readonly group: Group;
    readonly invitedUserIDs: readonly string[];
    readonly mode: IMGroupMemberInvitationMode;
    readonly cacheState: IMGroupMemberInvitationCacheState;
}
/** 校验权限、好友和群成员快照后执行唯一一次 Gateway 邀请写入。 */
export declare function inviteIMGroupMembers(context: WebIMSyncContext, options: IMInviteGroupMembersOptions, gatewayClient: GatewayHTTPClient): Promise<IMGroupMemberInvitationCommit>;
/** 对齐 RN：只保留未入群且明确允许群邀请的好友。 */
export declare function filterIMInvitableGroupContacts<Contact extends IMInvitableGroupContact>(contacts: readonly Contact[], memberUserIDs: readonly string[]): Contact[];
//# sourceMappingURL=group-member-invitation.d.ts.map