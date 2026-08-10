/** 账户数据库跨标签页协调错误码。 */
export type AccountDatabaseLeaseErrorCode = 'ACCOUNT_DATABASE_BUSY' | 'STORAGE_COORDINATION_UNAVAILABLE' | 'STORAGE_COORDINATION_FAILED';
/** Web Lock 协调失败的结构化错误。 */
export declare class AccountDatabaseLeaseError extends Error {
    readonly code: AccountDatabaseLeaseErrorCode;
    /** 保存稳定错误码与原始浏览器异常。 */
    constructor(code: AccountDatabaseLeaseErrorCode, message: string, cause?: unknown);
}
/** 持有账户数据库完整 open-to-close 生命周期的独占 lease。 */
export interface AccountDatabaseLease {
    readonly lockName: string;
    release(): Promise<void>;
}
/** 账户数据库 lifecycle 消费的跨标签页 lease owner。 */
export interface AccountDatabaseLeaseManager {
    acquire(databaseName: string): Promise<AccountDatabaseLease>;
}
/** Web Locks API 的最小可注入端口。 */
export interface WebLockManagerPort {
    request<Result>(name: string, options: {
        readonly mode: 'exclusive';
        readonly ifAvailable: true;
    }, callback: (lock: {
        readonly name: string;
        readonly mode: 'exclusive';
    } | null) => Promise<Result>): Promise<Result>;
}
/** 创建 fail-closed 的账户数据库 Web Lock manager。 */
export declare function createAccountDatabaseLeaseManager(lockManager: WebLockManagerPort | Pick<LockManager, 'request'> | null | undefined): AccountDatabaseLeaseManager;
/** 生成同源内稳定且账号隔离的 Web Lock 名称。 */
export declare function createAccountDatabaseLockName(databaseName: string): string;
//# sourceMappingURL=account-database-lease.d.ts.map