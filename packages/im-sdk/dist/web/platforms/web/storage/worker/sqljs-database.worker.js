import { createIndexedDBSQLiteBinaryStore } from '../sqlite/indexeddb-sqlite-binary-store.js';
import { createSqlJsIndexedDBDatabaseAdapter } from '../sqlite/sqljs-indexeddb-database-adapter.js';
import { createWorkerDatabaseRuntime } from './worker-database-runtime.js';
// 当前模块只会由 Dedicated Worker factory 加载。
const workerScope = globalThis;
// runtime factory 将 sql.js、WASM URL 和 Worker 自身 IndexedDB 组合在同一线程。
const runtime = createWorkerDatabaseRuntime({
    createDatabase: options => {
        // binary store 使用 Worker 全局 IndexedDB，主线程不再触碰 snapshot。
        const binaryStore = createIndexedDBSQLiteBinaryStore({
            indexedDB: workerScope.indexedDB,
            ...(options.storageDatabaseName
                ? { storageDatabaseName: options.storageDatabaseName }
                : {}),
        });
        return createSqlJsIndexedDBDatabaseAdapter({
            databaseName: options.databaseName,
            binaryStore,
            locateWasmFile: () => options.wasmURL,
            ...(options.mode ? { mode: options.mode } : {}),
        });
    },
});
/** 顺序处理主线程请求并返回结构化克隆响应。 */
async function handleWorkerMessage(event) {
    // runtime 是消息验证、transaction 状态和错误归一化的唯一 owner。
    const response = await runtime.handle(event.data);
    workerScope.postMessage(response);
}
workerScope.addEventListener('message', event => {
    void handleWorkerMessage(event);
});
//# sourceMappingURL=sqljs-database.worker.js.map