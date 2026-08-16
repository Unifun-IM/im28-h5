import { FriendshipRepository, UserRepository, } from '@im28/im-sdk/core';
import { formatIMUserDisplayName, normalizeIMUserNickname, } from '../../modules/user/display-name.js';
import { resolveFriendshipDisplayProfile } from '../contact/friendship-display-profile.js';
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
        /** gatewayUsers 是补充展示资料；失败时成员集合仍保持权威可提交。 */
        let gatewayUsers;
        try {
            gatewayUsers = await gatewayClient.batchGetUsers({ user_ids: batchUserIDs });
        }
        catch {
            return false;
        }
        for (const gatewayUser of gatewayUsers) {
            /** user 只接收本批请求内且有稳定身份的公开资料。 */
            const user = mapGatewayUser(gatewayUser, requestedUserIDs);
            if (user)
                profiles.set(user.userID, user);
        }
    }
    /** repository 原子合并本批公开资料，不把公开昵称复制成群昵称。 */
    const repository = new UserRepository(database);
    await repository.upsertMany([...profiles.values()]);
    return true;
}
/** 将成员身份与已有用户/好友公开资料合成为页面展示快照。 */
export async function resolveGroupMemberDisplayProfiles(database, members) {
    /** users 提供公开昵称和头像的唯一共享 cache owner。 */
    const users = new UserRepository(database);
    /** friendships 提供当前账号备注并补偿历史内嵌用户快照。 */
    const friendships = new FriendshipRepository(database);
    /** userIDs 固定本轮成员身份集合。 */
    const userIDs = members.map(member => member.userID.trim()).filter(Boolean);
    /** snapshots 用两次批量查询代替逐成员 2N 次 SQLite 查询。 */
    const [userSnapshots, friendshipSnapshots] = await Promise.all([
        users.getByIDs(userIDs),
        friendships.getByUserIDs(userIDs),
    ]);
    /** usersByID 为公开资料提供常数时间关联。 */
    const usersByID = new Map(userSnapshots.map(user => [user.userID, user]));
    /** friendshipsByID 为当前账号备注提供常数时间关联。 */
    const friendshipsByID = new Map(friendshipSnapshots.map(friendship => [friendship.userID, friendship]));
    /** entries 只做内存投影，平台层无需再次请求资料。 */
    const entries = members.map(member => {
        /** userID 是 users、friendships 和 group_members 的关联键。 */
        const userID = member.userID.trim();
        /** user 是公开用户快照。 */
        const user = usersByID.get(userID);
        /** friendship 是当前账号好友关系快照。 */
        const friendship = friendshipsByID.get(userID) ?? null;
        /** groupNickname 忽略历史错误写入的 userID 占位符。 */
        const groupNickname = normalizeGroupNickname(member.nickname, userID);
        /** friendshipProfile 分字段保留好友备注和历史公开资料。 */
        const friendshipProfile = resolveFriendshipDisplayProfile(friendship);
        /** publicNickname 不读取好友备注，避免改变群成员昵称语义。 */
        const publicNickname = normalizeIMUserNickname(user?.nickname, userID) ||
            normalizeIMUserNickname(friendshipProfile.nickname, userID);
        /** avatarURL 优先真实成员头像扩展，再使用公开用户头像。 */
        const avatarURL = member.faceURL?.trim() || user?.faceURL?.trim() ||
            friendshipProfile.avatarURL;
        /** profile 对页面保证稳定昵称，最终身份按 RN 匿名规则投影。 */
        const profile = {
            ...(friendshipProfile.remark ? { remark: friendshipProfile.remark } : {}),
            ...(groupNickname ? { groupNickname } : {}),
            nickname: groupNickname || publicNickname || formatIMUserDisplayName(userID),
            avatarURL,
        };
        return [userID, profile];
    });
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