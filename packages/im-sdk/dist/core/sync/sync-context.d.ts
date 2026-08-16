import { IMError, type DatabaseAdapter } from '@im28/im-sdk/core';
/** 共享 sync 只依赖当前账号数据库，不感知 RN/Web/Desktop 生命周期实现。 */
export interface IMSyncAccountDatabasePort {
    getDatabase(): DatabaseAdapter | null;
}
/** 所有 sync service 共用的认证与 account database owners。 */
export interface IMSyncContextDependencies {
    readonly accountDatabase: IMSyncAccountDatabasePort;
    readonly getCurrentUserID: () => string | null;
}
/** 单次 sync operation 固定使用的账号数据库上下文。 */
export interface IMSyncContext {
    readonly userID: string;
    readonly database: DatabaseAdapter;
}
/** 获取已认证且 migrations 完成的 account database context。 */
export declare function requireIMSyncContext(dependencies: IMSyncContextDependencies, capability: string): IMSyncContext;
/** 创建页面可按 code 处理且不含凭据的 sync 错误。 */
export declare function createIMSyncError(code: string, message: string): IMError;
/** 兼容已发布的 Web 命名；权威契约是 IMSyncContextDependencies。 */
export type WebIMSyncContextDependencies = IMSyncContextDependencies;
/** 兼容已发布的 Web 命名；权威契约是 IMSyncContext。 */
export type WebIMSyncContext = IMSyncContext;
/** 兼容已发布的 Web 命名；实现与 requireIMSyncContext 相同。 */
export declare const requireWebIMSyncContext: typeof requireIMSyncContext;
/** 兼容已发布的 Web 命名；实现与 createIMSyncError 相同。 */
export declare const createWebIMSyncError: typeof createIMSyncError;
//# sourceMappingURL=sync-context.d.ts.map