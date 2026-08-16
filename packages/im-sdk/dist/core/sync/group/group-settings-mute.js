import { GroupMemberRepository, GroupRepository, } from '@im28/im-sdk/core';
import { resolveIMGroupManagementPermissions } from './group-management-permissions.js';
import { createWebIMSyncError, requireWebIMSyncContext, } from '../sync-context.js';
/** 创建跨 RN、Web、Desktop 可复用的群设置与禁言 facade。 */
export function createIMGroupManagementSync(dependencies) {
    /** execute 让三类 mutation 与其他同步操作共享同一个 FIFO。 */
    const execute = (operation) => dependencies.mutationQueue
        ? dependencies.mutationQueue.enqueue(operation)
        : operation();
    return {
        updateSettings: options => execute(() => updateIMGroupSettings(requireWebIMSyncContext(dependencies, 'Group settings update'), options, dependencies.gatewayClient)),
        updateMute: options => execute(() => updateIMGroupMute(requireWebIMSyncContext(dependencies, 'Group mute update'), options, dependencies.gatewayClient)),
        updateMemberMute: options => execute(() => updateIMGroupMemberMute(requireWebIMSyncContext(dependencies, 'Group member mute update'), options, dependencies.gatewayClient)),
    };
}
/** 校验群主设置权限并执行一次群设置写入。 */
export async function updateIMGroupSettings(context, options, gatewayClient) {
    /** facts 冻结本次远端写入前的群和当前成员事实。 */
    const facts = await requireGroupFacts(context, options.groupID, 'canManageAdmins');
    /** request 只包含调用方明确传入的受支持字段。 */
    const request = buildSettingsRequest(facts.group.groupID, options);
    /** remote 是本次 action 唯一一次远端 mutation。 */
    const remote = await gatewayClient.updateGroupSetting(request);
    return convergeGroupMutation(context, facts.group, remote, request);
}
/** 校验群禁言权限并执行一次群禁言写入。 */
export async function updateIMGroupMute(context, options, gatewayClient) {
    /** facts 使用 shared capability，不在客户端猜测角色。 */
    const facts = await requireGroupFacts(context, options.groupID, 'canMuteAll');
    if (options.muteAll === undefined && options.muteMember === undefined) {
        throw createWebIMSyncError('EMPTY_GROUP_MUTE_PATCH', 'Group mute update requires at least one explicit field.');
    }
    /** request 不自动补另一个开关，避免覆盖服务端未修改状态。 */
    const request = {
        group_id: facts.group.groupID,
        ...(options.muteAll !== undefined ? { mute_all: options.muteAll } : {}),
        ...(options.muteMember !== undefined ? { mute_member: options.muteMember } : {}),
    };
    /** remote 是本次 action 唯一一次远端 mutation。 */
    const remote = await gatewayClient.updateGroupMute(request);
    return convergeGroupMutation(context, facts.group, remote, request);
}
/** 校验目标普通成员和禁言时间后执行一次成员禁言写入。 */
export async function updateIMGroupMemberMute(context, options, gatewayClient) {
    /** facts 使用 canMuteMembers 的显式权限或 RN 同语义回退。 */
    const facts = await requireGroupFacts(context, options.groupID, 'canMuteMembers');
    /** userID 禁止空身份、自身及群主管理员进入 mutation。 */
    const userID = requireIdentity(options.userID, 'INVALID_GROUP_MEMBER_ID');
    if (userID === context.userID) {
        throw createWebIMSyncError('GROUP_MEMBER_MUTE_SELF_FORBIDDEN', 'Current member cannot mute itself.');
    }
    /** target 必须存在于当前群缓存，防止跨群成员写入。 */
    const target = await new GroupMemberRepository(context.database)
        .getByGroupAndUserID(facts.group.groupID, userID);
    if (!target || target.roleLevel !== 20) {
        throw createWebIMSyncError('GROUP_MEMBER_MUTE_TARGET_INVALID', 'Mute target must be an active normal group member.');
    }
    /** muteUntil 为空表示解除，否则必须是未来的 RFC3339 时间。 */
    const muteUntil = normalizeMuteUntil(options.muteUntil);
    /** remote 是本次 action 唯一一次远端 mutation。 */
    const remote = await gatewayClient.updateGroupMemberMute({
        group_id: facts.group.groupID,
        member_user_id: userID,
        mute_until: muteUntil,
    });
    /** nextMember 保留未修改原始字段，并以本次确认 patch 为准。 */
    const nextMember = mergeMemberMute(target, remote, muteUntil);
    if (remote.group_id?.trim() !== facts.group.groupID || remote.user_id?.trim() !== userID) {
        return { member: nextMember, cacheState: 'remote-only' };
    }
    try {
        await new GroupMemberRepository(context.database).upsert(nextMember);
        return { member: nextMember, cacheState: 'local' };
    }
    catch {
        return { member: nextMember, cacheState: 'remote-only' };
    }
}
/** 读取群、当前成员和共享 permission，并按字段能力 fail-closed。 */
async function requireGroupFacts(context, groupIDValue, permission) {
    /** groupID 是 Gateway、群缓存和成员缓存的共同分区键。 */
    const groupID = requireIdentity(groupIDValue, 'INVALID_GROUP_ID');
    /** group 必须属于当前账号已同步群列表。 */
    const group = await new GroupRepository(context.database).getByID(groupID);
    if (!group)
        throw createWebIMSyncError('GROUP_NOT_FOUND', 'Group mutation requires an existing cached group.');
    /** currentMember 提供服务端缺少显式 permission 时的角色回退。 */
    const currentMember = await new GroupMemberRepository(context.database)
        .getByGroupAndUserID(groupID, context.userID);
    if (!currentMember)
        throw createWebIMSyncError('CURRENT_GROUP_MEMBER_NOT_FOUND', 'Current group member is missing from cache.');
    /** payload 保存 Gateway user_permission 原始快照。 */
    const payload = readGroupPayload(group);
    /** permissions 是各端唯一的 capability 解析规则。 */
    const permissions = resolveIMGroupManagementPermissions({
        userPermission: payload.user_permission,
        currentMemberRole: currentMember.roleLevel,
    });
    if (!permissions[permission]) {
        throw createWebIMSyncError('GROUP_MANAGEMENT_PERMISSION_DENIED', `Group mutation requires ${permission}.`);
    }
    return { group, currentMember };
}
/** 构造严格群设置 patch，并校验发言频率组合。 */
function buildSettingsRequest(groupID, options) {
    /** seconds 只在明确传值时进行白名单校验。 */
    const seconds = options.speechFrequencySeconds;
    if (seconds !== undefined && ![30, 60, 180, 300, 600, 1800, 3600].includes(seconds)) {
        throw createWebIMSyncError('INVALID_GROUP_SPEECH_FREQUENCY', 'Unsupported group speech frequency.');
    }
    /** request 保留 undefined=不修改的 OpenAPI 语义。 */
    const request = {
        group_id: groupID,
        ...(options.joinApprovalRequired !== undefined ? { join_approval_required: options.joinApprovalRequired } : {}),
        ...(options.allowMemberInvite !== undefined ? { allow_member_invite: options.allowMemberInvite } : {}),
        ...(options.allowMemberAddFriend !== undefined ? { allow_member_add_friend: options.allowMemberAddFriend } : {}),
        ...(options.allowMemberNickname !== undefined ? { allow_member_nickname: options.allowMemberNickname } : {}),
        ...(options.speechFrequencyEnabled !== undefined ? { send_frequency_enabled: options.speechFrequencyEnabled } : {}),
        ...(seconds !== undefined ? { send_frequency_seconds: seconds } : {}),
    };
    if (Object.keys(request).length === 1) {
        throw createWebIMSyncError('EMPTY_GROUP_SETTINGS_PATCH', 'Group settings update requires at least one explicit field.');
    }
    return request;
}
/** 严格校验回包群身份后 success-only 写回缓存。 */
async function convergeGroupMutation(context, current, remote, patch) {
    /** nextGroup 合并旧 raw、服务端事实和本次确认 patch，避免清空无关字段。 */
    const nextGroup = mergeGroup(current, remote, patch);
    if (remote.group_id?.trim() !== current.groupID) {
        return { group: nextGroup, cacheState: 'remote-only' };
    }
    try {
        await new GroupRepository(context.database).upsert(nextGroup);
        return { group: nextGroup, cacheState: 'local' };
    }
    catch {
        return { group: nextGroup, cacheState: 'remote-only' };
    }
}
/** 合并群资料时只更新服务端返回或本次明确提交字段。 */
function mergeGroup(current, remote, patch) {
    /** currentPayload 是需要保留的未修改服务端事实。 */
    const currentPayload = readGroupPayload(current);
    /** payload 按旧值、远端值、确认 patch 的优先级合并。 */
    const payload = { ...currentPayload, ...remote, ...patch, group_id: current.groupID };
    return {
        ...current,
        name: remote.title?.trim() || current.name,
        ...(remote.avatar_url !== undefined
            ? { faceURL: remote.avatar_url.trim() }
            : current.faceURL !== undefined
                ? { faceURL: current.faceURL }
                : {}),
        ...(remote.member_count !== undefined
            ? { memberCount: remote.member_count }
            : current.memberCount !== undefined
                ? { memberCount: current.memberCount }
                : {}),
        payload,
    };
}
/** 合并成员禁言回包并保留角色、昵称等无关字段。 */
function mergeMemberMute(current, remote, muteUntil) {
    /** payload 保留成员原始字段并以确认值覆盖禁言状态。 */
    const payload = {
        ...readRecord(current.payload),
        ...remote,
        group_id: current.groupID,
        user_id: current.userID,
        mute_until: muteUntil,
        is_muted: Boolean(muteUntil),
    };
    return { ...current, payload };
}
/** 规范成员禁言时间；空值只表示解除。 */
function normalizeMuteUntil(value) {
    /** normalized 禁止空白时间进入服务端。 */
    const normalized = value.trim();
    if (!normalized)
        return '';
    /** time 必须可解析且晚于当前时刻。 */
    const time = Date.parse(normalized);
    if (!Number.isFinite(time) || time <= Date.now()) {
        throw createWebIMSyncError('INVALID_GROUP_MEMBER_MUTE_UNTIL', 'Member mute expiry must be a future RFC3339 timestamp.');
    }
    return new Date(time).toISOString();
}
/** 校验稳定非空身份。 */
function requireIdentity(value, code) {
    /** normalized 避免空白身份绕过校验。 */
    const normalized = value.trim();
    if (!normalized)
        throw createWebIMSyncError(code, 'Group mutation requires a stable identity.');
    return normalized;
}
/** 非对象 payload 以空对象参与 merge。 */
function readRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : {};
}
/** 兼容 Repository 将历史 raw_json 平铺到 Group 根对象的既有契约。 */
function readGroupPayload(group) {
    /** payload 存在时使用显式原始对象，否则读取平铺群事实。 */
    const payload = readRecord(group.payload);
    return Object.keys(payload).length
        ? payload
        : group;
}
//# sourceMappingURL=group-settings-mute.js.map