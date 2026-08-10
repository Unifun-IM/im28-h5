import type { DatabaseAdapter } from '@im28/im-sdk/core';
import { type WorkerDatabaseAdapterOptions } from './worker-database-types.js';
/** 创建在 Dedicated Worker 中执行 SQL 的 DatabaseAdapter。 */
export declare function createWorkerDatabaseAdapter(options: WorkerDatabaseAdapterOptions): DatabaseAdapter;
/** 透传 Worker adapter 配置与端口类型。 */
export type { WorkerDatabaseAdapterOptions, WorkerDatabasePort, } from './worker-database-types.js';
//# sourceMappingURL=worker-database-client.d.ts.map