import { GroupMemberRepository, GroupRepository, } from '@im28/im-sdk/core';
import { resolveIMGroupManagementPermissions } from './group-management-permissions.js';
import { createWebIMSyncError } from './sync-context.js';
/** 校验权限和目标后执行一次 Gateway 写入及 success-only 本地事务。 */
export async function removeIMGroupMembers(context, options, gatewayClient) {
    /** groupID 是 Gateway 与当前账号 SQLite 共用的稳定分区键。 */
    const groupID = requireIdentity(options.groupID, 'INVALID_GROUP_ID');
    /** userIDs 去空、去重且保留页面选择顺序。 */
    const userIDs = normalizeUserIDs(options.userIDs);
    if (!userIDs.length) {
        throw createWebIMSyncError('INVALID_GROUP_MEMBER_TARGETS', 'Group member removal requires at least one stable member ID.');
    }
    if (userIDs.includes(context.userID)) {
        throw createWebIMSyncError('GROUP_MEMBER_SELF_REMOVAL_FORBIDDEN', 'Current member must leave the group through the group lifecycle action.');
    }
    /** groupRepository 同时拥有群资料和跨表成员移除事务。 */
    const groupRepository = new GroupRepository(context.database);
    /** group 必须属于当前账号 cache，页面不可凭路由伪造群身份。 */
    const group = await groupRepository.getByID(groupID);
    if (!group) {
        throw createWebIMSyncError('GROUP_NOT_FOUND', 'Group member removal requires an existing cached group.');
    }
    /** members 是权限角色和目标存在性的唯一当前快照。 */
    const members = await new GroupMemberRepository(context.database).listByGroupID(groupID);
    /** currentMember 为显式权限缺失时提供 RN 既有角色回退。 */
    const currentMember = members.find(member => member.userID === context.userID);
    if (!currentMember) {
        throw createWebIMSyncError('CURRENT_GROUP_MEMBER_NOT_FOUND', 'Current account is not present in the cached group member snapshot.');
    }
    /** permissions 复用跨端唯一 capability 投影。 */
    const permissions = resolveIMGroupManagementPermissions({
        userPermission: readGroupPayload(group).user_permission,
        currentMemberRole: currentMember.roleLevel,
    });
    if (!permissions.canRemoveMembers) {
        throw createWebIMSyncError('GROUP_MEMBER_REMOVAL_FORBIDDEN', 'Current member is not allowed to remove group members.');
    }
    /** targets 必须全部来自当前群，防止跨群或已退出身份写入。 */
    const targets = requireRemovableTargets(members, userIDs, currentMember.roleLevel);
    /** remote 是本 action 唯一一次远端写入。 */
    const remote = await gatewayClient.removeGroupMember({
        group_id: groupID,
        member_user_ids: userIDs,
    });
    /** remoteGroupID 必须和请求目标完全一致。 */
    const remoteGroupID = remote.group_id?.trim() ?? '';
    if (remoteGroupID !== groupID) {
        // 远端调用已经返回，错配响应按 partial-success 处理，禁止调用方重放写入。
        return { group, removedUserIDs: userIDs, cacheState: 'remote-only' };
    }
    /** nextGroup 合并服务端部分响应并保留未参与 mutation 的群字段。 */
    const nextGroup = mergeRemovalGroup(group, remote, targets.length);
    try {
        await groupRepository.applyMemberRemoval(nextGroup, userIDs);
        return { group: nextGroup, removedUserIDs: userIDs, cacheState: 'local' };
    }
    catch {
        // 远端已经成功，返回可识别 partial-success，禁止调用方重放 mutation。
        return { group: nextGroup, removedUserIDs: userIDs, cacheState: 'remote-only' };
    }
}
/** 对齐 RN：排除本人、群主，并限制管理员移除其他管理员。 */
export function filterIMRemovableGroupMembers(members, currentUserID) {
    /** normalizedCurrentUserID 阻止空账号误生成候选。 */
    const normalizedCurrentUserID = currentUserID.trim();
    if (!normalizedCurrentUserID)
        return [];
    /** currentMember 决定管理员目标限制。 */
    const currentMember = members.find(member => member.userID === normalizedCurrentUserID);
    /** currentIsAdmin 保持 RN 既有数值角色合同。 */
    const currentIsAdmin = currentMember?.roleLevel === 60;
    return members.filter(member => Boolean(member.userID?.trim()) &&
        member.userID !== normalizedCurrentUserID &&
        member.roleLevel !== 100 &&
        (!currentIsAdmin || member.roleLevel !== 60));
}
/** 清洗成员身份并按首次出现顺序去重。 */
function normalizeUserIDs(values) {
    /** userIDs 只保留非空稳定身份。 */
    const userIDs = values.map(value => value.trim()).filter(Boolean);
    return [...new Set(userIDs)];
}
/** 校验所有目标存在、不是群主，并维持管理员不能移除管理员。 */
function requireRemovableTargets(members, userIDs, currentRoleLevel) {
    /** membersByID 用稳定身份阻止跨群目标。 */
    const membersByID = new Map(members.map(member => [member.userID, member]));
    /** targets 保持请求顺序供人数回退计算。 */
    const targets = userIDs.map(userID => membersByID.get(userID));
    if (targets.some(target => !target)) {
        throw createWebIMSyncError('GROUP_MEMBER_TARGET_NOT_FOUND', 'Every removal target must exist in the cached group member snapshot.');
    }
    /** stableTargets 已通过完整存在性判断。 */
    const stableTargets = targets;
    if (stableTargets.some(target => target.roleLevel === 100)) {
        throw createWebIMSyncError('GROUP_OWNER_REMOVAL_FORBIDDEN', 'The group owner cannot be removed as a member.');
    }
    if (currentRoleLevel === 60 &&
        stableTargets.some(target => target.roleLevel === 60)) {
        throw createWebIMSyncError('GROUP_ADMIN_REMOVAL_FORBIDDEN', 'An administrator cannot remove another administrator.');
    }
    return stableTargets;
}
/** 合并移除响应并在服务端未回人数时做有界本地校准。 */
function mergeRemovalGroup(existing, remote, removedCount) {
    /** existingPayload 保留列表顺序、权限和公告等未返回字段。 */
    const existingPayload = readGroupPayload(existing);
    /** fallbackCount 只在 Gateway 未返回人数时使用当前快照减法。 */
    const fallbackCount = Math.max(0, (existing.memberCount ?? 0) - removedCount);
    /** memberCount 优先信任服务端非负有限值。 */
    const memberCount = Number.isFinite(remote.member_count)
        ? Math.max(0, Math.trunc(remote.member_count ?? 0))
        : fallbackCount;
    /** faceURL 仅在远端或旧缓存存在时写入可选字段。 */
    const faceURL = remote.avatar_url?.trim() || existing.faceURL;
    return {
        ...existing,
        name: remote.title?.trim() || existing.name,
        ...(faceURL === undefined ? {} : { faceURL }),
        memberCount,
        payload: {
            ...existingPayload,
            ...remote,
            group_id: existing.groupID,
            member_count: memberCount,
        },
    };
}
/** 读取 Repository 保存的 Gateway 群 payload。 */
function readGroupPayload(group) {
    return group.payload && typeof group.payload === 'object' && !Array.isArray(group.payload)
        ? group.payload
        : group;
}
/** 校验非空稳定身份并保留调用点错误码。 */
function requireIdentity(value, code) {
    /** normalized 阻止空身份进入 Gateway 或 SQL。 */
    const normalized = value.trim();
    if (!normalized)
        throw createWebIMSyncError(code, 'A stable identity is required.');
    return normalized;
}
//# sourceMappingURL=group-member-removal.js.map