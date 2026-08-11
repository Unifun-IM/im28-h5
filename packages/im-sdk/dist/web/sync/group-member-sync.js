import { GroupMemberRepository, GroupRepository, } from '@im28/im-sdk/core';
import { createWebIMSyncError, requireWebIMSyncContext, } from './sync-context.js';
/** 创建当前账号绑定的群成员同步 facade。 */
export function createWebIMGroupMemberSync(dependencies) {
    /** mutationQueue 与消息、会话写入保持同一顺序 owner。 */
    const mutationQueue = dependencies.mutationQueue;
    return {
        listCached: async (groupID) => readCachedMembers(dependencies, groupID),
        sync: async (groupID, options) => executeMemberSync(dependencies, mutationQueue, groupID, options),
    };
}
/** 从当前账号 SQLite 读取群成员快照。 */
async function readCachedMembers(dependencies, groupID) {
    /** context 阻止匿名或未打开数据库读取。 */
    const context = requireWebIMSyncContext(dependencies, 'Group member sync');
    /** normalizedGroupID 是 cache 和 Gateway 共用分区键。 */
    const normalizedGroupID = requireGroupID(groupID);
    /** repository 绑定当前账号数据库。 */
    const repository = new GroupMemberRepository(context.database);
    return mapCachedMembers(await repository.listByGroupID(normalizedGroupID));
}
/** 在共享队列内完成群校验、全分页和 success-only replace。 */
async function executeMemberSync(dependencies, mutationQueue, groupID, options) {
    /** context 固定本轮认证账号和数据库。 */
    const context = requireWebIMSyncContext(dependencies, 'Group member sync');
    /** normalizedGroupID 防止跨空分区请求。 */
    const normalizedGroupID = requireGroupID(groupID);
    /** operation 包含完整分页与单事务替换。 */
    const operation = async () => {
        /** groupRepository 证明目标群属于当前账号 cache。 */
        const groupRepository = new GroupRepository(context.database);
        if (!await groupRepository.getByID(normalizedGroupID)) {
            throw createWebIMSyncError('GROUP_NOT_FOUND', 'Group member sync requires an existing cached group.');
        }
        /** remoteMembers 只有所有页面成功后才会写入。 */
        const remoteMembers = await pullAllMembers(dependencies.gatewayClient, normalizedGroupID, clampPageSize(options?.pageSize));
        /** repository 用一个事务替换该群快照。 */
        const repository = new GroupMemberRepository(context.database);
        await repository.replaceGroupMembers(normalizedGroupID, remoteMembers);
        return mapCachedMembers(await repository.listByGroupID(normalizedGroupID));
    };
    return mutationQueue ? mutationQueue.enqueue(operation) : operation();
}
/** 拉取全部群成员并按用户 ID 去重。 */
async function pullAllMembers(gatewayClient, groupID, pageSize) {
    /** members 保存每个用户最后一份有效远端记录。 */
    const members = new Map();
    /** pageToken 是 Gateway 不透明分页游标。 */
    let pageToken = '';
    /** seenTokens 防止服务端循环游标导致无限请求。 */
    const seenTokens = new Set();
    for (let page = 0; page < 100; page += 1) {
        /** response 是当前完整页，失败会直接中断且不写 cache。 */
        const response = await gatewayClient.listGroupMembers({
            group_id: groupID,
            limit: pageSize,
            ...(pageToken ? { page_token: pageToken } : {}),
        });
        for (const item of response.members ?? []) {
            /** member 过滤无身份和非活跃记录。 */
            const member = mapGatewayMember(item, groupID);
            if (member)
                members.set(member.userID, member);
        }
        /** nextToken 为空表示快照完整。 */
        const nextToken = response.next_page_token?.trim() ?? '';
        if (!nextToken)
            return [...members.values()];
        if (seenTokens.has(nextToken)) {
            throw createWebIMSyncError('GROUP_MEMBER_PAGINATION_LOOP', 'Gateway group member pagination repeated a token.');
        }
        seenTokens.add(nextToken);
        pageToken = nextToken;
    }
    throw createWebIMSyncError('GROUP_MEMBER_PAGE_LIMIT_EXCEEDED', 'Gateway group member pagination exceeded the safety limit.');
}
/** 将 Gateway 成员映射为共享 Repository 记录。 */
function mapGatewayMember(item, groupID) {
    /** record 读取 Gateway 未来可能补充的头像字段。 */
    const record = item;
    /** userID 是成员稳定主键。 */
    const userID = item.user_id?.trim() ?? '';
    /** state 明确非活跃时不进入候选列表。 */
    const state = item.state?.trim().toLowerCase() ?? '';
    if (!userID || ['left', 'removed', 'banned'].includes(state))
        return null;
    return {
        groupID,
        userID,
        nickname: item.nickname?.trim() || userID,
        faceURL: record.face_url?.trim() ?? '',
        roleLevel: roleLevel(item.role),
        ...(item.admin_since?.trim() ? { adminSince: item.admin_since.trim() } : {}),
        payload: item,
    };
}
/** 将 Repository 成员映射为稳定页面 DTO。 */
function mapCachedMembers(members) {
    return [...members]
        .sort((left, right) => (right.roleLevel ?? 0) - (left.roleLevel ?? 0) ||
        (left.nickname || left.userID).localeCompare(right.nickname || right.userID))
        .map(member => ({
        groupID: member.groupID,
        userID: member.userID,
        nickname: member.nickname || member.userID,
        avatarURL: member.faceURL ?? '',
        role: memberRole(member.roleLevel),
    }));
}
/** 将 Gateway 角色转换为 Repository 数值。 */
function roleLevel(role) {
    if (role === 'owner')
        return 100;
    if (role === 'admin')
        return 60;
    return 0;
}
/** 将 Repository 数值转换为页面角色。 */
function memberRole(value) {
    if (value === 100)
        return 'owner';
    if (value === 60)
        return 'admin';
    return 'member';
}
/** 校验群 ID。 */
function requireGroupID(value) {
    /** groupID 只接受明确非空值。 */
    const groupID = value.trim();
    if (!groupID)
        throw createWebIMSyncError('INVALID_GROUP_ID', 'Group member sync requires a group ID.');
    return groupID;
}
/** 限制单页成员数。 */
function clampPageSize(value) {
    if (!Number.isFinite(value))
        return 100;
    return Math.min(200, Math.max(1, Math.trunc(value ?? 100)));
}
//# sourceMappingURL=group-member-sync.js.map