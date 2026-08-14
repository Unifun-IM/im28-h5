/** 未取得本人昵称时使用的稳定好友验证语。 */
export const DEFAULT_IM_FRIEND_APPLICATION_MESSAGE = '你好，我想添加你为好友';
/** 按 RN 既有规则用本人昵称生成好友验证语。 */
export function buildIMSelfFriendApplicationMessage(nickname) {
    /** normalizedNickname 避免把空白昵称写入申请内容。 */
    const normalizedNickname = nickname?.trim() ?? '';
    return normalizedNickname
        ? `我是${normalizedNickname}，请通过好友验证`
        : DEFAULT_IM_FRIEND_APPLICATION_MESSAGE;
}
//# sourceMappingURL=friend-application-message.js.map