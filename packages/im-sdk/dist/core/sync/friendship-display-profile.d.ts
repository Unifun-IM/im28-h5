import type { Friendship } from '@im28/im-sdk/core';
/** 好友关系中可与公开用户资料分字段合成的展示资料。 */
export interface IMFriendshipDisplayProfile {
    readonly remark: string;
    readonly nickname: string;
    readonly avatarURL: string;
}
/** 从已确认好友关系中读取备注和历史公开资料。 */
export declare function resolveFriendshipDisplayProfile(friendship: Friendship | null): IMFriendshipDisplayProfile;
//# sourceMappingURL=friendship-display-profile.d.ts.map