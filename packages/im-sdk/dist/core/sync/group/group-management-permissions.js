/** 按显式 capability、角色回退、fail-closed 顺序解析群管理权限。 */
export function resolveIMGroupManagementPermissions(input) {
    /** permission 存在时保持 RN 当前逐项显式授权语义。 */
    const permission = readRecord(input.userPermission);
    if (permission)
        return resolveExplicitPermissions(permission);
    /** role 只在服务端没有显式 permission 对象时参与旧快照回退。 */
    return roleFallback(normalizeRole(input.currentMemberRole));
}
/** 从服务端 permission 对象解析逐项能力，缺失字段保持关闭。 */
function resolveExplicitPermissions(permission) {
    /** role 兼容数值、字符串和旧 role_level 字段。 */
    const role = normalizeRole(permission.roleLevel ?? permission.role_level ?? permission.role);
    /** fallback 对齐 RN：显式 owner 可回退；其他已知角色只保留退群。 */
    const fallback = role === 'owner'
        ? roleFallback('owner')
        : emptyPermissions(role !== 'unknown');
    /** granted 兼容服务端 permissions 字符串集合。 */
    const granted = new Set(readStringList(permission.permissions));
    /** can 依次读取 camel、snake 与 permissions 集合。 */
    const can = (camelKey, ...snakeKeys) => readBoolean(permission[camelKey]) ??
        snakeKeys.reduce((value, key) => value ?? readBoolean(permission[key]), undefined) ??
        (granted.has(camelKey) || snakeKeys.some(key => granted.has(key))
            ? true
            : undefined);
    /** resolved 不把缺失 capability 猜成管理员授权。 */
    const resolved = {
        canEditGroupInfo: can('canEditGroupInfo', 'can_edit_group_info', 'can_update_profile') ?? fallback.canEditGroupInfo,
        canEditAnnouncement: can('canEditAnnouncement', 'can_edit_announcement') ?? fallback.canEditAnnouncement,
        canInviteMembers: can('canInviteMembers', 'can_invite_members', 'can_invite_member') ?? fallback.canInviteMembers,
        canRemoveMembers: can('canRemoveMembers', 'can_remove_members', 'can_remove_member') ?? fallback.canRemoveMembers,
        canAuditApplications: can('canAuditApplications', 'can_audit_applications', 'can_audit_application') ?? fallback.canAuditApplications,
        canOpenGroupManage: false,
        canManageAdmins: can('canManageAdmins', 'can_manage_admins') ?? fallback.canManageAdmins,
        canTransferOwner: can('canTransferOwner', 'can_transfer_owner') ?? fallback.canTransferOwner,
        canDismissGroup: can('canDismissGroup', 'can_dismiss_group') ?? fallback.canDismissGroup,
        canQuitGroup: can('canQuitGroup', 'can_quit_group') ?? fallback.canQuitGroup,
        canMuteAll: can('canMuteAll', 'can_mute_all') ?? fallback.canMuteAll,
        canMuteMembers: can('canMuteMembers', 'can_mute_members', 'can_mute_member') ?? fallback.canMuteMembers,
        canClearMessages: can('canClearMessages', 'can_clear_messages', 'can_clear_message') ?? fallback.canClearMessages,
        canMentionAll: can('canMentionAll', 'can_mention_all') ?? fallback.canMentionAll,
    };
    return {
        ...resolved,
        canOpenGroupManage: (can('canOpenGroupManage', 'can_open_group_manage') ?? fallback.canOpenGroupManage) ||
            resolved.canManageAdmins || resolved.canInviteMembers ||
            resolved.canRemoveMembers || resolved.canAuditApplications ||
            resolved.canMuteAll || resolved.canMuteMembers || resolved.canClearMessages,
    };
}
/** 按 RN 当前 owner/admin/member 默认规则建立旧快照回退。 */
function roleFallback(role) {
    /** manager 只包含群主和管理员。 */
    const manager = role === 'owner' || role === 'admin';
    /** owner 持有管理员管理、转让、解散和 mute 权限。 */
    const owner = role === 'owner';
    return {
        canEditGroupInfo: manager,
        canEditAnnouncement: owner,
        canInviteMembers: manager,
        canRemoveMembers: manager,
        canAuditApplications: manager,
        canOpenGroupManage: manager,
        canManageAdmins: owner,
        canTransferOwner: owner,
        canDismissGroup: owner,
        canQuitGroup: role === 'admin' || role === 'member',
        canMuteAll: owner,
        canMuteMembers: owner,
        canClearMessages: manager,
        canMentionAll: manager,
    };
}
/** 建立显式 permission 缺字段时的 fail-closed 快照。 */
function emptyPermissions(canQuitGroup) {
    return {
        canEditGroupInfo: false,
        canEditAnnouncement: false,
        canInviteMembers: false,
        canRemoveMembers: false,
        canAuditApplications: false,
        canOpenGroupManage: false,
        canManageAdmins: false,
        canTransferOwner: false,
        canDismissGroup: false,
        canQuitGroup,
        canMuteAll: false,
        canMuteMembers: false,
        canClearMessages: false,
        canMentionAll: false,
    };
}
/** 将服务端数值或字符串角色收敛为中性枚举。 */
function normalizeRole(value) {
    /** normalized 支持 Gateway 数值字符串。 */
    const normalized = String(value ?? '').trim().toLowerCase();
    if (value === 100 || normalized === '100' || normalized === 'owner')
        return 'owner';
    if (value === 60 || normalized === '60' || normalized === 'admin')
        return 'admin';
    if (value === 20 || normalized === '20' || normalized === 'member')
        return 'member';
    return 'unknown';
}
/** 只接受普通对象作为显式 permission 快照。 */
function readRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : null;
}
/** 只读取服务端明确布尔值。 */
function readBoolean(value) {
    return typeof value === 'boolean' ? value : undefined;
}
/** 过滤 permissions 中的非字符串噪音。 */
function readStringList(value) {
    return Array.isArray(value)
        ? value.filter((item) => typeof item === 'string')
        : [];
}
//# sourceMappingURL=group-management-permissions.js.map