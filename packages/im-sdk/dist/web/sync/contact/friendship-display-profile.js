/** 从已确认好友关系中读取备注和历史公开资料。 */
export function resolveFriendshipDisplayProfile(friendship) {
    if (!friendship?.isFriend) {
        return { remark: '', nickname: '', avatarURL: '' };
    }
    /** payload 是 Gateway/OpenIM 好友关系的原始快照。 */
    const payload = asRecord(friendship.payload);
    /** user 兼容旧关系 cache 中内嵌的公开用户快照。 */
    const user = asRecord(payload.user);
    return {
        remark: readString(payload.alias) || readString(payload.remark) ||
            readString(payload.friendRemark),
        nickname: readString(user.nickname),
        avatarURL: readString(user.avatar_url) || readString(user.faceURL),
    };
}
/** 将未知 JSON 值收窄为只读对象。 */
function asRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value
        : {};
}
/** 读取去除首尾空白后的字符串。 */
function readString(value) {
    return typeof value === 'string' ? value.trim() : '';
}
//# sourceMappingURL=friendship-display-profile.js.map