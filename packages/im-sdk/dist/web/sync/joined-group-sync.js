import { GroupRepository, } from '@im28/im-sdk/core';
import { createWebIMSyncError, requireWebIMSyncContext, } from './sync-context.js';
/** 缓存 payload 中保存服务端顺序的私有字段。 */
const JOINED_GROUP_ORDER_KEY = '__joinedGroupOrder';
/** 创建当前账号绑定的我的群聊 facade。 */
export function createWebIMJoinedGroupSync(dependencies) {
    return new WebIMJoinedGroupSyncImpl(dependencies);
}
/** 我的群聊 service 负责分页、归一化和 SQLite 快照替换。 */
class WebIMJoinedGroupSyncImpl {
    // dependencies 保持唯一认证、Gateway、数据库与队列 owners。
    dependencies;
    /** 保存 runtime owners，不复制 token 或数据库连接。 */
    constructor(dependencies) {
        this.dependencies = dependencies;
    }
    /** 从当前账号 SQLite 返回按服务端顺序恢复的群列表。 */
    async listCached() {
        // context 同时拒绝匿名状态和未打开数据库。
        const context = requireWebIMSyncContext(this.dependencies, 'Joined group cache read');
        return readJoinedGroupCache(new GroupRepository(context.database), context.userID);
    }
    /** 完整拉取远端群列表后原子替换当前账号 SQLite 快照。 */
    sync(options = {}) {
        // operation 在 FIFO 真正执行时重新绑定当前账号，防止切号写错库。
        const operation = async () => {
            // context 冻结本轮认证用户和 account database。
            const context = requireWebIMSyncContext(this.dependencies, 'Joined group sync');
            // remoteGroups 在全分页成功前只驻留内存。
            const remoteGroups = await fetchAllJoinedGroups(this.dependencies.gatewayClient, clampJoinedGroupPageSize(options.pageSize));
            // groups 在任何 SQLite 写入前完成字段验证和映射。
            const groups = remoteGroups
                .map((group, index) => mapGatewayGroupToCore(group, index))
                .filter((group) => group !== null);
            // repository 是 groups 表唯一读写 owner。
            const repository = new GroupRepository(context.database);
            await repository.replaceAll(groups);
            return readJoinedGroupCache(repository, context.userID);
        };
        // mutationQueue 与会话、消息和其他 cache mutation 共用顺序。
        const queue = this.dependencies.mutationQueue;
        return queue ? queue.enqueue(operation) : operation();
    }
}
/** 拉取全部 token 分页并按首见 group ID 去重。 */
async function fetchAllJoinedGroups(gatewayClient, pageSize) {
    // groups 保存首见顺序，重复记录由后页新值覆盖。
    const groups = new Map();
    // seenTokens 拒绝服务端循环 token。
    const seenTokens = new Set();
    // pageToken 为空表示首屏。
    let pageToken;
    for (let page = 0; page < 1000; page += 1) {
        // response 复用 shared myGroupList endpoint 和 envelope 语义。
        const response = await gatewayClient.myGroupList({
            limit: pageSize,
            ...(pageToken ? { page_token: pageToken } : {}),
        });
        for (const group of response.groups ?? []) {
            // groupID 是去重、缓存和路由的稳定主键。
            const groupID = group.group_id?.trim() ?? '';
            if (groupID)
                groups.set(groupID, group);
        }
        // nextPageToken 只接受非空稳定 token。
        const nextPageToken = response.next_page_token?.trim();
        if (!nextPageToken)
            return [...groups.values()];
        if (seenTokens.has(nextPageToken)) {
            throw createWebIMSyncError('JOINED_GROUP_PAGINATION_LOOP', 'Gateway joined group pagination returned a repeated token.');
        }
        seenTokens.add(nextPageToken);
        pageToken = nextPageToken;
    }
    throw createWebIMSyncError('JOINED_GROUP_PAGE_LIMIT_EXCEEDED', 'Gateway joined group pagination exceeded the safety limit.');
}
/** 将 Gateway group 转成共享 Group Repository 记录。 */
function mapGatewayGroupToCore(group, order) {
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
/** 从共享 Group cache 恢复页面模型并按服务端顺序排序。 */
async function readJoinedGroupCache(repository, currentUserID) {
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
function mapCoreGroupToWeb(group, currentUserID) {
    // payload 兼容 Repository 将 raw_json 平铺到 Group 根对象的既有契约。
    const payload = readJoinedGroupPayload(group);
    // ownerUserID 用于“我创建”标签。
    const ownerUserID = readString(payload.owner_user_id);
    return {
        groupID: group.groupID,
        conversationID: readString(payload.conversation_id),
        name: group.name || group.groupID,
        avatarURL: group.faceURL ?? '',
        introduction: readString(payload.description),
        memberCount: normalizeMemberCount(group.memberCount),
        ownerUserID,
        currentUserRole: normalizeJoinedGroupRole(payload),
        canMentionAll: Boolean(payload.can_mention_all),
        isCreatedByCurrentUser: Boolean(currentUserID.trim() && ownerUserID === currentUserID.trim()),
        status: normalizeJoinedGroupStatus(payload.status),
    };
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
    const userPermission = isRecord(group.user_permission)
        ? group.user_permission
        : {};
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
/** 限制 myGroupList 单页大小。 */
function clampJoinedGroupPageSize(value) {
    if (!Number.isFinite(value))
        return 50;
    return Math.min(200, Math.max(1, Math.trunc(value ?? 50)));
}
/** 判断未知值是否为可读取记录。 */
function isRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
/** 安全读取未知字符串字段并去除空白。 */
function readString(value) {
    return typeof value === 'string' ? value.trim() : '';
}
//# sourceMappingURL=joined-group-sync.js.map