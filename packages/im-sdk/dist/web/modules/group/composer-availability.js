/** 群聊权限尚未从当前账号缓存恢复时禁止提前显示输入控件。 */
export const IM_GROUP_COMPOSER_RECOVERING_REASON = '正在恢复群聊状态';
/** 权威已加入群列表不再包含目标群时使用的 fail-closed 文案。 */
export const IM_GROUP_COMPOSER_MISSING_REASON = '群聊不存在或已退出，无法发消息';
/** 无缓存且群权限读取失败时禁止以可发送状态伪装成功。 */
export const IM_GROUP_COMPOSER_UNRESOLVED_REASON = '群聊状态暂不可用，无法发消息';
/** RN 既有群聊不可发言提示，按判定优先级集中维护。 */
const GROUP_COMPOSER_REASON = {
    removed: '你已被移出群聊，无法发消息',
    left: '你已退出群聊，无法发消息',
    userBanned: '你已被群封禁，无法发消息',
    groupBanned: '群聊已封禁，暂时无法发消息',
    dismissed: '群聊已解散，无法发消息',
    permission: '你没有发言权限，无法发消息',
    memberMuted: '你已被禁言，暂时无法发消息',
    allMuted: '全员禁言中，仅群主可发言',
    normalMemberMuted: '普通成员禁言中，仅群主和管理员可发言',
    frequency: '发言频率限制中，请稍后再试',
};
/** 按 RN 既有优先级从共享群快照计算输入区不可用原因。 */
export function resolveIMGroupComposerUnavailableReason(input) {
    /** permission 只接受普通对象，异常 Gateway 字段不能改变页面权限。 */
    const permission = readPermissionRecord(input.userPermission);
    /** permissionState 统一当前成员 active/left/removed/banned 状态。 */
    const permissionState = readString(permission?.state).toLowerCase();
    if (readBoolean(permission?.is_removed) === true || permissionState === 'removed') {
        return GROUP_COMPOSER_REASON.removed;
    }
    if (readBoolean(permission?.is_left) === true || permissionState === 'left') {
        return GROUP_COMPOSER_REASON.left;
    }
    if (readBoolean(permission?.is_banned) === true || permissionState === 'banned') {
        return GROUP_COMPOSER_REASON.userBanned;
    }
    if (input.status === 'banned')
        return GROUP_COMPOSER_REASON.groupBanned;
    if (input.status === 'dismissed')
        return GROUP_COMPOSER_REASON.dismissed;
    if (readBoolean(permission?.can_send_message) === false) {
        return GROUP_COMPOSER_REASON.permission;
    }
    if (input.currentUserRole === 'owner')
        return '';
    if (readBoolean(permission?.member_muted) === true) {
        return GROUP_COMPOSER_REASON.memberMuted;
    }
    if (readBoolean(permission?.group_muted) === true ||
        readBoolean(permission?.is_muted) === true) {
        return GROUP_COMPOSER_REASON.allMuted;
    }
    if (input.muteAll === true || input.status === 'muted') {
        return GROUP_COMPOSER_REASON.allMuted;
    }
    if (input.muteMember === true && input.currentUserRole === 'member') {
        return GROUP_COMPOSER_REASON.normalMemberMuted;
    }
    if (isSpeechFrequencyLimited(permission))
        return GROUP_COMPOSER_REASON.frequency;
    return '';
}
/** 将未知权限值收窄为可安全读取的记录。 */
function readPermissionRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : null;
}
/** 仅接受服务端显式布尔，避免 truthy 字符串放大权限。 */
function readBoolean(value) {
    return typeof value === 'boolean' ? value : undefined;
}
/** 将未知状态安全收窄为去空格字符串。 */
function readString(value) {
    return typeof value === 'string' ? value.trim() : '';
}
/** 兼容 RN 已消费的四种发言频率限制字段。 */
function isSpeechFrequencyLimited(permission) {
    return Boolean(readBoolean(permission?.speech_frequency_limited) ||
        readBoolean(permission?.speechFrequencyLimited) ||
        readBoolean(permission?.frequency_limited) ||
        readBoolean(permission?.send_frequency_limited));
}
//# sourceMappingURL=composer-availability.js.map