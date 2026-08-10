/** 创建由 Vite 静态分析和打包的 sql.js Dedicated module Worker。 */
export function createBrowserSqlJsDatabaseWorker() {
    return new Worker(new URL('./sqljs-database.worker.js', import.meta.url), { type: 'module', name: 'im28-sqlite-worker' });
}
//# sourceMappingURL=browser-worker-factory.js.map