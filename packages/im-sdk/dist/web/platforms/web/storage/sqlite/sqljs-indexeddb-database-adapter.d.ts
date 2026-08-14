import type { DatabaseAdapter } from '@im28/im-sdk/core';
import type { SQLiteBinaryStore } from './indexeddb-sqlite-binary-store.js';
/** sql.js WASM 定位和 IndexedDB 快照依赖。 */
export interface SqlJsIndexedDBDatabaseAdapterOptions {
    readonly databaseName: string;
    readonly binaryStore: SQLiteBinaryStore;
    readonly locateWasmFile: (fileName: string) => string;
    readonly mode?: 'readwrite' | 'readonly-existing';
}
/** 标识 SQLite 内存状态已领先 durable snapshot 的致命持久化失败。 */
export declare class SqlJsPersistenceError extends Error {
    readonly cause: unknown;
    /** 保留原始 IndexedDB 异常供 Worker 错误归一化。 */
    constructor(cause: unknown);
}
/** 创建与 im-sdk SQL Repository 兼容的浏览器 DatabaseAdapter。 */
export declare function createSqlJsIndexedDBDatabaseAdapter(options: SqlJsIndexedDBDatabaseAdapterOptions): DatabaseAdapter;
//# sourceMappingURL=sqljs-indexeddb-database-adapter.d.ts.map