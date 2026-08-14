import initSqlJs, {} from 'sql.js';
/** 标识 SQLite 内存状态已领先 durable snapshot 的致命持久化失败。 */
export class SqlJsPersistenceError extends Error {
    cause;
    /** 保留原始 IndexedDB 异常供 Worker 错误归一化。 */
    constructor(cause) {
        super(cause instanceof Error
            ? cause.message
            : 'Web SQLite snapshot persistence failed.');
        this.name = 'SqlJsPersistenceError';
        this.cause = cause;
    }
}
/** 创建与 im-sdk SQL Repository 兼容的浏览器 DatabaseAdapter。 */
export function createSqlJsIndexedDBDatabaseAdapter(options) {
    return new SqlJsIndexedDBDatabaseAdapter(options);
}
// 浏览器 SQLite adapter：SQL 在内存执行，已提交状态导出到 IndexedDB。
class SqlJsIndexedDBDatabaseAdapter {
    name;
    // Adapter 配置只持有依赖和账号数据库名，不包含鉴权信息。
    options;
    // 串行队列防止同一页面内的异步 SQL/快照写入互相覆盖。
    operationQueue = Promise.resolve();
    // 内存数据库在 open/close 之间唯一存在。
    database = null;
    // 持久化失败后禁止继续使用或在 close 时写回非 durable 状态。
    fatalPersistenceCause = null;
    /** 保存配置并暴露稳定的账号数据库名。 */
    constructor(options) {
        this.options = options;
        this.name = options.databaseName;
    }
    /** 加载 WASM 和 IndexedDB 快照；重复调用保持幂等。 */
    async open() {
        return this.runSerialized(async () => {
            await this.openDirect();
        });
    }
    /** 持久化最终快照并释放 sql.js 内存数据库。 */
    async close() {
        return this.runSerialized(async () => {
            if (!this.database) {
                return;
            }
            if (this.fatalPersistenceCause) {
                this.discardDatabaseDirect();
                return;
            }
            if (this.options.mode === 'readonly-existing') {
                this.discardDatabaseDirect();
                return;
            }
            await this.persistDirect(this.database);
            this.database.close();
            this.database = null;
        });
    }
    /** 执行单条写语句，并在成功后持久化一次完整快照。 */
    async execute(statement) {
        return this.runSerialized(async () => {
            this.assertWritable();
            // 所有公开操作都支持调用方省略显式 open。
            const database = await this.requireDatabaseDirect();
            // SQL 执行结果只承诺 im-sdk 当前消费的 rowsAffected。
            const result = executeStatement(database, statement);
            await this.persistDirect(database);
            return result;
        });
    }
    /** 查询 SQL 并把 sql.js Blob 值归一为 im-sdk 的 ArrayBuffer。 */
    async query(statement) {
        return this.runSerialized(async () => {
            // 查询与写入共用队列，保证读取不会越过尚未持久化的提交。
            const database = await this.requireDatabaseDirect();
            return queryStatement(database, statement);
        });
    }
    /** 在一个 SQLite transaction 内运行回调，成功时只持久化一次。 */
    async transaction(run) {
        return this.runSerialized(async () => {
            this.assertWritable();
            // transaction 期间直接使用当前数据库，避免递归进入串行队列死锁。
            const database = await this.requireDatabaseDirect();
            // transaction facade 禁止调用方绕过当前 SQLite connection。
            const transaction = {
                execute: async (statement) => executeStatement(database, statement),
                query: async (statement) => queryStatement(database, statement),
            };
            database.run('BEGIN IMMEDIATE');
            try {
                // 回调结果只有在 COMMIT 与 IndexedDB snapshot 都成功后才返回。
                const result = await run(transaction);
                database.run('COMMIT');
                await this.persistDirect(database);
                return result;
            }
            catch (error) {
                try {
                    database.run('ROLLBACK');
                }
                catch {
                    // COMMIT 后快照失败时已无活动事务；保留原始持久化错误。
                }
                throw error;
            }
        });
    }
    /** 串行调度 adapter 操作，并在失败后保持队列可继续使用。 */
    runSerialized(run) {
        // 当前结果排在已有操作之后，维持调用顺序。
        const result = this.operationQueue.then(run);
        // 队列只记录完成状态，避免一次失败阻断后续恢复操作。
        this.operationQueue = result.then(() => undefined, () => undefined);
        return result;
    }
    /** 初始化 sql.js 并从 IndexedDB 恢复指定账号数据库。 */
    async openDirect() {
        if (this.database) {
            return;
        }
        // locateFile 由应用构建层决定，adapter 不假设 Vite/webpack public path。
        const sqlRuntime = await initSqlJs({
            locateFile: fileName => this.options.locateWasmFile(fileName),
        });
        // null 表示账号第一次打开，不代表持久化读取失败。
        const persistedBytes = await this.options.binaryStore.read(this.name);
        if (!persistedBytes && this.options.mode === 'readonly-existing') {
            throw new Error('Existing Web SQLite snapshot is unavailable.');
        }
        this.database = persistedBytes
            ? new sqlRuntime.Database(persistedBytes)
            : new sqlRuntime.Database();
    }
    /** 获取已打开数据库，必要时执行幂等初始化。 */
    async requireDatabaseDirect() {
        if (this.fatalPersistenceCause) {
            throw new AggregateError([this.fatalPersistenceCause], 'Web SQLite adapter is faulted after a persistence failure.');
        }
        await this.openDirect();
        if (!this.database) {
            throw new Error('sql.js database failed to open.');
        }
        return this.database;
    }
    /** 导出独立二进制副本并等待 IndexedDB transaction commit。 */
    async persistDirect(database) {
        // export 返回完整 SQLite 文件，binary store 负责再次复制所有权。
        const bytes = database.export();
        try {
            await this.options.binaryStore.write(this.name, bytes);
        }
        catch (cause) {
            this.fatalPersistenceCause = cause;
            this.discardDatabaseDirect();
            throw new SqlJsPersistenceError(cause);
        }
    }
    /** 只读 existing-snapshot adapter 在触碰 SQL 前拒绝所有 mutation。 */
    assertWritable() {
        if (this.options.mode === 'readonly-existing') {
            throw new Error('Web SQLite snapshot is read-only.');
        }
    }
    /** 丢弃非 durable 内存数据库，禁止 close 将失败写入重新持久化。 */
    discardDatabaseDirect() {
        this.database?.close();
        this.database = null;
    }
}
/** 执行写语句并返回受影响行数。 */
function executeStatement(database, statement) {
    // sql.js bind 参数需要把 boolean/ArrayBuffer 转成 SQLite 支持的值。
    const parameters = normalizeStatementParameters(statement);
    database.run(statement.sql, parameters);
    return { rowsAffected: database.getRowsModified() };
}
/** 执行查询并把所有结果行映射到 im-sdk DatabaseRow。 */
function queryStatement(database, statement) {
    // prepared statement 支持参数绑定，并避免拼接 SQL 输入。
    const preparedStatement = database.prepare(statement.sql, normalizeStatementParameters(statement));
    // 查询结果按 step 顺序累积，保持 SQLite ORDER BY 语义。
    const rows = [];
    try {
        while (preparedStatement.step()) {
            // sql.js object row 需要归一化二进制值后才能满足共享契约。
            const rawRow = preparedStatement.getAsObject();
            // 共享 Repository 只接收显式 DatabaseValue。
            const row = {};
            for (const [column, value] of Object.entries(rawRow)) {
                row[column] = normalizeQueryValue(value);
            }
            rows.push(row);
        }
        return rows;
    }
    finally {
        preparedStatement.free();
    }
}
/** 将共享 DatabaseParams 转换为 sql.js 可绑定参数。 */
function normalizeStatementParameters(statement) {
    return (statement.params ?? []).map(value => {
        if (typeof value === 'boolean') {
            return value ? 1 : 0;
        }
        if (value instanceof ArrayBuffer) {
            return new Uint8Array(value);
        }
        return value;
    });
}
/** 将 sql.js 查询值归一为共享数据库契约值。 */
function normalizeQueryValue(value) {
    if (value instanceof Uint8Array) {
        return Uint8Array.from(value).buffer;
    }
    return value;
}
//# sourceMappingURL=sqljs-indexeddb-database-adapter.js.map