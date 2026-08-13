/** RN 当前黑名单输入区文案，保持跨端单一维护。 */
export const IM_DIRECT_CHAT_BLOCKED_BY_ME_REASON = '你已将对方加入黑名单,你们无法收到对方的消息';
/** RN 当前陌生人关系提示，语义是好友关系不成立而非反向黑名单。 */
export const IM_DIRECT_CHAT_STRANGER_NOTICE = '你还不是对方好友，请先发送朋友验证请求，对方验证通过后，才能聊天。';
/** RN 当前陌生人关系动作标签。 */
export const IM_DIRECT_CHAT_STRANGER_ACTION_LABEL = '申请添加朋友';
/** 单聊关系首轮真实读取完成前的输入区提示。 */
export const IM_DIRECT_CHAT_RELATIONSHIP_RECOVERING_REASON = '正在恢复联系人关系';
/** 单聊关系无可用事实时的保守输入区提示。 */
export const IM_DIRECT_CHAT_RELATIONSHIP_UNRESOLVED_REASON = '联系人关系暂不可用，无法发消息';
/** 单聊关系读取中的 fail-closed 页面投影。 */
export const IM_DIRECT_CHAT_RELATIONSHIP_RECOVERING_PRESENTATION = {
    status: 'recovering',
    composerUnavailableReason: IM_DIRECT_CHAT_RELATIONSHIP_RECOVERING_REASON,
    noticeText: '',
    noticeActionLabel: '',
};
/** 单聊关系读取失败且无旧事实时的 fail-closed 页面投影。 */
export const IM_DIRECT_CHAT_RELATIONSHIP_UNRESOLVED_PRESENTATION = {
    status: 'unresolved',
    composerUnavailableReason: IM_DIRECT_CHAT_RELATIONSHIP_UNRESOLVED_REASON,
    noticeText: '',
    noticeActionLabel: '',
};
/** 好友关系下不限制输入且不显示附加提示。 */
const FRIEND_PRESENTATION = {
    status: 'friend',
    composerUnavailableReason: '',
    noticeText: '',
    noticeActionLabel: '',
};
/** 按 RN 优先级将我方黑名单与好友关系投影为聊天页状态。 */
export function resolveIMDirectChatRelationshipPresentation(input) {
    if (input.blockedByMe) {
        return {
            status: 'blocked-by-me',
            composerUnavailableReason: IM_DIRECT_CHAT_BLOCKED_BY_ME_REASON,
            noticeText: '',
            noticeActionLabel: '',
        };
    }
    if (input.relationship === 'stranger') {
        return {
            status: 'stranger',
            composerUnavailableReason: '',
            noticeText: IM_DIRECT_CHAT_STRANGER_NOTICE,
            noticeActionLabel: IM_DIRECT_CHAT_STRANGER_ACTION_LABEL,
        };
    }
    return FRIEND_PRESENTATION;
}
/** 识别 Gateway/OpenIM 返回的好友关系失效发送错误。 */
export function isIMFriendRelationshipSendError(cause) {
    /** text 汇总有限深度的错误 message/code，避免页面复制协议兼容词。 */
    const text = collectIMFriendRelationshipErrorText(cause, 0).join(' ').toLowerCase();
    return [
        'friend_deleted',
        'not_friend',
        'not friend',
        'friend relation',
        'friend relationship',
        '好友关系',
        '好友验证',
        '不是好友',
        '非好友',
    ].some(keyword => text.includes(keyword));
}
/** 有限递归收集嵌套 cause 中可用于关系错误识别的公开文本。 */
function collectIMFriendRelationshipErrorText(cause, depth) {
    if (depth > 4 || !cause || typeof cause !== 'object')
        return [String(cause ?? '')];
    /** record 只读取错误对象的公开 message/code/cause 字段。 */
    const record = cause;
    return [
        readIMFriendRelationshipErrorText(record.message),
        readIMFriendRelationshipErrorText(record.code),
        readIMFriendRelationshipErrorText(record.error_code),
        ...collectIMFriendRelationshipErrorText(record.cause, depth + 1),
    ].filter(Boolean);
}
/** 将未知错误字段安全收窄为字符串。 */
function readIMFriendRelationshipErrorText(value) {
    return typeof value === 'string' ? value : '';
}
//# sourceMappingURL=direct-chat-relationship.js.map