import { FriendshipRepository, GroupMemberRepository, GroupRepository, } from '@im28/im-sdk/core';
import { resolveIMGroupManagementPermissions } from './group-management-permissions.js';
import { createWebIMSyncError } from './sync-context.js';
/** 校验权限、好友和群成员快照后执行唯一一次 Gateway 邀请写入。 */
export async function inviteIMGroupMembers(context, options, gatewayClient) {
    /** groupID 是群 cache 和 Gateway 共用的稳定身份。 */
    const groupID = requireIdentity(options.groupID, 'INVALID_GROUP_ID');
    /** userIDs 去空、去重并保留页面选择顺序。 */
    const userIDs = normalizeUserIDs(options.userIDs);
    if (!userIDs.length) {
        throw createWebIMSyncError('INVALID_GROUP_INVITE_TARGETS', 'Group invitation requires at least one stable friend ID.');
    }
    if (userIDs.includes(context.userID)) {
        throw createWebIMSyncError('GROUP_INVITE_SELF_FORBIDDEN', 'Current account cannot be invited to its own group.');
    }
    /** groupRepository 绑定当前账号群资料和 success-only 更新。 */
    const groupRepository = new GroupRepository(context.database);
    /** group 必须来自当前账号 cache，页面不可伪造群身份。 */
    const group = await groupRepository.getByID(groupID);
    if (!group) {
        throw createWebIMSyncError('GROUP_NOT_FOUND', 'Group invitation requires a cached group.');
    }
    /** members 同时提供当前角色和已入群目标集合。 */
    const members = await new GroupMemberRepository(context.database).listByGroupID(groupID);
    /** currentMember 是角色回退和当前群身份的唯一事实。 */
    const currentMember = members.find(member => member.userID === context.userID);
    if (!currentMember) {
        throw createWebIMSyncError('CURRENT_GROUP_MEMBER_NOT_FOUND', 'Current account is not present in the cached group member snapshot.');
    }
    /** payload 保留服务端 capability 和审核设置。 */
    const payload = readGroupPayload(group);
    /** permissions 对齐群设置页与 RN 的 capability/角色回退。 */
    const permissions = resolveIMGroupManagementPermissions({
        userPermission: payload.user_permission,
        currentMemberRole: currentMember.roleLevel,
    });
    if (!permissions.canInviteMembers) {
        throw createWebIMSyncError('GROUP_MEMBER_INVITATION_FORBIDDEN', 'Current member is not allowed to invite group members.');
    }
    /** memberIDs 阻止重复邀请当前已在群内的身份。 */
    const memberIDs = new Set(members.map(member => member.userID));
    if (userIDs.some(userID => memberIDs.has(userID))) {
        throw createWebIMSyncError('GROUP_INVITE_TARGET_ALREADY_MEMBER', 'Every invitation target must be outside the cached group member snapshot.');
    }
    await requireInvitableFriends(context, userIDs);
    /** approvalRequired 是选择两个 Gateway endpoint 的唯一服务端事实。 */
    const approvalRequired = readBoolean(payload.join_approval_required);
    if (approvalRequired === undefined) {
        throw createWebIMSyncError('GROUP_INVITE_APPROVAL_STATE_REQUIRED', 'Group invitation requires an explicit join approval setting.');
    }
    if (approvalRequired) {
        /** applications 是本 action 唯一一次批量远端写入的响应。 */
        const applications = await gatewayClient.inviteGroupApplication({
            group_id: groupID,
            requester_user_ids: userIDs,
            source_type: 'group_invite',
            ...(options.message?.trim() ? { message: options.message.trim() } : {}),
        });
        validateInvitationApplications(applications, groupID, userIDs);
        return { group, invitedUserIDs: userIDs, mode: 'application', cacheState: 'unchanged' };
    }
    /** remote 是直接入群分支唯一一次远端写入。 */
    const remote = await gatewayClient.inviteGroupMembers({
        group_id: groupID,
        member_user_ids: userIDs,
    });
    if ((remote.group_id?.trim() ?? '') !== groupID) {
        return { group, invitedUserIDs: userIDs, mode: 'direct', cacheState: 'remote-only' };
    }
    /** nextGroup 合并服务端部分响应并保留旧群 payload。 */
    const nextGroup = mergeInvitationGroup(group, remote, userIDs.length);
    try {
        await groupRepository.upsert(nextGroup);
        return { group: nextGroup, invitedUserIDs: userIDs, mode: 'direct', cacheState: 'local' };
    }
    catch {
        return { group: nextGroup, invitedUserIDs: userIDs, mode: 'direct', cacheState: 'remote-only' };
    }
}
/** 对齐 RN：只保留未入群且明确允许群邀请的好友。 */
export function filterIMInvitableGroupContacts(contacts, memberUserIDs) {
    /** memberIDs 以稳定身份排除当前群成员。 */
    const memberIDs = new Set(memberUserIDs.map(userID => userID.trim()).filter(Boolean));
    return contacts.filter(contact => Boolean(contact.userID.trim()) &&
        !memberIDs.has(contact.userID) &&
        contact.allowGroupInvite === true);
}
/** 校验全部目标都是当前好友且明确允许被邀请入群。 */
async function requireInvitableFriends(context, userIDs) {
    /** friendships 一次批量读取当前账号关系快照。 */
    const friendships = await new FriendshipRepository(context.database).getByUserIDs(userIDs);
    /** friendshipsByID 用于按请求顺序做完整性和权限验证。 */
    const friendshipsByID = new Map(friendships.map(friendship => [friendship.userID, friendship]));
    /** invalidTargetIDs 不泄漏昵称，只保留调用方已经提供的稳定身份。 */
    const invalidTargetIDs = userIDs.filter(userID => {
        /** friendship 必须仍是有效好友关系。 */
        const friendship = friendshipsByID.get(userID);
        if (!friendship?.isFriend)
            return true;
        /** payload.permission 是好友列表返回的被邀请权限快照。 */
        const payload = readRecord(friendship.payload);
        /** permission 兼容标准 permission 和旧 user_permission 字段。 */
        const permission = readRecord(payload?.permission) ?? readRecord(payload?.user_permission);
        return readBoolean(permission?.allow_group_invite) !== true;
    });
    if (invalidTargetIDs.length) {
        throw createWebIMSyncError('GROUP_INVITE_TARGET_NOT_ALLOWED', 'Every invitation target must be a friend who allows group invitations.');
    }
}
/** 严格校验批量申请和请求目标一一对应，防止页面展示虚假成功。 */
function validateInvitationApplications(applications, groupID, userIDs) {
    /** expectedIDs 用于拒绝漏项、重复项和额外身份。 */
    const expectedIDs = new Set(userIDs);
    /** actualIDs 记录已验证的申请目标。 */
    const actualIDs = new Set();
    for (const application of applications) {
        /** requesterUserID 是单条申请对应的被邀请身份。 */
        const requesterUserID = application.requester_user_id?.trim() ?? '';
        if (!application.application_id?.trim() ||
            application.group_id?.trim() !== groupID ||
            application.type !== 'invite' ||
            !expectedIDs.has(requesterUserID) ||
            actualIDs.has(requesterUserID)) {
            throw createWebIMSyncError('GROUP_INVITE_APPLICATION_RESPONSE_INVALID', 'Gateway invitation applications do not match the requested targets.');
        }
        actualIDs.add(requesterUserID);
    }
    if (actualIDs.size !== expectedIDs.size) {
        throw createWebIMSyncError('GROUP_INVITE_APPLICATION_RESPONSE_INCOMPLETE', 'Gateway invitation applications are missing requested targets.');
    }
}
/** 合并直接邀请响应并在服务端未返回人数时做有界本地校准。 */
function mergeInvitationGroup(existing, remote, addedCount) {
    /** existingPayload 保留权限、公告和服务端顺序等未返回字段。 */
    const existingPayload = readGroupPayload(existing);
    /** fallbackCount 只在 Gateway 未返回人数时使用当前人数加法。 */
    const fallbackCount = Math.max(0, (existing.memberCount ?? 0) + addedCount);
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
        payload: { ...existingPayload, ...remote, group_id: existing.groupID, member_count: memberCount },
    };
}
/** 清洗成员身份并按首次出现顺序去重。 */
function normalizeUserIDs(values) {
    /** userIDs 只保留非空稳定身份。 */
    const userIDs = values.map(value => value.trim()).filter(Boolean);
    return [...new Set(userIDs)];
}
/** 读取 Repository 保存的 Gateway 群 payload。 */
function readGroupPayload(group) {
    return readRecord(group.payload) ?? group;
}
/** 将未知值收窄为可读取普通对象。 */
function readRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : undefined;
}
/** 只接受服务端真实布尔值，缺失时保持未知。 */
function readBoolean(value) {
    return typeof value === 'boolean' ? value : undefined;
}
/** 校验非空稳定身份并保留调用点错误码。 */
function requireIdentity(value, code) {
    /** normalized 阻止空身份进入 Gateway 或 SQL。 */
    const normalized = value.trim();
    if (!normalized)
        throw createWebIMSyncError(code, 'A stable identity is required.');
    return normalized;
}
//# sourceMappingURL=group-member-invitation.js.map