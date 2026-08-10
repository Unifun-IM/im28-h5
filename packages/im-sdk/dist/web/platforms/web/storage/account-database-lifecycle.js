import { runMigrations, } from '@im28/im-sdk/core';
import { createAccountDatabaseName } from './sqlite/account-database-name.js';
import { createIndexedDBSQLiteBinaryStore } from './sqlite/indexeddb-sqlite-binary-store.js';
import { createSqlJsIndexedDBDatabaseAdapter } from './sqlite/sqljs-indexeddb-database-adapter.js';
import { createWorkerDatabaseAdapter, } from './worker/index.js';
/** 创建串行切换账号并执行共享 SDK migrations 的数据库 owner。 */
export function createWebIMAccountDatabaseLifecycle(options) {
    return new WebIMAccountDatabaseLifecycleImpl(options);
}
/** 单实例 owner 保证当前 tab 同时只持有一个账号数据库。 */
class WebIMAccountDatabaseLifecycleImpl {
    // 完整配置用于显式选择 Worker 或 caller-thread adapter。
    options;
    // 二进制 store 在账号切换时复用同一 IndexedDB 容器。
    binaryStore;
    // WASM 定位函数由最终浏览器 bundler 注入。
    locateWasmFile;
    // 队列串行化 open/close，避免快速登录切换交错。
    operationQueue = Promise.resolve();
    // 当前 adapter 只在 migrations 成功后公开。
    currentDatabase = null;
    // 当前 userID 使用 trim 后的稳定值比较。
    currentUserID = null;
    // 当前 lease 从 Worker snapshot read 前持有到 close 完成后。
    currentLease = null;
    /** 初始化共享 IndexedDB binary store。 */
    constructor(options) {
        this.options = options;
        this.binaryStore = createIndexedDBSQLiteBinaryStore({
            indexedDB: options.indexedDB,
            ...(options.storageDatabaseName
                ? { storageDatabaseName: options.storageDatabaseName }
                : {}),
        });
        this.locateWasmFile = options.locateWasmFile;
    }
    /** 打开并迁移指定账号数据库，切换账号前先关闭旧库。 */
    open(userID) {
        return this.enqueue(() => this.openDirect(userID));
    }
    /** 持久化并关闭当前账号数据库。 */
    close() {
        return this.enqueue(() => this.closeDirect());
    }
    /** 返回完成 migrations 的当前数据库供后续 Repository owner 使用。 */
    getDatabase() {
        return this.currentDatabase;
    }
    /** 串行执行 lifecycle 操作，并允许失败后继续处理后续 close/open。 */
    enqueue(operation) {
        // 当前操作无论前序成功或失败都必须获得执行机会。
        const result = this.operationQueue.then(operation, operation);
        this.operationQueue = result.catch(() => undefined);
        return result;
    }
    /** 执行单次账号打开、迁移和公开。 */
    async openDirect(userID) {
        // 账号比较使用 trim 结果，命名函数继续负责校验和编码。
        const normalizedUserID = userID.trim();
        if (this.currentDatabase && this.currentUserID === normalizedUserID) {
            return;
        }
        await this.closeDirect();
        // databaseName 不包含 token，只由规范化 userID 派生。
        const databaseName = createAccountDatabaseName(normalizedUserID);
        // Worker 生产路径必须先取得跨标签页 lease，禁止无锁降级。
        const lease = await this.acquireWorkerLease(databaseName);
        // database 在 lease 取得后创建，保证 Worker 不会提前读取 snapshot。
        let database = null;
        try {
            // 每次账号打开创建独立 adapter，避免跨账号 Repository 复用。
            database = this.createDatabaseAdapter(databaseName);
            await runMigrations(database);
        }
        catch (cause) {
            await cleanupFailedDatabaseOpen(database, lease, cause);
        }
        this.currentDatabase = database;
        this.currentUserID = normalizedUserID;
        this.currentLease = lease;
    }
    /** Worker 模式取得独占 lease；caller-thread 测试兼容路径不声明跨 tab 安全。 */
    acquireWorkerLease(databaseName) {
        if (!this.options.createDatabaseWorker) {
            return Promise.resolve(null);
        }
        if (!this.options.accountDatabaseLeaseManager) {
            throw new Error('Worker database execution requires an account database lease manager.');
        }
        return this.options.accountDatabaseLeaseManager.acquire(databaseName);
    }
    /** 按显式配置创建 Worker 或 caller-thread adapter，不做运行时自动降级。 */
    createDatabaseAdapter(databaseName) {
        if (this.options.createDatabaseWorker) {
            if (!this.options.wasmURL) {
                throw new Error('Worker database execution requires a sql.js WASM URL.');
            }
            return createWorkerDatabaseAdapter({
                databaseName,
                wasmURL: this.options.wasmURL,
                createWorker: this.options.createDatabaseWorker,
                ...(this.options.storageDatabaseName
                    ? { storageDatabaseName: this.options.storageDatabaseName }
                    : {}),
            });
        }
        return createSqlJsIndexedDBDatabaseAdapter({
            databaseName,
            binaryStore: this.binaryStore,
            locateWasmFile: this.locateWasmFile,
        });
    }
    /** 执行当前 adapter 的持久化关闭。 */
    async closeDirect() {
        // 保留引用直到 close 成功，失败时允许调用方重试。
        const database = this.currentDatabase;
        if (!database) {
            return;
        }
        await database.close();
        // Worker 已确认无法继续写入后才允许结束 Web Locks callback。
        await this.currentLease?.release();
        this.currentDatabase = null;
        this.currentUserID = null;
        this.currentLease = null;
    }
}
/** open/migration 失败时先销毁 Worker，再释放 lease，并保留全部异常。 */
async function cleanupFailedDatabaseOpen(database, lease, openCause) {
    // cleanupCauses 第一项固定保留原始 open/migration 错误。
    const cleanupCauses = [openCause];
    try {
        await database?.close();
    }
    catch (closeCause) {
        cleanupCauses.push(closeCause);
    }
    try {
        await lease?.release();
    }
    catch (releaseCause) {
        cleanupCauses.push(releaseCause);
    }
    if (cleanupCauses.length > 1) {
        throw new AggregateError(cleanupCauses, 'Web IM account database open and cleanup failed.');
    }
    throw openCause;
}
//# sourceMappingURL=account-database-lifecycle.js.map