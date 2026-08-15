import { GroupMemberRepository, GroupRepository } from '@im28/im-sdk/core';
import { resolveIMGroupManagementPermissions } from './group-management-permissions.js';
import { createWebIMSyncError, requireWebIMSyncContext, } from './sync-context.js';
/** 创建 RN、Web、Desktop 可复用的破坏性群生命周期 facade。 */
export function createIMGroupLifecycleSync(dependencies) {
    /** execute 保证同一 runtime 的生命周期动作进入共享 FIFO。 */
    const execute = (operation) => dependencies.mutationQueue
        ? dependencies.mutationQueue.enqueue(operation)
        : operation();
    return {
        leave: options => execute(() => leaveIMGroup(requireWebIMSyncContext(dependencies, 'Group leave'), options, dependencies.gatewayClient)),
        dismiss: options => execute(() => dismissIMGroup(requireWebIMSyncContext(dependencies, 'Group dismiss'), options, dependencies.gatewayClient)),
    };
}
/** 校验普通成员权限或群主管理员继任条件，并执行唯一一次 Gateway 退群写入。 */
export async function leaveIMGroup(context, options, gatewayClient) {
    /** facts 冻结远端写入前的群、成员和 capability。 */
    const facts = await requireLifecycleFacts(context, options.groupID);
    /** ownerSuccessor 对齐 RN：群主退出时由服务端自动转移给最早添加的管理员。 */
    const ownerSuccessor = selectIMEarliestGroupAdmin(facts.members);
    if (facts.currentMember.roleLevel === 100 && !ownerSuccessor) {
        throw createWebIMSyncError('GROUP_OWNER_LEAVE_REQUIRES_ADMIN', 'Group owner must assign at least one administrator before leaving.');
    }
    if (facts.currentMember.roleLevel !== 100 && !facts.permissions.canQuitGroup) {
        throw createWebIMSyncError('GROUP_LEAVE_PERMISSION_DENIED', 'Current member is not allowed to leave this group.');
    }
    /** remote 是本次用户动作唯一一次破坏性远端写入。 */
    const remote = await gatewayClient.leaveGroup({
        group_id: facts.group.groupID,
        ...(options.clearHistory !== undefined
            ? { clear_history: options.clearHistory }
            : {}),
    });
    return convergeLifecycle(context, 'leave', facts.group.groupID, remote);
}
/** 按管理员任期升序选择群主退出后的自动继任者，缺失时间保持原快照顺序。 */
export function selectIMEarliestGroupAdmin(candidates) {
    return candidates
        .filter(candidate => candidate.role === 'admin' || candidate.roleLevel === 60)
        .map((candidate, index) => ({ candidate, index }))
        .sort((left, right) => {
        /** leftTime 将无效或缺失时间排到明确任期之后。 */
        const leftTime = readAdminSinceTime(left.candidate.adminSince);
        /** rightTime 与 leftTime 使用相同解析规则。 */
        const rightTime = readAdminSinceTime(right.candidate.adminSince);
        return leftTime !== rightTime ? leftTime - rightTime : left.index - right.index;
    })[0]?.candidate ?? null;
}
/** 将 RFC3339 管理员任期转换为可排序时间，异常值按未知处理。 */
function readAdminSinceTime(value) {
    /** parsed 仅接收有限时间戳，避免无效日期干扰稳定顺序。 */
    const parsed = value?.trim() ? Date.parse(value) : Number.POSITIVE_INFINITY;
    return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}
/** 校验群主解散权限并执行唯一一次 Gateway 写入。 */
export async function dismissIMGroup(context, options, gatewayClient) {
    /** facts 冻结远端写入前的群、成员和 capability。 */
    const facts = await requireLifecycleFacts(context, options.groupID);
    if (facts.currentMember.roleLevel !== 100 || !facts.permissions.canDismissGroup) {
        throw createWebIMSyncError('GROUP_DISMISS_PERMISSION_DENIED', 'Only the current group owner can dismiss the group.');
    }
    /** remote 是本次用户动作唯一一次破坏性远端写入。 */
    const remote = await gatewayClient.dismissGroup({ group_id: facts.group.groupID });
    return convergeLifecycle(context, 'dismiss', facts.group.groupID, remote);
}
/** 读取生命周期所需群事实并复用共享权限投影。 */
async function requireLifecycleFacts(context, groupIDValue) {
    /** groupID 是 Gateway 和全部本地缓存表的共同分区键。 */
    const groupID = requireIdentity(groupIDValue);
    /** group 必须属于当前账号已同步群列表。 */
    const group = await new GroupRepository(context.database).getByID(groupID);
    if (!group) {
        throw createWebIMSyncError('GROUP_NOT_FOUND', 'Group lifecycle requires an existing cached group.');
    }
    /** memberRepository 复用同一账号数据库读取当前成员与自动继任者候选。 */
    const memberRepository = new GroupMemberRepository(context.database);
    /** currentMember 使用当前认证身份精确命中本群。 */
    const currentMember = await memberRepository.getByGroupAndUserID(groupID, context.userID);
    if (!currentMember) {
        throw createWebIMSyncError('CURRENT_GROUP_MEMBER_NOT_FOUND', 'Current group member is missing from cache.');
    }
    /** members 是群主退出前用于验证管理员继任条件的完整本地快照。 */
    const members = await memberRepository.listByGroupID(groupID);
    /** payload 提供服务端显式 user_permission，缺失时才按角色回退。 */
    const payload = readGroupPayload(group);
    /** permissions 是各客户端唯一的群生命周期 capability 来源。 */
    const permissions = resolveIMGroupManagementPermissions({
        userPermission: payload.user_permission,
        currentMemberRole: currentMember.roleLevel,
    });
    return { group, currentMember, members, permissions };
}
/** 严格校验远端群身份后在一个 SQLite 事务中收敛全部本地状态。 */
async function convergeLifecycle(context, operation, groupID, remote) {
    if (remote.group_id?.trim() !== groupID) {
        return { operation, groupID, cacheState: 'remote-only', removedConversationIDs: [] };
    }
    try {
        /** removedConversationIDs 证明事务实际覆盖的全部群会话。 */
        const removedConversationIDs = await new GroupRepository(context.database)
            .removeLifecycleState(groupID);
        return { operation, groupID, cacheState: 'local', removedConversationIDs };
    }
    catch {
        return { operation, groupID, cacheState: 'remote-only', removedConversationIDs: [] };
    }
}
/** 校验稳定非空群身份。 */
function requireIdentity(value) {
    /** normalized 避免空白身份进入远端请求或 SQL。 */
    const normalized = value.trim();
    if (!normalized) {
        throw createWebIMSyncError('INVALID_GROUP_ID', 'Group lifecycle requires a stable group ID.');
    }
    return normalized;
}
/** 兼容 Repository 将历史 raw_json 平铺到 Group 根对象的既有契约。 */
function readGroupPayload(group) {
    /** payload 存在时使用显式原始对象，否则读取平铺群事实。 */
    const payload = group.payload && typeof group.payload === 'object' && !Array.isArray(group.payload)
        ? group.payload
        : {};
    return Object.keys(payload).length
        ? payload
        : group;
}
//# sourceMappingURL=group-lifecycle.js.map