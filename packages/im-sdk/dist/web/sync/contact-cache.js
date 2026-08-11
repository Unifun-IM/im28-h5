import { FriendshipRepository, UserRepository, } from '@im28/im-sdk/core';
/** 完整好友分页成功后替换关系快照，并更新可复用的公开用户资料。 */
export async function replaceWebIMContactCache(database, friends) {
    /** records 在写入前过滤无稳定身份的异常远端记录。 */
    const records = friends
        .map(mapGatewayFriendToCacheRecord)
        .filter((record) => record !== null);
    /** userRepository 复用 users 表保存公开昵称，不复制联系人展示模型。 */
    const userRepository = new UserRepository(database);
    for (const record of records) {
        if (record.user)
            await userRepository.upsert(record.user);
    }
    /** friendshipRepository 最后替换完整关系集，分页失败不会清空旧快照。 */
    const friendshipRepository = new FriendshipRepository(database);
    await friendshipRepository.replaceAll(records.map(record => record.friendship));
}
/** 将单条 Gateway 好友记录映射为现有共享 Repository contract。 */
function mapGatewayFriendToCacheRecord(friend) {
    /** userID 优先使用关系主键，再回退嵌套公开用户主键。 */
    const userID = (friend.friend_user_id ?? friend.user_id ?? friend.user?.user_id ?? '').trim();
    if (!userID)
        return null;
    /** gatewayUser 只在服务端提供公开资料时进入 users 表。 */
    const gatewayUser = friend.user;
    /** nickname 是 RN 发送人名称优先级中的最终公开资料回退。 */
    const nickname = gatewayUser?.nickname?.trim();
    /** faceURL 与 nickname 一起保留，供其他 shared profile 消费者复用。 */
    const faceURL = gatewayUser?.avatar_url?.trim();
    /** user 不以关系 alias 覆盖公开昵称。 */
    const user = gatewayUser
        ? {
            userID,
            ...(nickname ? { nickname } : {}),
            ...(faceURL ? { faceURL } : {}),
            payload: gatewayUser,
        }
        : undefined;
    return {
        friendship: { userID, isFriend: true, payload: friend },
        ...(user ? { user } : {}),
    };
}
//# sourceMappingURL=contact-cache.js.map