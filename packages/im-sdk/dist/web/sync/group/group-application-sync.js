import { formatIMUserDisplayName, normalizeIMUserNickname, } from '../../modules/user/display-name.js';
import { DEFAULT_IM_GROUP_APPLICATION_MESSAGE, IM_GROUP_APPLICATION_MESSAGE_MAX_LENGTH, } from '../../modules/group/group-application-message.js';
import { createWebIMSyncError } from '../sync-context.js';
/** 创建群申请跨端 facade。 */
export function createIMGroupApplicationSync(dependencies) {
    return new WebIMGroupApplicationSyncImpl(dependencies);
}
/** 兼容已发布的 Web 命名；实现与 createIMGroupApplicationSync 相同。 */
export const createWebIMGroupApplicationSync = createIMGroupApplicationSync;
/** 群申请 service 负责认证、审核分页和处理请求约束。 */
class WebIMGroupApplicationSyncImpl {
    // dependencies 保存唯一 Gateway client 和认证查询端口。
    dependencies;
    /** 保存 runtime owners，不复制 token 或 transport。 */
    constructor(dependencies) {
        this.dependencies = dependencies;
    }
    /** 拉取当前账号可审核的完整群申请并按待处理和时间排序。 */
    async list(options = {}) {
        this.requireAuthenticatedUser();
        // pageSize 限制异常调用造成的服务端压力。
        const pageSize = clampGroupApplicationPageSize(options.pageSize);
        // applications 仅收集已完成页面映射的有效审核记录。
        const applications = [];
        // seenIDs 防止服务端跨页重复审核记录。
        const seenIDs = new Set();
        // page 从 Gateway 第一页递增并受安全上限约束。
        for (let page = 1; page <= 1000; page += 1) {
            // response 复用 shared audit endpoint 和 envelope 错误语义。
            const response = await this.dependencies.gatewayClient.listGroupApplicationAudit({
                page,
                page_size: pageSize,
            });
            // pageItems 保留当前页原始顺序。
            const pageItems = response.list ?? [];
            for (const item of pageItems) {
                // application 丢弃无稳定申请 ID 或群 ID 的异常 payload。
                const application = normalizeGroupApplication(item);
                if (application && !seenIDs.has(application.applicationID)) {
                    seenIDs.add(application.applicationID);
                    applications.push(application);
                }
            }
            // total 在服务端提供时优先作为完成信号。
            const total = Math.max(0, Math.trunc(response.total ?? 0));
            if (pageItems.length < pageSize || (total > 0 && applications.length >= total)) {
                return sortGroupApplications(applications);
            }
        }
        throw createWebIMSyncError('GROUP_APPLICATION_PAGE_LIMIT_EXCEEDED', 'Group application pagination exceeded the safety limit.');
    }
    /** 读取审核列表返回的待处理总数，对齐 RN 群验证角标语义。 */
    async getUnreadCount() {
        this.requireAuthenticatedUser();
        // response.total 是服务端按当前群主/管理员权限聚合的待审核总数。
        const response = await this.dependencies.gatewayClient.listGroupApplicationAudit({
            page: 1,
            page_size: 1,
        });
        return normalizeGroupApplicationUnreadCount(response.total);
    }
    /** 通过一条群申请，成功后由页面重新读取审核列表。 */
    async accept(applicationID) {
        await this.handle(applicationID, 'accept');
    }
    /** 拒绝一条群申请，成功后由页面重新读取审核列表。 */
    async reject(applicationID) {
        await this.handle(applicationID, 'reject');
    }
    /** 读取非成员可访问的群公开资料及当前申请状态。 */
    async getPublicGroup(groupID) {
        this.requireAuthenticatedUser();
        /** normalizedID 防止空群 ID 进入公开资料端点。 */
        const normalizedID = normalizeRequiredGroupID(groupID);
        /** detail 由 Gateway client 保留公开资料和账号关系。 */
        const detail = await this.dependencies.gatewayClient.getPublicGroup({ group_id: normalizedID });
        /** group 必须提供与请求一致的稳定 ID。 */
        const group = detail.group;
        /** resolvedID 兼容服务端省略回显 ID 的情况。 */
        const resolvedID = group?.group_id?.trim() || normalizedID;
        return {
            groupID: resolvedID,
            title: group?.title?.trim() || resolvedID,
            avatarURL: group?.avatar_url?.trim() ?? '',
            description: group?.description?.trim() ?? '',
            memberCount: Math.max(0, Math.trunc(group?.member_count ?? 0)),
            joinApprovalRequired: group?.join_approval_required !== false,
            membershipStatus: detail.membership_status ?? 'none',
            applicationStatus: detail.application_status?.trim().toLowerCase() ?? '',
        };
    }
    /** 搜索公开群并与当前账号已加入群快照合并为 RN 三态。 */
    async search(keyword) {
        /** query 的空值不触发认证、Gateway 或 SQLite 访问。 */
        const query = keyword.trim();
        if (!query)
            return [];
        this.requireAuthenticatedUser();
        /** searchedGroups 和 joinedGroups 并行读取，保持 RN 当前搜索链。 */
        const [searchedGroups, joinedGroups] = await Promise.all([
            this.dependencies.gatewayClient.searchGroups({ keyword: query }),
            this.dependencies.listJoinedGroups?.() ?? Promise.resolve([]),
        ]);
        /** joinedByID 用稳定群 ID 关联会话，不用标题猜测身份。 */
        const joinedByID = new Map(joinedGroups
            .map(group => [group.groupID.trim(), group])
            .filter(([groupID]) => Boolean(groupID)));
        /** seenGroupIDs 防止 Gateway 以 ID 和标题重复返回同一群。 */
        const seenGroupIDs = new Set();
        return (searchedGroups.list ?? []).flatMap(item => {
            /** normalized 只接纳具备稳定群 ID 的结果。 */
            const normalized = normalizeGroupSearchItem(item, joinedByID.get(item.group.group_id?.trim() ?? ''));
            if (!normalized || seenGroupIDs.has(normalized.groupID))
                return [];
            seenGroupIDs.add(normalized.groupID);
            return [normalized];
        });
    }
    /** 提交真实群申请，来源缺省对齐 RN 当前 search 语义。 */
    async apply(options) {
        this.requireAuthenticatedUser();
        /** groupID 在 mutation 前执行统一非空校验。 */
        const groupID = normalizeRequiredGroupID(options.groupID);
        /** message 对齐 RN trim、稳定缺省文案和 50 字符约束。 */
        const message = options.message?.trim() || DEFAULT_IM_GROUP_APPLICATION_MESSAGE;
        if (Array.from(message).length > IM_GROUP_APPLICATION_MESSAGE_MAX_LENGTH) {
            throw createWebIMSyncError('GROUP_APPLICATION_MESSAGE_TOO_LONG', `Group application message cannot exceed ${IM_GROUP_APPLICATION_MESSAGE_MAX_LENGTH} characters.`);
        }
        /** sourceType 允许扫码页显式登记 qrcode 来源。 */
        const sourceType = options.sourceType?.trim() || 'search';
        await this.dependencies.gatewayClient.applyGroupApplication({
            group_id: groupID,
            source_type: sourceType,
            message,
        });
    }
    /** 校验申请 ID 后调用唯一 shared mutation。 */
    async handle(applicationID, action) {
        this.requireAuthenticatedUser();
        // normalizedID 防止空 ID 触发业务 mutation。
        const normalizedID = applicationID.trim();
        if (!normalizedID) {
            throw createWebIMSyncError('GROUP_APPLICATION_ID_REQUIRED', 'Group application ID is required.');
        }
        if (action === 'accept') {
            await this.dependencies.gatewayClient.acceptGroupApplication({ application_id: normalizedID });
            return;
        }
        await this.dependencies.gatewayClient.rejectGroupApplication({ application_id: normalizedID });
    }
    /** 在任何 Gateway 访问前拒绝匿名调用。 */
    requireAuthenticatedUser() {
        if (!this.dependencies.getCurrentUserID()?.trim()) {
            throw createWebIMSyncError('GROUP_APPLICATION_AUTH_REQUIRED', 'Group applications require an authenticated Web IM session.');
        }
    }
}
/** 将 Gateway 公开群与已加入快照映射为页面稳定结果。 */
function normalizeGroupSearchItem(item, joined) {
    /** group 只保存公开群主体，wrapper 字段由 item 独立承载。 */
    const group = item.group;
    /** groupID 是搜索、申请和会话打开的唯一身份。 */
    const groupID = group.group_id?.trim() ?? '';
    if (!groupID)
        return null;
    /** applicationStatus 先于 joined 判定，避免重复提交待审核申请。 */
    const applicationStatus = item.application_status?.trim().toLowerCase() ?? '';
    /** membershipStatus 接受搜索端直接返回的 active 关系。 */
    const membershipStatus = item.membership_status?.trim().toLowerCase() ?? '';
    /** status 对齐 RN pending > joined > available 优先级。 */
    const status = applicationStatus === 'pending'
        ? 'pending'
        : joined || membershipStatus === 'active'
            ? 'joined'
            : 'available';
    return {
        groupID,
        title: group.title?.trim() || groupID,
        avatarURL: group.avatar_url?.trim() ?? '',
        description: group.description?.trim() ?? '',
        memberCount: Math.max(0, Math.trunc(group.member_count ?? 0)),
        joinApprovalRequired: group.join_approval_required !== false,
        status,
        conversationID: joined?.conversationID.trim() || group.conversation_id?.trim() || '',
        sourceType: item.source_type?.trim() ?? '',
    };
}
/** 校验并返回可访问群端点的稳定群 ID。 */
function normalizeRequiredGroupID(groupID) {
    /** normalizedID 排除空白输入。 */
    const normalizedID = groupID.trim();
    if (!normalizedID) {
        throw createWebIMSyncError('GROUP_ID_REQUIRED', 'Group ID is required.');
    }
    return normalizedID;
}
/** 将 Gateway 审核记录映射为页面模型。 */
function normalizeGroupApplication(item) {
    // raw 保留申请主体供字段归一化。
    const raw = item.application;
    // applicationID 是列表去重和处理操作的稳定主键。
    const applicationID = raw?.application_id?.trim() ?? '';
    // groupID 支撑索引聚合与详情路由恢复。
    const groupID = raw?.group_id?.trim() || item.group?.group_id?.trim() || '';
    if (!raw || !applicationID || !groupID)
        return null;
    // requester 允许 audit envelope 的资料覆盖嵌套旧数据。
    const requester = item.requester_user ?? raw.requester_user;
    // requesterUserID 用于头像、搜索和审核文案。
    const requesterUserID = requester?.user_id?.trim() || raw.requester_user_id?.trim() || '';
    // requesterName 遵循 RN nickname -> im-ID 展示回退，账号与联系方式不冒充昵称。
    const requesterName = normalizeIMUserNickname(requester?.nickname, requesterUserID) ||
        formatIMUserDisplayName(requesterUserID) || '申请用户';
    return {
        applicationID,
        groupID,
        groupName: item.group?.title?.trim() || groupID,
        groupAvatarURL: item.group?.avatar_url?.trim() ?? '',
        ownerUserID: item.group?.owner_user_id?.trim() ?? '',
        requesterUserID,
        requesterName,
        requesterAvatarURL: requester?.avatar_url?.trim() ?? '',
        inviterUserID: raw.inviter_user_id?.trim() ?? '',
        type: raw.type === 'invite' ? 'invite' : 'apply',
        sourceType: raw.source_type?.trim() ?? '',
        message: raw.message?.trim() ?? '',
        status: raw.status?.trim().toLowerCase() || 'pending',
        createdAt: raw.created_at?.trim() ?? '',
        handledAt: raw.handled_at?.trim() ?? '',
    };
}
/** 按 RN 待处理优先、创建时间倒序稳定排序。 */
function sortGroupApplications(applications) {
    return applications.map((application, index) => ({ application, index }))
        .sort((left, right) => {
        // pendingDelta 把待处理记录置顶。
        const pendingDelta = Number(right.application.status === 'pending') -
            Number(left.application.status === 'pending');
        if (pendingDelta)
            return pendingDelta;
        // timeDelta 使用可解析创建时间排序。
        const timeDelta = readGroupApplicationTime(right.application.createdAt) -
            readGroupApplicationTime(left.application.createdAt);
        return timeDelta || left.index - right.index;
    })
        .map(item => item.application);
}
/** 将不可解析时间降级为零。 */
function readGroupApplicationTime(value) {
    // timestamp 只用于本地显示顺序。
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? timestamp : 0;
}
/** 限制群申请 audit page size。 */
function clampGroupApplicationPageSize(value) {
    if (!Number.isFinite(value))
        return 100;
    return Math.min(200, Math.max(1, Math.trunc(value ?? 100)));
}
/** 将异常群申请待处理总数收敛为非负整数。 */
function normalizeGroupApplicationUnreadCount(value) {
    if (!Number.isFinite(value))
        return 0;
    return Math.max(0, Math.trunc(value ?? 0));
}
//# sourceMappingURL=group-application-sync.js.map