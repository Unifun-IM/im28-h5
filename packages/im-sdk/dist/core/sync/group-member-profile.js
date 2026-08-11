import { FriendshipRepository, UserRepository, } from '@im28/im-sdk/core';
import { resolveFriendshipDisplayProfile } from './friendship-display-profile.js';
/** 单次用户详情请求保持在可控批量，兼容普通群最多 200 人。 */
const GROUP_MEMBER_PROFILE_BATCH_SIZE = 100;
/** 在成员快照替换前拉取并保存全部可用公开用户资料。 */
export async function refreshGroupMemberUserProfiles(database, gatewayClient, members) {
    /** userIDs 按成员首见顺序去重，保证批请求和测试稳定。 */
    const userIDs = [...new Set(members.map(member => member.userID.trim()).filter(Boolean))];
    /** profiles 仅在全部远端批次成功后写入，避免网络失败产生半批 cache。 */
    const profiles = new Map();
    for (let offset = 0; offset < userIDs.length; offset += GROUP_MEMBER_PROFILE_BATCH_SIZE) {
        /** batchUserIDs 是本次 Gateway 请求的明确身份集合。 */
        const batchUserIDs = userIDs.slice(offset, offset + GROUP_MEMBER_PROFILE_BATCH_SIZE);
        /** requestedUserIDs 拒绝服务端混入非本群用户资料。 */
        const requestedUserIDs = new Set(batchUserIDs);
        /** gatewayUsers 缺失条目可由既有 cache 回退，但请求失败必须中断成员替换。 */
        const gatewayUsers = await gatewayClient.batchGetUsers({ user_ids: batchUserIDs });
        for (const gatewayUser of gatewayUsers) {
            /** user 只接收本批请求内且有稳定身份的公开资料。 */
            const user = mapGatewayUser(gatewayUser, requestedUserIDs);
            if (user)
                profiles.set(user.userID, user);
        }
    }
    /** repository 复用共享 users 表，不把公开昵称复制成群昵称。 */
    const repository = new UserRepository(database);
    for (const profile of profiles.values()) {
        await repository.upsert(profile);
    }
}
/** 将成员身份与已有用户/好友公开资料合成为页面展示快照。 */
export async function resolveGroupMemberDisplayProfiles(database, members) {
    /** users 提供公开昵称和头像的唯一共享 cache owner。 */
    const users = new UserRepository(database);
    /** friendships 提供当前账号备注并补偿历史内嵌用户快照。 */
    const friendships = new FriendshipRepository(database);
    /** entries 并行读取每个稳定身份，避免平台层再次请求用户资料。 */
    const entries = await Promise.all(members.map(async (member) => {
        /** userID 是 users、friendships 和 group_members 的关联键。 */
        const userID = member.userID.trim();
        /** snapshots 只读当前账号数据库。 */
        const [user, friendship] = await Promise.all([
            users.getByID(userID),
            friendships.getByUserID(userID),
        ]);
        /** groupNickname 忽略历史错误写入的 userID 占位符。 */
        const groupNickname = normalizeGroupNickname(member.nickname, userID);
        /** friendshipProfile 分字段保留好友备注和历史公开资料。 */
        const friendshipProfile = resolveFriendshipDisplayProfile(friendship);
        /** publicNickname 不读取好友备注，避免改变群成员昵称语义。 */
        const publicNickname = user?.nickname?.trim() || friendshipProfile.nickname;
        /** avatarURL 优先真实成员头像扩展，再使用公开用户头像。 */
        const avatarURL = member.faceURL?.trim() || user?.faceURL?.trim() ||
            friendshipProfile.avatarURL;
        /** profile 对页面保证稳定昵称，身份只作为最终可见兜底。 */
        const profile = {
            ...(friendshipProfile.remark ? { remark: friendshipProfile.remark } : {}),
            ...(groupNickname ? { groupNickname } : {}),
            nickname: groupNickname || publicNickname || userID,
            avatarURL,
        };
        return [userID, profile];
    }));
    return new Map(entries);
}
/** 将 Gateway 公开用户资料映射到共享 User Repository。 */
function mapGatewayUser(gatewayUser, requestedUserIDs) {
    /** userID 必须属于本批请求，防止污染当前账号 cache。 */
    const userID = gatewayUser.user_id?.trim() ?? '';
    if (!userID || !requestedUserIDs.has(userID))
        return null;
    /** nickname 是公开昵称，不写入 group_members.nickname。 */
    const nickname = gatewayUser.nickname?.trim();
    /** faceURL 保留公开头像。 */
    const faceURL = gatewayUser.avatar_url?.trim();
    return {
        userID,
        ...(nickname ? { nickname } : {}),
        ...(faceURL ? { faceURL } : {}),
        payload: gatewayUser,
    };
}
/** 只接受与身份不同的非空群昵称。 */
function normalizeGroupNickname(value, userID) {
    /** nickname 是历史或未来 Gateway 群昵称扩展。 */
    const nickname = value?.trim() ?? '';
    return nickname && nickname !== userID ? nickname : '';
}
//# sourceMappingURL=group-member-profile.js.map