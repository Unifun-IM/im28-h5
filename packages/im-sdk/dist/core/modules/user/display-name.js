/** 按 RN 已发布规则把稳定用户 ID 格式化为匿名可见名称。 */
export function formatIMUserDisplayName(userID) {
    /** normalizedUserID 只接受去除首尾空白后的字符串身份。 */
    const normalizedUserID = typeof userID === 'string' ? userID.trim() : '';
    return normalizedUserID ? `im-${normalizedUserID.slice(-4)}` : '';
}
/** 过滤空昵称及服务端以 userID 回填的伪昵称。 */
export function normalizeIMUserNickname(nickname, userID) {
    /** normalizedNickname 只接受非空字符串昵称。 */
    const normalizedNickname = typeof nickname === 'string' ? nickname.trim() : '';
    /** normalizedUserID 用于识别 Gateway 的身份回填值。 */
    const normalizedUserID = typeof userID === 'string' ? userID.trim() : '';
    return normalizedNickname && normalizedNickname !== normalizedUserID
        ? normalizedNickname
        : '';
}
//# sourceMappingURL=display-name.js.map