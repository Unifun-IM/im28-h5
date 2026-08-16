import { IMError, } from '@im28/im-sdk/core';
/** 获取已认证且 migrations 完成的 account database context。 */
export function requireIMSyncContext(dependencies, capability) {
    // userID 只允许来自 runtime 私有认证会话。
    const userID = dependencies.getCurrentUserID()?.trim();
    if (!userID) {
        throw createIMSyncError('SYNC_AUTH_REQUIRED', `${capability} requires an authenticated IM session.`);
    }
    // database 只有在账号 migrations 完成后才由 lifecycle 公开。
    const database = dependencies.accountDatabase.getDatabase();
    if (!database) {
        throw createIMSyncError('SYNC_DATABASE_UNAVAILABLE', `${capability} requires an open account database.`);
    }
    return { userID, database };
}
/** 创建页面可按 code 处理且不含凭据的 sync 错误。 */
export function createIMSyncError(code, message) {
    return new IMError({ code, message, source: 'sync', retryable: false });
}
/** 兼容已发布的 Web 命名；实现与 requireIMSyncContext 相同。 */
export const requireWebIMSyncContext = requireIMSyncContext;
/** 兼容已发布的 Web 命名；实现与 createIMSyncError 相同。 */
export const createWebIMSyncError = createIMSyncError;
//# sourceMappingURL=sync-context.js.map