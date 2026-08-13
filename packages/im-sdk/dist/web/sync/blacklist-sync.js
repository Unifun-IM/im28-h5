import { createWebIMSyncError } from './sync-context.js';
/** 创建只通过 shared operations 读写黑名单的 Web facade。 */
export function createWebIMBlacklistSync(dependencies) {
    return new WebIMBlacklistSyncImpl(dependencies);
}
/** 黑名单 service 负责认证、分页、好友 enrichment 与解除语义。 */
class WebIMBlacklistSyncImpl {
    // dependencies 保存唯一 Gateway client 和联系人读取端口。
    dependencies;
    /** 保存 facade 依赖，不复制 token 或联系人实现。 */
    constructor(dependencies) {
        this.dependencies = dependencies;
    }
    /** 拉取完整黑名单，并按 RN 语义补充真实好友关系。 */
    async list(options = {}) {
        this.requireAuthenticatedUser();
        // pageSize 限制异常调用造成的服务端压力。
        const pageSize = clampBlacklistPageSize(options.pageSize);
        // contactsPromise 允许好友 enrichment 失败时按 RN 降级陌生人。
        const contactsPromise = this.dependencies.listContacts().catch(() => []);
        // items 保存已分页去重的有效 blacklist payload。
        const items = await this.listAllItems(pageSize);
        // friendIDs 只使用真实联系人结果，不推断好友关系。
        const friendIDs = new Set((await contactsPromise).map(contact => contact.userID));
        return items.map(item => normalizeBlacklistUser(item, friendIDs)).filter(isBlacklistUser);
    }
    /** 读取目标是否存在于我方真实黑名单，不触发联系人 enrichment。 */
    async has(userID) {
        this.requireAuthenticatedUser();
        /** normalizedUserID 防止空 ID 进入远端分页。 */
        const normalizedUserID = userID.trim();
        if (!normalizedUserID) {
            throw createWebIMSyncError('BLACKLIST_USER_ID_REQUIRED', 'Blacklist user ID is required.');
        }
        /** items 复用唯一分页 owner，避免页面自行解释 Gateway payload。 */
        const items = await this.listAllItems(100);
        return items.some(item => readBlacklistUserID(item) === normalizedUserID);
    }
    /** 等待 Gateway 解除成功；失败由 caller 保留原列表。 */
    async remove(userID) {
        this.requireAuthenticatedUser();
        // normalizedUserID 防止空 ID 触发破坏性请求。
        const normalizedUserID = userID.trim();
        if (!normalizedUserID) {
            throw createWebIMSyncError('BLACKLIST_USER_ID_REQUIRED', 'Blacklist user ID is required.');
        }
        await this.dependencies.gatewayClient.removeFromBlacklist({ blocked_user_id: normalizedUserID });
    }
    /** 分页读取并按用户 ID 去重。 */
    async listAllItems(pageSize) {
        // items 保留服务端顺序。
        const items = [];
        // seenUserIDs 防止服务端跨页重复。
        const seenUserIDs = new Set();
        // page 从 Gateway 第一页递增并受安全上限约束。
        for (let page = 1; page <= 1000; page += 1) {
            // response 复用 shared client endpoint/envelope 错误语义。
            const response = await this.dependencies.gatewayClient.listBlacklist({ page, page_size: pageSize });
            // pageItems 是当前页原始 payload。
            const pageItems = response.items ?? [];
            for (const item of pageItems) {
                // userID 统一 blocked/user 嵌套字段。
                const userID = readBlacklistUserID(item);
                if (userID && !seenUserIDs.has(userID)) {
                    seenUserIDs.add(userID);
                    items.push(item);
                }
            }
            // total 优先作为完整分页结束条件。
            const total = Math.max(0, Math.trunc(response.total ?? 0));
            if (pageItems.length < pageSize || (total > 0 && items.length >= total))
                return items;
        }
        throw createWebIMSyncError('BLACKLIST_PAGE_LIMIT_EXCEEDED', 'Blacklist pagination exceeded the safety limit.');
    }
    /** 在任何网络访问前拒绝匿名调用。 */
    requireAuthenticatedUser() {
        if (!this.dependencies.getCurrentUserID()?.trim()) {
            throw createWebIMSyncError('BLACKLIST_AUTH_REQUIRED', 'Blacklist requires an authenticated Web IM session.');
        }
    }
}
/** 归一化一条 Gateway 黑名单记录。 */
function normalizeBlacklistUser(item, friendIDs) {
    // userID 是页面和解除 operation 的稳定主键。
    const userID = readBlacklistUserID(item);
    if (!userID)
        return null;
    // user 保留服务端返回的公开用户资料。
    const user = item.user;
    // account 用于 RN 本地搜索副字段。
    const account = user?.account?.trim() ?? '';
    // displayName 对齐 nickname -> account -> phone -> ID 回退。
    const displayName = user?.nickname?.trim() || account || user?.phone?.trim() || userID;
    return {
        userID,
        displayName,
        account,
        avatarURL: user?.avatar_url?.trim() ?? '',
        isFriend: friendIDs.has(userID),
        createdAt: item.created_at?.trim() ?? '',
    };
}
/** 读取 blacklist payload 的稳定目标用户 ID。 */
function readBlacklistUserID(item) {
    return (item.blocked_user_id ?? item.user_id ?? item.user?.user_id ?? '').trim();
}
/** 为 filter 提供显式非空类型收窄。 */
function isBlacklistUser(user) {
    return user !== null;
}
/** 限制 blacklist page size 到 Gateway 可控范围。 */
function clampBlacklistPageSize(value) {
    if (!Number.isFinite(value))
        return 100;
    return Math.min(200, Math.max(1, Math.trunc(value ?? 100)));
}
//# sourceMappingURL=blacklist-sync.js.map