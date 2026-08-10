import { type DatabaseAdapter } from '@im28/im-sdk/core';
import { type WorkerDatabasePort } from './worker/index.js';
import type { AccountDatabaseLeaseManager } from './lock/index.js';
/** 认证 runtime 使用的账户 SQLite 生命周期端口。 */
export interface WebIMAccountDatabaseLifecycle {
    open(userID: string): Promise<void>;
    close(): Promise<void>;
    getDatabase(): DatabaseAdapter | null;
}
/** 创建浏览器账户 SQLite owner 所需的原生端口。 */
export interface WebIMAccountDatabaseLifecycleOptions {
    readonly indexedDB: IDBFactory;
    readonly locateWasmFile: (file: string) => string;
    readonly storageDatabaseName?: string;
    readonly createDatabaseWorker?: () => WorkerDatabasePort;
    readonly wasmURL?: string;
    readonly accountDatabaseLeaseManager?: AccountDatabaseLeaseManager;
}
/** 创建串行切换账号并执行共享 SDK migrations 的数据库 owner。 */
export declare function createWebIMAccountDatabaseLifecycle(options: WebIMAccountDatabaseLifecycleOptions): WebIMAccountDatabaseLifecycle;
//# sourceMappingURL=account-database-lifecycle.d.ts.map