import { createWebIMSyncError } from './sync-context.js';
/** 创建群申请 Web facade。 */
export function createWebIMGroupApplicationSync(dependencies) {
    return new WebIMGroupApplicationSyncImpl(dependencies);
}
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
    /** 通过一条群申请，成功后由页面重新读取审核列表。 */
    async accept(applicationID) {
        await this.handle(applicationID, 'accept');
    }
    /** 拒绝一条群申请，成功后由页面重新读取审核列表。 */
    async reject(applicationID) {
        await this.handle(applicationID, 'reject');
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
    // requesterName 遵循 RN nickname/account/contact/ID 回退。
    const requesterName = requester?.nickname?.trim() || requester?.account?.trim() ||
        requester?.phone?.trim() || requester?.email?.trim() || requesterUserID || '申请用户';
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
//# sourceMappingURL=group-application-sync.js.map