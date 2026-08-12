import { type GatewayHTTPClient, type Group } from '@im28/im-sdk/core';
import { type WebIMSyncContext } from './sync-context.js';
/** 群成员移除只接收稳定群身份和成员身份集合。 */
export interface IMRemoveGroupMembersOptions {
    readonly groupID: string;
    readonly userIDs: readonly string[];
}
/** 候选过滤只依赖跨端稳定身份与群角色。 */
export interface IMRemovableGroupMember {
    readonly userID?: string;
    readonly roleLevel?: number;
}
/** 远端成功后的本地缓存收敛状态。 */
export type IMGroupMemberRemovalCacheState = 'local' | 'remote-only';
/** 单次远端移除写入返回的稳定结果。 */
export interface IMGroupMemberRemovalCommit {
    readonly group: Group;
    readonly removedUserIDs: readonly string[];
    readonly cacheState: IMGroupMemberRemovalCacheState;
}
/** 校验权限和目标后执行一次 Gateway 写入及 success-only 本地事务。 */
export declare function removeIMGroupMembers(context: WebIMSyncContext, options: IMRemoveGroupMembersOptions, gatewayClient: GatewayHTTPClient): Promise<IMGroupMemberRemovalCommit>;
/** 对齐 RN：排除本人、群主，并限制管理员移除其他管理员。 */
export declare function filterIMRemovableGroupMembers<Member extends IMRemovableGroupMember>(members: readonly Member[], currentUserID: string): Member[];
//# sourceMappingURL=group-member-removal.d.ts.map