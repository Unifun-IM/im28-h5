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
/** 导出 IndexedDB store 配置与端口类型。 */
export type { IndexedDBSQLiteBinaryStoreOptions, SQLiteBinaryStore, } from './sqlite/indexeddb-sqlite-binary-store.js';
/** 导出 sql.js DatabaseAdapter 配置类型。 */
export type { SqlJsIndexedDBDatabaseAdapterOptions } from './sqlite/sqljs-indexeddb-database-adapter.js';
/** 导出账户数据库跨标签页 lease contract。 */
export type { AccountDatabaseLease, AccountDatabaseLeaseErrorCode, AccountDatabaseLeaseManager, WebLockManagerPort, } from './lock/index.js';
/** 导出 Worker storage runtime 的公开端口与配置。 */
export type { WorkerDatabaseAdapterOptions, WorkerDatabasePort, WorkerDatabaseRuntimeDependencies, } from './worker/index.js';
/** 导出账户数据库生命周期端口与浏览器配置。 */
export type { WebIMAccountDatabaseLifecycle, WebIMAccountDatabaseLifecycleOptions, } from './account-database-lifecycle.js';
//# sourceMappingURL=index.d.ts.map