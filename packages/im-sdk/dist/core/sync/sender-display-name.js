import { FriendshipRepository, GroupMemberRepository, UserRepository, } from '@im28/im-sdk/core';
import { resolveFriendshipDisplayProfile } from './friendship-display-profile.js';
/** 按 RN 的备注、群昵称、用户昵称顺序解析群消息发送人名称。 */
export async function resolveGroupSenderDisplayName(database, groupID, userID) {
    /** normalizedGroupID 禁止空群跨分区读取成员。 */
    const normalizedGroupID = groupID.trim();
    /** normalizedUserID 是三类缓存共同的稳定身份键。 */
    const normalizedUserID = userID.trim();
    if (!normalizedGroupID || !normalizedUserID)
        return undefined;
    /** snapshots 并行读取同一账号数据库中的现有只读快照。 */
    const [friendship, member, user] = await Promise.all([
        new FriendshipRepository(database).getByUserID(normalizedUserID),
        new GroupMemberRepository(database).getByGroupAndUserID(normalizedGroupID, normalizedUserID),
        new UserRepository(database).getByID(normalizedUserID),
    ]);
    /** memberNickname 忽略旧版本错误写入的 userID 占位符。 */
    const memberNickname = member?.nickname?.trim() ?? '';
    /** friendshipProfile 复用群成员快照的唯一好友字段解析。 */
    const friendshipProfile = resolveFriendshipDisplayProfile(friendship);
    return friendshipProfile.remark ||
        (memberNickname !== normalizedUserID ? memberNickname : '') ||
        user?.nickname?.trim() || friendshipProfile.nickname || undefined;
}
//# sourceMappingURL=sender-display-name.js.map