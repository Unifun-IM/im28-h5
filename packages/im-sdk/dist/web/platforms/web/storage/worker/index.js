/** 创建 Vite module Worker 的生产 factory。 */
export { createBrowserSqlJsDatabaseWorker } from './browser-worker-factory.js';
/** 创建主线程 Worker DatabaseAdapter。 */
export { createWorkerDatabaseAdapter, } from './worker-database-client.js';
/** 导出 Worker RPC 结构化错误。 */
export { WorkerDatabaseError } from './worker-database-types.js';
/** 创建可注入数据库 factory 的 Worker RPC runtime。 */
export { createWorkerDatabaseRuntime } from './worker-database-runtime.js';
//# sourceMappingURL=index.js.map