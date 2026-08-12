import { GroupRepository, } from '@im28/im-sdk/core';
import { createWebIMSyncError } from './sync-context.js';
/** 群简介业务上限由 shared owner 统一公开给平台表单。 */
export const IM_GROUP_INTRODUCTION_MAX_LENGTH = 500;
/** 在 Gateway 成功后合并群昵称并保留已有缓存字段。 */
export async function updateIMGroupName(context, options, gatewayClient) {
    // groupID 是 Gateway、Repository 与响应匹配的稳定身份。
    const groupID = options.groupID.trim();
    if (!groupID) {
        throw createWebIMSyncError('INVALID_GROUP_ID', 'Group name update requires a group ID.');
    }
    // name 沿用 RN 现有 trim 和非空合同。
    const name = options.name.trim();
    if (!name) {
        throw createWebIMSyncError('INVALID_GROUP_NAME', 'Group name cannot be empty.');
    }
    return updateIMGroupProfile(context, groupID, { name }, gatewayClient);
}
/** 在 Gateway 成功后合并群头像并保留已有缓存字段。 */
export async function updateIMGroupAvatar(context, options, gatewayClient) {
    // groupID 是 Gateway、Repository 与响应匹配的稳定身份。
    const groupID = options.groupID.trim();
    if (!groupID) {
        throw createWebIMSyncError('INVALID_GROUP_ID', 'Group avatar update requires a group ID.');
    }
    // avatarURL 必须来自平台上传端口，禁止 blob/file 本地地址进入 Gateway。
    const avatarURL = options.avatarURL.trim();
    if (!/^https?:\/\//i.test(avatarURL)) {
        throw createWebIMSyncError('INVALID_GROUP_AVATAR_URL', 'Group avatar update requires an uploaded HTTP URL.');
    }
    return updateIMGroupProfile(context, groupID, { avatarURL }, gatewayClient);
}
/** 在 Gateway 成功后合并群简介并保留已有缓存字段。 */
export async function updateIMGroupIntroduction(context, options, gatewayClient) {
    // groupID 是 Gateway、Repository 与响应匹配的稳定身份。
    const groupID = options.groupID.trim();
    if (!groupID) {
        throw createWebIMSyncError('INVALID_GROUP_ID', 'Group introduction update requires a group ID.');
    }
    // introduction 对齐 RN 现有 trim 与 500 字表单合同。
    const introduction = options.introduction.trim();
    if (!introduction) {
        throw createWebIMSyncError('INVALID_GROUP_INTRODUCTION', 'Group introduction cannot be empty.');
    }
    if (introduction.length > IM_GROUP_INTRODUCTION_MAX_LENGTH) {
        throw createWebIMSyncError('GROUP_INTRODUCTION_TOO_LONG', `Group introduction cannot exceed ${IM_GROUP_INTRODUCTION_MAX_LENGTH} characters.`);
    }
    return updateIMGroupProfile(context, groupID, { introduction }, gatewayClient);
}
/** 群资料局部更新统一权限、响应匹配和 success-only cache 收敛。 */
async function updateIMGroupProfile(context, groupID, patch, gatewayClient) {
    // existing 在远端调用前再次确认权限，防止上传期间角色发生变化。
    const existing = await requireIMGroupProfileUpdateAccess(context, groupID);
    // repository 是 Gateway 成功后的唯一 groups 写入 owner。
    const repository = new GroupRepository(context.database);
    // payload 保存当前账号角色和未参与本次更新的服务端字段。
    const payload = readGroupPayload(existing);
    // remote 只提交本次局部更新声明的群资料字段。
    const remote = await gatewayClient.updateGroup({
        group_id: groupID,
        ...(patch.name ? { title: patch.name } : {}),
        ...(patch.avatarURL ? { avatar_url: patch.avatarURL } : {}),
        ...(patch.introduction !== undefined ? { description: patch.introduction } : {}),
    });
    // remoteGroupID 必须精确匹配请求目标，防止错群写入。
    const remoteGroupID = remote.group_id?.trim() ?? '';
    // responseMatches 必须确认服务端接受了本次唯一局部字段。
    const responseMatches = remoteGroupID === groupID &&
        (!patch.name || remote.title?.trim() === patch.name) &&
        (!patch.avatarURL || remote.avatar_url?.trim() === patch.avatarURL) &&
        (patch.introduction === undefined || remote.description?.trim() === patch.introduction);
    if (!responseMatches) {
        throw createWebIMSyncError('GROUP_UPDATE_RESPONSE_MISMATCH', 'Gateway group update returned mismatched group data.');
    }
    // next 仅合并服务端返回字段并保留列表顺序、角色、简介和公告。
    const next = mergeUpdatedGroup(existing, payload, remote, patch);
    await repository.upsert(next);
    return next;
}
/** 在平台上传或 Gateway mutation 前校验缓存群与当前账号权限。 */
export async function requireIMGroupProfileUpdateAccess(context, groupID) {
    // normalizedGroupID 阻止空目标进入 Repository 或平台 I/O。
    const normalizedGroupID = groupID.trim();
    if (!normalizedGroupID) {
        throw createWebIMSyncError('INVALID_GROUP_ID', 'Group profile update requires a group ID.');
    }
    // repository 读取当前账号最新群角色快照。
    const repository = new GroupRepository(context.database);
    // existing 是失败时必须保持不变的群资料权威缓存。
    const existing = await repository.getByID(normalizedGroupID);
    if (!existing) {
        throw createWebIMSyncError('GROUP_NOT_CACHED', 'Group profile update requires a cached group.');
    }
    if (!canUpdateIMGroupProfile(readGroupPayload(existing))) {
        throw createWebIMSyncError('GROUP_PROFILE_PERMISSION_DENIED', 'Only a group owner or administrator can update group profile.');
    }
    return existing;
}
/** 解析当前账号群资料编辑权限，显式权限优先于角色回退。 */
export function canUpdateIMGroupProfile(payload) {
    // userPermission 兼容 my/list 返回的显式 capability 字段。
    const userPermission = isRecord(payload.user_permission) ? payload.user_permission : {};
    if (typeof userPermission.can_edit_group_info === 'boolean') {
        return userPermission.can_edit_group_info;
    }
    // memberRole 兼容 RN 当前 owner/admin 角色规则。
    const memberRole = isRecord(payload.member) ? payload.member.role : undefined;
    // permissionRole 兼容旧快照的 role_level 或 role 字段。
    const permissionRole = userPermission.role_level ?? userPermission.role;
    return isGroupManagerRole(memberRole ?? permissionRole);
}
/** 合并群资料局部成功响应，避免部分 Gateway DTO 清空既有群字段。 */
function mergeUpdatedGroup(existing, payload, remote, patch) {
    // mergedPayload 只让服务端实际返回字段覆盖旧 payload。
    const mergedPayload = {
        ...payload,
        ...remote,
        group_id: existing.groupID,
        ...(patch.name ? { title: patch.name } : {}),
        ...(patch.avatarURL ? { avatar_url: patch.avatarURL } : {}),
        ...(patch.introduction !== undefined ? { description: patch.introduction } : {}),
    };
    return {
        ...existing,
        ...(patch.name ? { name: patch.name } : {}),
        ...(patch.avatarURL ? { faceURL: patch.avatarURL } : {}),
        ...(typeof remote.member_count === 'number'
            ? { memberCount: Math.max(0, Math.trunc(remote.member_count)) }
            : {}),
        payload: mergedPayload,
    };
}
/** 从 Group Repository 快照读取 Gateway 群 payload。 */
function readGroupPayload(group) {
    return isRecord(group.payload) ? group.payload : group;
}
/** 判断 Gateway 角色是否具备 RN 现有群资料编辑权限。 */
function isGroupManagerRole(value) {
    // normalized 同时支持数值和字符串角色。
    const normalized = String(value ?? '').trim().toLowerCase();
    return value === 100 || value === 60 || normalized === 'owner' || normalized === 'admin';
}
/** 判断未知值是否为可读取对象。 */
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
//# sourceMappingURL=group-profile-update.js.map