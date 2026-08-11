import { type DatabaseAdapter, type GatewayHTTPClient, type GroupMember } from '@im28/im-sdk/core';
/** 群成员展示资料保留真实群昵称与公开用户资料的语义边界。 */
export interface IMGroupMemberDisplayProfile {
    readonly remark?: string;
    readonly groupNickname?: string;
    readonly nickname: string;
    readonly avatarURL: string;
}
/** 在成员快照替换前拉取并保存全部可用公开用户资料。 */
export declare function refreshGroupMemberUserProfiles(database: DatabaseAdapter, gatewayClient: GatewayHTTPClient, members: readonly GroupMember[]): Promise<void>;
/** 将成员身份与已有用户/好友公开资料合成为页面展示快照。 */
export declare function resolveGroupMemberDisplayProfiles(database: DatabaseAdapter, members: readonly GroupMember[]): Promise<ReadonlyMap<string, IMGroupMemberDisplayProfile>>;
//# sourceMappingURL=group-member-profile.d.ts.map