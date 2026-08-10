/** 创建认证生命周期使用的账户 SQLite owner。 */
export { createWebIMAccountDatabaseLifecycle } from './account-database-lifecycle.js';
/** 为账号创建稳定且不包含凭证的本地 SQLite 数据库名。 */
export { createAccountDatabaseName } from './sqlite/account-database-name.js';
/** 创建 IndexedDB SQLite 二进制快照 store。 */
export { createIndexedDBSQLiteBinaryStore } from './sqlite/indexeddb-sqlite-binary-store.js';
/** 创建兼容 im-sdk Repository 的 sql.js DatabaseAdapter。 */
export { createSqlJsIndexedDBDatabaseAdapter } from './sqlite/sqljs-indexeddb-database-adapter.js';
/** 创建账户数据库 Web Lock lease owner。 */
export { AccountDatabaseLeaseError, createAccountDatabaseLeaseManager, createAccountDatabaseLockName, } from './lock/index.js';
/** 创建 sql.js Dedicated Worker factory 与 DatabaseAdapter RPC client。 */
export { WorkerDatabaseError, createBrowserSqlJsDatabaseWorker, createWorkerDatabaseAdapter, createWorkerDatabaseRuntime, } from './worker/index.js';
//# sourceMappingURL=index.js.map