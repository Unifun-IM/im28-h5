import { FriendshipRepository, GroupMemberRepository, UserRepository, } from '@im28/im-sdk/core';
import { resolveFriendshipDisplayProfile } from './friendship-display-profile.js';
/** 按 RN 的备注、群昵称、公开昵称和身份顺序解析群成员可见名称。 */
export function resolveIMGroupMemberDisplayName(source, fallback = '') {
    /** userID 是各昵称占位值的稳定判别身份。 */
    const userID = source.userID?.trim() ?? '';
    /** remark 是当前账号确认好友关系提供的最高优先级备注。 */
    const remark = source.remark?.trim() ?? '';
    /** groupNickname 是当前群内昵称，身份占位值视为缺失。 */
    const groupNickname = source.groupNickname?.trim() ?? '';
    /** nickname 是公开用户昵称或历史好友公开资料。 */
    const nickname = source.nickname?.trim() ?? '';
    return remark ||
        (groupNickname && groupNickname !== userID ? groupNickname : '') ||
        (nickname && nickname !== userID ? nickname : '') ||
        userID || fallback;
}
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
    /** friendshipProfile 复用群成员快照的唯一好友字段解析。 */
    const friendshipProfile = resolveFriendshipDisplayProfile(friendship);
    /** displayName 复用跨端唯一优先级函数并允许无可证明名称时返回空值。 */
    const displayName = resolveIMGroupMemberDisplayName({
        userID: normalizedUserID,
        remark: friendshipProfile.remark,
        ...(member?.nickname ? { groupNickname: member.nickname } : {}),
        nickname: user?.nickname?.trim() || friendshipProfile.nickname,
    });
    return displayName === normalizedUserID ? undefined : displayName || undefined;
}
//# sourceMappingURL=sender-display-name.js.map