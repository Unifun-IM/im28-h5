import type { WorkerDatabasePort } from './worker-database-types.js';

/** 创建由 Vite 静态分析和打包的 sql.js Dedicated module Worker。 */
export function createBrowserSqlJsDatabaseWorker(): WorkerDatabasePort {
  return new Worker(
    new URL('./sqljs-database.worker.ts', import.meta.url),
    { type: 'module', name: 'im28-sqlite-worker' },
  );
}
