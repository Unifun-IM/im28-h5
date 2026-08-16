import { type GatewayHTTPClient, type Group } from '@im28/im-sdk/core';
import { type WebIMSyncContext } from '../sync-context.js';
/** 群管理员数量上限由 shared mutation 和各端展示共同消费。 */
export declare const IM_GROUP_ADMIN_LIMIT = 10;
/** 管理员批量变更只接收稳定群身份和成员身份。 */
export interface IMGroupAdminChangeOptions {
    readonly groupID: string;
    readonly userIDs: readonly string[];
}
/** 群主转让只接收稳定群身份和唯一新群主身份。 */
export interface IMGroupOwnerTransferOptions {
    readonly groupID: string;
    readonly newOwnerUserID: string;
}
/** 群角色候选过滤只依赖稳定身份和规范角色。 */
export interface IMGroupRoleCandidate {
    readonly userID: string;
    readonly role?: 'owner' | 'admin' | 'member';
    readonly roleLevel?: number;
}
/** 管理 mutation 远端成功后的本地缓存收敛状态。 */
export type IMGroupRoleMutationCacheState = 'local' | 'remote-only';
/** 管理员变更的单次远端提交结果。 */
export interface IMGroupAdminChangeCommit {
    readonly group: Group;
    readonly changedUserIDs: readonly string[];
    readonly role: 'admin' | 'member';
    readonly cacheState: IMGroupRoleMutationCacheState;
}
/** 群主转让的单次远端提交结果。 */
export interface IMGroupOwnerTransferCommit {
    readonly group: Group;
    readonly previousOwnerUserID: string;
    readonly newOwnerUserID: string;
    readonly cacheState: IMGroupRoleMutationCacheState;
}
/** 校验群主权限和目标成员后执行一次设置管理员写入。 */
export declare function setIMGroupAdmins(context: WebIMSyncContext, options: IMGroupAdminChangeOptions, gatewayClient: GatewayHTTPClient): Promise<IMGroupAdminChangeCommit>;
/** 校验群主权限和目标管理员后执行一次取消管理员写入。 */
export declare function cancelIMGroupAdmins(context: WebIMSyncContext, options: IMGroupAdminChangeOptions, gatewayClient: GatewayHTTPClient): Promise<IMGroupAdminChangeCommit>;
/** 校验群主权限和新群主后执行一次群主转让写入。 */
export declare function transferIMGroupOwner(context: WebIMSyncContext, options: IMGroupOwnerTransferOptions, gatewayClient: GatewayHTTPClient): Promise<IMGroupOwnerTransferCommit>;
/** 过滤可设置为管理员的普通成员，页面不得复制角色表。 */
export declare function filterIMGroupAdminCandidates<Candidate extends IMGroupRoleCandidate>(candidates: readonly Candidate[]): Candidate[];
/** 过滤可承接群主的活跃非群主成员，并排除当前账号。 */
export declare function filterIMGroupOwnerTransferCandidates<Candidate extends IMGroupRoleCandidate>(candidates: readonly Candidate[], currentUserID: string): Candidate[];
//# sourceMappingURL=group-admin-owner.d.ts.map