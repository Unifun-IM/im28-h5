import { GroupMemberRepository, GroupRepository, } from '@im28/im-sdk/core';
import { formatIMUserDisplayName } from '../../modules/user/display-name.js';
import { createWebIMSyncError, requireWebIMSyncContext, } from '../sync-context.js';
import { refreshGroupMemberUserProfiles, resolveGroupMemberDisplayProfiles, } from './group-member-profile.js';
import { updateSelfGroupNicknameRecord } from './group-member-nickname.js';
/** 创建当前账号绑定的群成员同步 facade。 */
export function createIMGroupMemberSync(dependencies) {
    /** mutationQueue 与消息、会话写入保持同一顺序 owner。 */
    const mutationQueue = dependencies.mutationQueue;
    return {
        listCached: async (groupID) => readCachedMembers(dependencies, groupID),
        sync: async (groupID, options) => executeMemberSync(dependencies, mutationQueue, groupID, options),
        updateSelfNickname: (groupID, nickname) => {
            /** operation 与成员全量替换共用队列，避免 nickname 写回被并发 sync 覆盖。 */
            const operation = async () => {
                /** normalizedGroupID 是 Gateway 与 Repository 共用群身份。 */
                const normalizedGroupID = requireGroupID(groupID);
                /** next 是 Gateway 成功且已原子写回的当前成员。 */
                const next = await updateSelfGroupNicknameRecord(dependencies, normalizedGroupID, nickname);
                /** members 复用统一资料关联，避免 mutation 返回另一套展示优先级。 */
                const members = await mapCachedMembers(requireWebIMSyncContext(dependencies, 'Group member nickname update').database, [next]);
                /** current 一定来自刚写回的稳定成员身份。 */
                const current = members[0];
                if (!current) {
                    throw createWebIMSyncError('GROUP_MEMBER_NICKNAME_CACHE_MISSING', 'Updated group member cache could not be read.');
                }
                return current;
            };
            return mutationQueue ? mutationQueue.enqueue(operation) : operation();
        },
    };
}
/** 兼容已发布的 Web 命名；实现与 createIMGroupMemberSync 相同。 */
export const createWebIMGroupMemberSync = createIMGroupMemberSync;
/** 从当前账号 SQLite 读取群成员快照。 */
async function readCachedMembers(dependencies, groupID) {
    /** context 阻止匿名或未打开数据库读取。 */
    const context = requireWebIMSyncContext(dependencies, 'Group member sync');
    /** normalizedGroupID 是 cache 和 Gateway 共用分区键。 */
    const normalizedGroupID = requireGroupID(groupID);
    /** repository 绑定当前账号数据库。 */
    const repository = new GroupMemberRepository(context.database);
    return mapCachedMembers(context.database, await repository.listByGroupID(normalizedGroupID));
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
        /** group 是成员快照与群人数共同收敛所需的现有群事实。 */
        const group = await groupRepository.getByID(normalizedGroupID);
        if (!group) {
            throw createWebIMSyncError('GROUP_NOT_FOUND', 'Group member sync requires an existing cached group.');
        }
        /** remoteMembers 只有所有页面成功后才会写入。 */
        const remoteMembers = await pullAllMembers(dependencies.gatewayClient, normalizedGroupID, clampPageSize(options?.pageSize));
        /** 用户资料属于非阻断增强，失败时复用既有 cache 或身份兜底。 */
        await refreshGroupMemberUserProfiles(context.database, dependencies.gatewayClient, remoteMembers);
        /** repository 只负责权威快照提交后的关联展示读取。 */
        const repository = new GroupMemberRepository(context.database);
        /** 群成员与群人数在一个事务中提交，避免 mutation 后双表漂移。 */
        await groupRepository.replaceMemberSnapshot(group, remoteMembers);
        return mapCachedMembers(context.database, await repository.listByGroupID(normalizedGroupID));
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
    /** record 只把未进入正式 OpenAPI 的群昵称/头像视为兼容扩展。 */
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
        ...(record.nickname?.trim() && record.nickname.trim() !== userID
            ? { nickname: record.nickname.trim() }
            : {}),
        faceURL: record.face_url?.trim() ?? '',
        roleLevel: roleLevel(item.role),
        ...(record.admin_since?.trim() ? { adminSince: record.admin_since.trim() } : {}),
        payload: item,
    };
}
/** 将 Repository 成员映射为稳定页面 DTO。 */
async function mapCachedMembers(database, members) {
    /** profiles 在共享层关联群昵称和公开用户资料。 */
    const profiles = await resolveGroupMemberDisplayProfiles(database, members);
    return [...members]
        .sort((left, right) => (right.roleLevel ?? 0) - (left.roleLevel ?? 0) ||
        (profiles.get(left.userID)?.nickname ?? left.userID).localeCompare(profiles.get(right.userID)?.nickname ?? right.userID))
        .map(member => {
        /** profile 总是由相同成员集合生成。 */
        const profile = profiles.get(member.userID) ?? {
            nickname: formatIMUserDisplayName(member.userID),
            avatarURL: '',
        };
        return {
            groupID: member.groupID,
            userID: member.userID,
            ...(profile.remark ? { remark: profile.remark } : {}),
            ...(profile.groupNickname ? { groupNickname: profile.groupNickname } : {}),
            nickname: profile.nickname,
            avatarURL: profile.avatarURL,
            role: memberRole(member.roleLevel),
            roleLevel: member.roleLevel ?? 0,
            ...(member.adminSince ? { adminSince: member.adminSince } : {}),
            isMuted: readMemberMuted(member),
            muteUntil: readMemberMuteUntil(member),
        };
    });
}
/** 从成员 raw payload 读取禁言到期时间。 */
function readMemberMuteUntil(member) {
    /** payload 保存 Gateway 成员禁言事实。 */
    const payload = member.payload && typeof member.payload === 'object' && !Array.isArray(member.payload)
        ? member.payload
        : {};
    return typeof payload.mute_until === 'string' ? payload.mute_until.trim() : '';
}
/** 结合显式状态和未来到期时间判断成员是否仍被禁言。 */
function readMemberMuted(member) {
    /** payload 保存 Gateway 显式禁言状态。 */
    const payload = member.payload && typeof member.payload === 'object' && !Array.isArray(member.payload)
        ? member.payload
        : {};
    /** muteUntil 用于兼容服务端未返回 is_muted 的快照。 */
    const muteUntil = readMemberMuteUntil(member);
    return payload.is_muted === true || Boolean(muteUntil && Date.parse(muteUntil) > Date.now());
}
/** 将 Gateway 字符串或数值角色转换为 Repository 数值。 */
function roleLevel(role) {
    /** normalizedRole 兼容 Gateway 的文字枚举、数字和数字字符串。 */
    const normalizedRole = String(role ?? '').trim().toLowerCase();
    if (role === 100 || normalizedRole === '100' || normalizedRole === 'owner')
        return 100;
    if (role === 60 || normalizedRole === '60' || normalizedRole === 'admin')
        return 60;
    if (role === 20 || normalizedRole === '20' || normalizedRole === 'member')
        return 20;
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