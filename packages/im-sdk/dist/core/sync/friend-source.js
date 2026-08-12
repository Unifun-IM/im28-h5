/** 通过群聊页面添加好友时使用的来源码。 */
export const IM_FRIEND_SOURCE_TYPE_GROUP = 'group';
/** 通过用户 ID 添加好友时使用的来源码。 */
export const IM_FRIEND_SOURCE_TYPE_USER_ID = 'user_id';
/** 通过手机号添加好友时使用的来源码。 */
export const IM_FRIEND_SOURCE_TYPE_PHONE = 'phone';
/** 通过邮箱添加好友时使用的来源码。 */
export const IM_FRIEND_SOURCE_TYPE_EMAIL = 'email';
/** Gateway 好友来源码对应的跨端中文展示文案。 */
const IM_FRIEND_SOURCE_LABELS = {
    phone: '通过手机号添加',
    email: '通过邮箱添加',
    user_id: '通过ID添加',
    account: '通过账号添加',
    nickname: '通过昵称添加',
    search: '通过搜索添加',
    group: '通过群聊添加',
    card: '通过名片添加',
    invite_code: '通过邀请码添加',
    qrcode: '通过二维码添加',
};
/** 按邮箱、手机号、其他搜索词推断好友申请来源码。 */
export function inferIMFriendSourceTypeFromKeyword(keyword) {
    /** raw 清理用户输入但不改变其身份内容。 */
    const raw = keyword.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
        return IM_FRIEND_SOURCE_TYPE_EMAIL;
    }
    if (/^\+?\d[\d\s-]{4,}$/.test(raw)) {
        return IM_FRIEND_SOURCE_TYPE_PHONE;
    }
    return IM_FRIEND_SOURCE_TYPE_USER_ID;
}
/** 将 Gateway 来源码或历史自由文本转换为各端一致的可见文案。 */
export function formatIMFriendSourceType(sourceType, fallback = '未知来源') {
    /** raw 仅接受非空字符串，其他输入统一进入显式 fallback。 */
    const raw = typeof sourceType === 'string' ? sourceType.trim() : '';
    if (!raw)
        return fallback;
    /** key 让稳定来源码匹配不受大小写影响。 */
    const key = raw.toLocaleLowerCase();
    if (IM_FRIEND_SOURCE_LABELS[key])
        return IM_FRIEND_SOURCE_LABELS[key];
    for (const [code, label] of Object.entries(IM_FRIEND_SOURCE_LABELS)) {
        if (key.includes(code))
            return label;
    }
    return raw;
}
//# sourceMappingURL=friend-source.js.map