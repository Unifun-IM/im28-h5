/** RN 群申请验证语允许的最大字符数。 */
export const IM_GROUP_APPLICATION_MESSAGE_MAX_LENGTH = 50;
/** 未取得本人昵称时使用的稳定群申请验证语。 */
export const DEFAULT_IM_GROUP_APPLICATION_MESSAGE = '申请加入群聊';
/** 按 RN 既有规则用本人昵称生成群申请验证语。 */
export function buildIMSelfGroupApplicationMessage(nickname) {
    /** normalizedNickname 避免把空白昵称写入申请内容。 */
    const normalizedNickname = nickname?.trim() ?? '';
    return normalizedNickname
        ? `我是${normalizedNickname}，申请加入群聊`
        : DEFAULT_IM_GROUP_APPLICATION_MESSAGE;
}
//# sourceMappingURL=group-application-message.js.map