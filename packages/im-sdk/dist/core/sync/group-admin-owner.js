import { GroupMemberRepository, GroupRepository, } from '@im28/im-sdk/core';
import { resolveIMGroupManagementPermissions } from './group-management-permissions.js';
import { createWebIMSyncError } from './sync-context.js';
/** 群管理员数量上限由 shared mutation 和各端展示共同消费。 */
export const IM_GROUP_ADMIN_LIMIT = 10;
/** 校验群主权限和目标成员后执行一次设置管理员写入。 */
export async function setIMGroupAdmins(context, options, gatewayClient) {
    return changeGroupAdmins(context, options, gatewayClient, 'admin');
}
/** 校验群主权限和目标管理员后执行一次取消管理员写入。 */
export async function cancelIMGroupAdmins(context, options, gatewayClient) {
    return changeGroupAdmins(context, options, gatewayClient, 'member');
}
/** 校验群主权限和新群主后执行一次群主转让写入。 */
export async function transferIMGroupOwner(context, options, gatewayClient) {
    /** groupID 是缓存和 Gateway 共用的稳定群身份。 */
    const groupID = requireIdentity(options.groupID, 'INVALID_GROUP_ID');
    /** newOwnerUserID 禁止空身份进入远端 mutation。 */
    const newOwnerUserID = requireIdentity(options.newOwnerUserID, 'INVALID_NEW_OWNER_ID');
    /** facts 在远端写入前冻结权限和成员目标。 */
    const facts = await requireOwnerFacts(context, groupID, 'transfer');
    if (newOwnerUserID === context.userID) {
        throw createWebIMSyncError('GROUP_OWNER_TRANSFER_SELF_FORBIDDEN', 'Current owner cannot transfer ownership to itself.');
    }
    /** target 必须是当前活跃成员快照中的非群主成员。 */
    const target = facts.members.find(member => member.userID === newOwnerUserID);
    if (!target) {
        throw createWebIMSyncError('GROUP_OWNER_TRANSFER_TARGET_NOT_FOUND', 'New owner must exist in the cached group member snapshot.');
    }
    if (target.roleLevel !== 20 && target.roleLevel !== 60) {
        throw createWebIMSyncError('GROUP_OWNER_TRANSFER_TARGET_INVALID', 'New owner must be an active non-owner group member.');
    }
    /** remote 是本 action 唯一一次远端写入。 */
    const remote = await gatewayClient.transferGroupOwner({
        group_id: groupID,
        new_owner_user_id: newOwnerUserID,
    });
    /** nextGroup 合并服务端群事实并强制记录已确认的新群主身份。 */
    const nextGroup = mergeRoleGroup(facts.group, remote, newOwnerUserID);
    if ((remote.group_id?.trim() ?? '') !== groupID) {
        return {
            group: nextGroup,
            previousOwnerUserID: context.userID,
            newOwnerUserID,
            cacheState: 'remote-only',
        };
    }
    /** previousOwner 是当前账号角色降级后的缓存事实。 */
    const previousOwner = patchMemberRole(facts.currentMember, 'member');
    /** nextOwner 是目标成员升级后的缓存事实。 */
    const nextOwner = patchMemberRole(target, 'owner');
    try {
        await new GroupRepository(context.database).applyMemberRoleChanges(nextGroup, [previousOwner, nextOwner]);
        return {
            group: nextGroup,
            previousOwnerUserID: context.userID,
            newOwnerUserID,
            cacheState: 'local',
        };
    }
    catch {
        return {
            group: nextGroup,
            previousOwnerUserID: context.userID,
            newOwnerUserID,
            cacheState: 'remote-only',
        };
    }
}
/** 过滤可设置为管理员的普通成员，页面不得复制角色表。 */
export function filterIMGroupAdminCandidates(candidates) {
    return candidates.filter(candidate => normalizeCandidateRole(candidate) === 'member');
}
/** 过滤可承接群主的活跃非群主成员，并排除当前账号。 */
export function filterIMGroupOwnerTransferCandidates(candidates, currentUserID) {
    /** normalizedCurrentUserID 防止空格身份绕过本人排除。 */
    const normalizedCurrentUserID = currentUserID.trim();
    return candidates.filter(candidate => {
        /** role 只接受普通成员或管理员。 */
        const role = normalizeCandidateRole(candidate);
        return candidate.userID.trim() !== normalizedCurrentUserID && (role === 'member' || role === 'admin');
    });
}
/** 执行设置或取消管理员的共用校验、远端写入和本地事务。 */
async function changeGroupAdmins(context, options, gatewayClient, role) {
    /** groupID 是缓存和 Gateway 共用的稳定群身份。 */
    const groupID = requireIdentity(options.groupID, 'INVALID_GROUP_ID');
    /** userIDs 去空去重，并保留页面批量选择顺序。 */
    const userIDs = normalizeUserIDs(options.userIDs);
    if (!userIDs.length) {
        throw createWebIMSyncError('INVALID_GROUP_ADMIN_TARGETS', 'Administrator change requires at least one stable member ID.');
    }
    if (userIDs.includes(context.userID)) {
        throw createWebIMSyncError('GROUP_ADMIN_SELF_FORBIDDEN', 'Current owner cannot change its own administrator role.');
    }
    /** facts 在远端写入前冻结群主权限和全部成员快照。 */
    const facts = await requireOwnerFacts(context, groupID, 'admin');
    /** targets 必须全部存在，禁止部分成功。 */
    const targets = userIDs.map(userID => facts.members.find(member => member.userID === userID));
    if (targets.some(target => !target)) {
        throw createWebIMSyncError('GROUP_ADMIN_TARGET_NOT_FOUND', 'Every administrator target must exist in the cached group member snapshot.');
    }
    /** stableTargets 已通过完整存在性验证。 */
    const stableTargets = targets;
    if (role === 'admin') {
        if (stableTargets.some(target => target.roleLevel !== 20)) {
            throw createWebIMSyncError('GROUP_ADMIN_TARGET_NOT_MEMBER', 'New administrators must be normal group members.');
        }
        /** currentAdminCount 对齐 RN 最多十个管理员约束。 */
        const currentAdminCount = facts.members.filter(member => member.roleLevel === 60).length;
        if (currentAdminCount + stableTargets.length > IM_GROUP_ADMIN_LIMIT) {
            throw createWebIMSyncError('GROUP_ADMIN_LIMIT_EXCEEDED', 'A group can have at most 10 administrators.');
        }
    }
    else if (stableTargets.some(target => target.roleLevel !== 60)) {
        throw createWebIMSyncError('GROUP_ADMIN_TARGET_NOT_ADMIN', 'Cancelled targets must be group administrators.');
    }
    /** remote 是本 action 唯一一次批量远端写入。 */
    const remote = role === 'admin'
        ? await gatewayClient.setGroupAdmin({ group_id: groupID, member_user_ids: userIDs })
        : await gatewayClient.cancelGroupAdmin({ group_id: groupID, member_user_ids: userIDs });
    /** nextGroup 保留未返回字段并合并服务端事实。 */
    const nextGroup = mergeRoleGroup(facts.group, remote);
    if ((remote.group_id?.trim() ?? '') !== groupID) {
        return { group: nextGroup, changedUserIDs: userIDs, role, cacheState: 'remote-only' };
    }
    /** nextMembers 只修改服务端已经确认的目标角色。 */
    const nextMembers = stableTargets.map(member => patchMemberRole(member, role));
    try {
        await new GroupRepository(context.database).applyMemberRoleChanges(nextGroup, nextMembers);
        return { group: nextGroup, changedUserIDs: userIDs, role, cacheState: 'local' };
    }
    catch {
        return { group: nextGroup, changedUserIDs: userIDs, role, cacheState: 'remote-only' };
    }
}
/** 读取并校验当前群主、群缓存和管理 capability。 */
async function requireOwnerFacts(context, groupID, capability) {
    /** group 必须来自当前账号缓存，页面不可伪造群身份。 */
    const group = await new GroupRepository(context.database).getByID(groupID);
    if (!group)
        throw createWebIMSyncError('GROUP_NOT_FOUND', 'Group management requires a cached group.');
    /** members 提供当前账号角色和 mutation 目标的唯一事实。 */
    const members = await new GroupMemberRepository(context.database).listByGroupID(groupID);
    /** currentMember 必须在当前群成员快照中。 */
    const currentMember = members.find(member => member.userID === context.userID);
    if (!currentMember) {
        throw createWebIMSyncError('CURRENT_GROUP_MEMBER_NOT_FOUND', 'Current account is not present in the cached group member snapshot.');
    }
    /** permissions 优先消费服务端显式 capability，缺失时才按角色回退。 */
    const permissions = resolveIMGroupManagementPermissions({
        userPermission: readGroupPayload(group).user_permission,
        currentMemberRole: currentMember.roleLevel,
    });
    /** allowed 与页面共用同一权限 DTO，避免双轨。 */
    const allowed = capability === 'admin'
        ? permissions.canManageAdmins
        : permissions.canTransferOwner;
    if (currentMember.roleLevel !== 100 || !allowed) {
        throw createWebIMSyncError('GROUP_OWNER_PERMISSION_REQUIRED', 'Only the group owner can perform this operation.');
    }
    return { group, members, currentMember };
}
/** 将部分群响应合并进旧缓存，并可固定新群主身份。 */
function mergeRoleGroup(existing, remote, ownerUserID) {
    /** existingPayload 保留公告、权限和顺序等未返回字段。 */
    const existingPayload = readGroupPayload(existing);
    /** faceURL 仅在远端或旧缓存存在时写入可选字段。 */
    const faceURL = remote.avatar_url?.trim() || existing.faceURL;
    return {
        ...existing,
        name: remote.title?.trim() || existing.name,
        ...(faceURL === undefined ? {} : { faceURL }),
        ...(Number.isFinite(remote.member_count) ? { memberCount: Math.max(0, Math.trunc(remote.member_count ?? 0)) } : {}),
        payload: {
            ...existingPayload,
            ...remote,
            group_id: existing.groupID,
            ...(ownerUserID ? {
                owner_user_id: ownerUserID,
                user_permission: remote.user_permission ?? { role: 'member', role_level: 20 },
            } : {}),
        },
    };
}
/** 将成员角色更新为服务端已确认值并保留其余资料字段。 */
function patchMemberRole(member, role) {
    /** roleLevel 是共享 Repository 的规范化角色事实。 */
    const roleLevel = role === 'owner' ? 100 : role === 'admin' ? 60 : 20;
    /** payload 保留 OpenAPI 未建模的成员资料。 */
    const payload = readRecord(member.payload) ?? {};
    /** adminSince 从旧记录中剥离，取消管理员时不能遗留任期事实。 */
    const { adminSince: previousAdminSince, ...memberWithoutAdminSince } = member;
    return {
        ...memberWithoutAdminSince,
        roleLevel,
        ...(role === 'admin' && previousAdminSince ? { adminSince: previousAdminSince } : {}),
        payload: { ...payload, role, role_level: roleLevel },
    };
}
/** 清洗成员身份并按首次出现顺序去重。 */
function normalizeUserIDs(values) {
    /** userIDs 只保留非空稳定身份。 */
    const userIDs = values.map(value => value.trim()).filter(Boolean);
    return [...new Set(userIDs)];
}
/** 将页面 DTO 或 Repository 数值角色收敛为候选枚举。 */
function normalizeCandidateRole(candidate) {
    /** normalized 优先读取页面规范角色，再兼容 Repository 数值。 */
    const normalized = candidate.role ?? String(candidate.roleLevel ?? '').trim().toLowerCase();
    if (normalized === 'owner' || normalized === '100')
        return 'owner';
    if (normalized === 'admin' || normalized === '60')
        return 'admin';
    if (normalized === 'member' || normalized === '20')
        return 'member';
    return 'unknown';
}
/** 读取 Repository 保存的 Gateway 群 payload。 */
function readGroupPayload(group) {
    return readRecord(group.payload) ?? group;
}
/** 将未知值收窄为普通对象。 */
function readRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : undefined;
}
/** 校验非空稳定身份并保留调用点错误码。 */
function requireIdentity(value, code) {
    /** normalized 阻止空身份进入 Gateway 或 SQL。 */
    const normalized = value.trim();
    if (!normalized)
        throw createWebIMSyncError(code, 'A stable identity is required.');
    return normalized;
}
//# sourceMappingURL=group-admin-owner.js.map