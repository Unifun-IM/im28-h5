import {} from '@im28/im-sdk/core';
import { resolveIMGroupManagementPermissions } from './group-management-permissions.js';
import { normalizeIMGroupMode } from './group-mode.js';
import { resolveIMGroupComposerUnavailableReason } from '../modules/group/composer-availability.js';
/** 缓存 payload 中保存服务端顺序的私有字段。 */
const JOINED_GROUP_ORDER_KEY = '__joinedGroupOrder';
/** 将 Gateway group 转成共享 Group Repository 记录。 */
export function mapGatewayGroupToCore(group, order) {
    // groupID 缺失的远端异常记录不能进入 cache。
    const groupID = group.group_id?.trim() ?? '';
    if (!groupID)
        return null;
    return {
        groupID,
        name: group.title?.trim() || groupID,
        faceURL: group.avatar_url?.trim() ?? '',
        memberCount: normalizeMemberCount(group.member_count),
        payload: { ...group, [JOINED_GROUP_ORDER_KEY]: order },
    };
}
/** 将单群详情合并到既有缓存，并保留服务端列表顺序和未返回字段。 */
export function mergeGatewayGroupDetailToCore(existingGroup, detail) {
    /** existingPayload 保留列表接口已经确认但详情接口可能省略的字段。 */
    const existingPayload = existingGroup
        ? readJoinedGroupPayload(existingGroup)
        : {};
    /** order 保留我的群聊列表顺序，冷缓存详情排到列表末尾。 */
    const order = readJoinedGroupOrder(existingPayload);
    /** mergedGroup 让详情返回字段覆盖旧快照。 */
    const mergedGroup = mapGatewayGroupToCore({ ...existingPayload, ...detail }, order);
    if (!mergedGroup) {
        throw new Error('Group detail merge requires a stable group ID.');
    }
    return mergedGroup;
}
/** 从共享 Group cache 恢复页面模型并按服务端顺序排序。 */
export async function readJoinedGroupCache(repository, currentUserID) {
    // groups 由共享 repository 恢复 raw payload。
    const groups = await repository.list();
    return groups
        .map(group => ({
        group: mapCoreGroupToWeb(group, currentUserID),
        order: readJoinedGroupOrder(readJoinedGroupPayload(group)),
    }))
        .sort((left, right) => left.order - right.order ||
        left.group.groupID.localeCompare(right.group.groupID))
        .map(item => item.group);
}
/** 将缓存记录映射为稳定 Web 群模型。 */
export function mapCoreGroupToWeb(group, currentUserID) {
    // payload 兼容 Repository 将 raw_json 平铺到 Group 根对象的既有契约。
    const payload = readJoinedGroupPayload(group);
    // ownerUserID 用于“我创建”标签。
    const ownerUserID = readString(payload.owner_user_id);
    // currentUserRole 统一成员和权限快照中的当前账号角色。
    const currentUserRole = normalizeJoinedGroupRole(payload);
    /** status 是输入区和列表共用的标准群状态。 */
    const status = normalizeJoinedGroupStatus(payload.status);
    /** permissions 与 RN 群设置共用显式 capability 和角色回退规则。 */
    const permissions = resolveIMGroupManagementPermissions({
        userPermission: payload.user_permission,
        currentMemberRole: currentUserRole,
    });
    /** canClearMessagesForAll 只接受服务端 can_clear_message 明确授权。 */
    const canClearMessagesForAll = readExplicitClearMessagePermission(payload);
    return {
        groupID: group.groupID,
        conversationID: readString(payload.conversation_id),
        name: group.name || group.groupID,
        avatarURL: group.faceURL ?? '',
        introduction: readString(payload.description),
        announcement: readString(payload.announcement),
        announcementVersion: readString(payload.announcement_version),
        memberCount: normalizeMemberCount(group.memberCount),
        mode: normalizeIMGroupMode(payload.mode ?? payload.group_mode ?? payload.group_type),
        ownerUserID,
        currentUserRole,
        joinApprovalRequired: payload.join_approval_required === true,
        ...(typeof payload.allow_member_invite === 'boolean'
            ? { allowMemberInvite: payload.allow_member_invite }
            : {}),
        ...(typeof payload.allow_member_add_friend === 'boolean'
            ? { allowMemberAddFriend: payload.allow_member_add_friend }
            : {}),
        ...(typeof payload.allow_member_nickname === 'boolean'
            ? { allowMemberNickname: payload.allow_member_nickname }
            : {}),
        ...(typeof payload.mute_all === 'boolean'
            ? { muteAll: payload.mute_all }
            : {}),
        ...(typeof payload.mute_member === 'boolean'
            ? { muteMember: payload.mute_member }
            : {}),
        ...(typeof payload.send_frequency_enabled === 'boolean'
            ? { speechFrequencyEnabled: payload.send_frequency_enabled }
            : {}),
        ...(Number.isFinite(Number(payload.send_frequency_seconds))
            ? { speechFrequencySeconds: Number(payload.send_frequency_seconds) }
            : {}),
        permissions,
        ...(canClearMessagesForAll !== undefined ? { canClearMessagesForAll } : {}),
        canEditAnnouncement: permissions.canEditAnnouncement,
        canMentionAll: permissions.canMentionAll,
        isCreatedByCurrentUser: Boolean(currentUserID.trim() && ownerUserID === currentUserID.trim()),
        status,
        composerUnavailableReason: resolveIMGroupComposerUnavailableReason({
            status,
            currentUserRole,
            ...(typeof payload.mute_all === 'boolean' ? { muteAll: payload.mute_all } : {}),
            ...(typeof payload.mute_member === 'boolean' ? { muteMember: payload.mute_member } : {}),
            userPermission: payload.user_permission,
        }),
    };
}
/** 从群和当前成员权限快照读取全员清空授权，缺失时保持关闭。 */
function readExplicitClearMessagePermission(payload) {
    /** userPermission 兼容 Gateway 将 capability 放入当前成员权限对象。 */
    const userPermission = isRecord(payload.user_permission)
        ? payload.user_permission
        : {};
    /** values 按 RN 当前兼容顺序覆盖三种历史字段名。 */
    const values = [
        payload.can_clear_message,
        payload.can_clear_messages,
        payload.canClearMessages,
        userPermission.can_clear_message,
        userPermission.can_clear_messages,
        userPermission.canClearMessages,
    ];
    return values.find((value) => typeof value === 'boolean');
}
/** 读取显式 payload，缺失时回退 Repository 平铺后的 Group 根对象。 */
function readJoinedGroupPayload(group) {
    return isRecord(group.payload)
        ? group.payload
        : group;
}
/** 从成员和权限字段统一当前账号群角色。 */
function normalizeJoinedGroupRole(group) {
    // member 和 userPermission 兼容 my/list 的两种服务端结构。
    const member = isRecord(group.member) ? group.member : {};
    // userPermission 保留旧字段 role_level 回退。
    const userPermission = isRecord(group.user_permission) ? group.user_permission : {};
    // role 统一字符串与数值角色。
    const role = member.role ?? userPermission.role_level ?? userPermission.role;
    if (role === 100 || String(role).toLowerCase() === 'owner')
        return 'owner';
    if (role === 60 || String(role).toLowerCase() === 'admin')
        return 'admin';
    return 'member';
}
/** 将 RN 使用的群状态数值和 Gateway 字符串收敛为 Web 枚举。 */
function normalizeJoinedGroupStatus(value) {
    // normalized 允许数值和字符串共用映射表。
    const normalized = String(value ?? '').trim().toLowerCase();
    if (value === 0 || normalized === 'active' || normalized === 'normal')
        return 'active';
    if (value === 1 || normalized === 'disabled' || normalized === 'banned')
        return 'banned';
    if (value === 2 || normalized === 'dismissed')
        return 'dismissed';
    if (value === 3 || normalized === 'muted')
        return 'muted';
    return 'unknown';
}
/** 读取缓存中的服务端顺序，无效值排到末尾。 */
function readJoinedGroupOrder(payload) {
    if (!isRecord(payload))
        return Number.MAX_SAFE_INTEGER;
    // order 只接受非负有限整数。
    const order = Number(payload[JOINED_GROUP_ORDER_KEY]);
    return Number.isFinite(order) && order >= 0
        ? Math.trunc(order)
        : Number.MAX_SAFE_INTEGER;
}
/** 将成员数限制为非负整数。 */
function normalizeMemberCount(value) {
    // count 防止异常负值和小数进入视图。
    const count = Number(value);
    return Number.isFinite(count) && count > 0 ? Math.trunc(count) : 0;
}
/** 判断未知值是否为可读取记录。 */
function isRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
/** 安全读取未知字符串字段并去除空白。 */
function readString(value) {
    return typeof value === 'string' ? value.trim() : '';
}
//# sourceMappingURL=joined-group-mappers.js.map