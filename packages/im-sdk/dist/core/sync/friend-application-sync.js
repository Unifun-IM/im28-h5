import { createWebIMSyncError } from './sync-context.js';
/** 创建好友申请 Web facade。 */
export function createWebIMFriendApplicationSync(dependencies) {
    return new WebIMFriendApplicationSyncImpl(dependencies);
}
/** 好友申请 service 负责认证、分页和 accept 请求约束。 */
class WebIMFriendApplicationSyncImpl {
    // dependencies 保存唯一 Gateway client 和认证查询端口。
    dependencies;
    /** 保存 runtime owners，不复制 token 或 transport。 */
    constructor(dependencies) {
        this.dependencies = dependencies;
    }
    /** 拉取完整好友申请并按 RN 待处理优先、时间倒序返回。 */
    async list(options = {}) {
        this.requireAuthenticatedUser();
        // pageSize 限制异常调用造成的服务端压力。
        const pageSize = clampFriendApplicationPageSize(options.pageSize);
        // applications 保存远端完整成功后的有效记录。
        const applications = [];
        // seenIDs 防止服务端跨页重复申请。
        const seenIDs = new Set();
        // page 从 Gateway 第一页递增并受安全上限约束。
        for (let page = 1; page <= 1000; page += 1) {
            // response 复用 shared client endpoint/envelope 错误语义。
            const response = await this.dependencies.gatewayClient.listFriendApplications({
                page,
                page_size: pageSize,
            });
            // pageItems 保留当前页原始顺序。
            const pageItems = response.applications ?? [];
            for (const item of pageItems) {
                // application 丢弃无稳定申请 ID 的异常 payload。
                const application = normalizeFriendApplication(item);
                if (application && !seenIDs.has(application.applicationID)) {
                    seenIDs.add(application.applicationID);
                    applications.push(application);
                }
            }
            // total 在服务端提供时优先作为完成信号。
            const total = Math.max(0, Math.trunc(response.total ?? 0));
            if (pageItems.length < pageSize || (total > 0 && applications.length >= total)) {
                return sortFriendApplications(applications);
            }
        }
        throw createWebIMSyncError('FRIEND_APPLICATION_PAGE_LIMIT_EXCEEDED', 'Friend application pagination exceeded the safety limit.');
    }
    /** 读取 Gateway 维护的好友申请未读总数。 */
    async getUnreadCount() {
        this.requireAuthenticatedUser();
        // response 保留服务端已读状态的唯一真相。
        const response = await this.dependencies.gatewayClient.getFriendApplicationUnreadCount();
        return normalizeFriendApplicationUnreadCount(response.unread_count);
    }
    /** 将明确指定的好友申请标记为已读，拒绝空集合触发隐式全量操作。 */
    async markRead(applicationIDs) {
        this.requireAuthenticatedUser();
        // normalizedIDs 保序去重并排除空白申请 ID。
        const normalizedIDs = Array.from(new Set(applicationIDs.map(item => item.trim()).filter(Boolean)));
        if (normalizedIDs.length === 0) {
            throw createWebIMSyncError('FRIEND_APPLICATION_IDS_REQUIRED', 'At least one friend application ID is required.');
        }
        await this.dependencies.gatewayClient.markFriendApplicationsRead({
            application_ids: normalizedIDs,
        });
    }
    /** 调用 shared accept operation，成功语义交给页面刷新。 */
    async accept(applicationID) {
        this.requireAuthenticatedUser();
        // normalizedID 防止空 ID 触发业务 mutation。
        const normalizedID = applicationID.trim();
        if (!normalizedID) {
            throw createWebIMSyncError('FRIEND_APPLICATION_ID_REQUIRED', 'Friend application ID is required.');
        }
        await this.dependencies.gatewayClient.acceptFriendApplication({ application_id: normalizedID });
    }
    /** 在任何 Gateway 访问前拒绝匿名调用。 */
    requireAuthenticatedUser() {
        if (!this.dependencies.getCurrentUserID()?.trim()) {
            throw createWebIMSyncError('FRIEND_APPLICATION_AUTH_REQUIRED', 'Friend applications require an authenticated Web IM session.');
        }
    }
}
/** 将 Gateway 申请映射为独立页面模型。 */
function normalizeFriendApplication(item) {
    // applicationID 是列表去重与 accept operation 的稳定主键。
    const applicationID = item.application_id?.trim() ?? '';
    if (!applicationID)
        return null;
    // requesterID 与 targetID 保留关系双方 ID。
    const requesterID = item.requester_id?.trim() ?? '';
    // targetID 用于 sent 记录的对方 fallback。
    const targetID = item.target_id?.trim() ?? '';
    // direction 仅把明确 sent 映射为 outgoing，其余按 RN incoming 回退。
    const direction = item.type === 'sent' ? 'outgoing' : 'incoming';
    // userID 优先使用 Gateway 返回的对方资料 ID。
    const userID = item.user?.user_id?.trim() || (direction === 'incoming' ? requesterID : targetID);
    // displayName 遵循 RN nickname/account/contact/ID 回退。
    const displayName = item.user?.nickname?.trim() || item.user?.account?.trim() ||
        item.user?.phone?.trim() || item.user?.email?.trim() || userID || '未命名用户';
    return {
        applicationID,
        requesterID,
        targetID,
        direction,
        userID,
        displayName,
        avatarURL: item.user?.avatar_url?.trim() ?? '',
        message: item.message?.trim() ?? '',
        sourceType: item.source_type?.trim() ?? '',
        status: item.status?.trim().toLowerCase() || 'pending',
        isRead: item.is_read === true,
        createdAt: item.created_at?.trim() ?? '',
        handledAt: item.handled_at?.trim() ?? '',
    };
}
/** 按 RN 待处理优先、创建时间倒序稳定排序。 */
function sortFriendApplications(applications) {
    return applications.map((application, index) => ({ application, index }))
        .sort((left, right) => {
        // pendingDelta 把待处理记录置顶。
        const pendingDelta = Number(right.application.status === 'pending') -
            Number(left.application.status === 'pending');
        if (pendingDelta)
            return pendingDelta;
        // timeDelta 使用可解析创建时间排序。
        const timeDelta = readApplicationTime(right.application.createdAt) -
            readApplicationTime(left.application.createdAt);
        return timeDelta || left.index - right.index;
    })
        .map(item => item.application);
}
/** 将不可解析时间降级为零。 */
function readApplicationTime(value) {
    // timestamp 只用于本地显示顺序。
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? timestamp : 0;
}
/** 限制好友申请 page size。 */
function clampFriendApplicationPageSize(value) {
    if (!Number.isFinite(value))
        return 100;
    return Math.min(200, Math.max(1, Math.trunc(value ?? 100)));
}
/** 将异常未读数收敛为非负整数。 */
function normalizeFriendApplicationUnreadCount(value) {
    if (!Number.isFinite(value))
        return 0;
    return Math.max(0, Math.trunc(value ?? 0));
}
//# sourceMappingURL=friend-application-sync.js.map