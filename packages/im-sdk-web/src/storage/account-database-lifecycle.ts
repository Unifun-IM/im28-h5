import {
  runMigrations,
  type DatabaseAdapter,
} from '@im28/im-sdk/web';

import { createAccountDatabaseName } from './sqlite/account-database-name.js';
import { createIndexedDBSQLiteBinaryStore } from './sqlite/indexeddb-sqlite-binary-store.js';
import { createSqlJsIndexedDBDatabaseAdapter } from './sqlite/sqljs-indexeddb-database-adapter.js';

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
}

/** 创建串行切换账号并执行共享 SDK migrations 的数据库 owner。 */
export function createWebIMAccountDatabaseLifecycle(
  options: WebIMAccountDatabaseLifecycleOptions,
): WebIMAccountDatabaseLifecycle {
  return new WebIMAccountDatabaseLifecycleImpl(options);
}

/** 单实例 owner 保证当前 tab 同时只持有一个账号数据库。 */
class WebIMAccountDatabaseLifecycleImpl
  implements WebIMAccountDatabaseLifecycle
{
  // 二进制 store 在账号切换时复用同一 IndexedDB 容器。
  private readonly binaryStore;
  // WASM 定位函数由最终浏览器 bundler 注入。
  private readonly locateWasmFile: (file: string) => string;
  // 队列串行化 open/close，避免快速登录切换交错。
  private operationQueue: Promise<void> = Promise.resolve();
  // 当前 adapter 只在 migrations 成功后公开。
  private currentDatabase: DatabaseAdapter | null = null;
  // 当前 userID 使用 trim 后的稳定值比较。
  private currentUserID: string | null = null;

  /** 初始化共享 IndexedDB binary store。 */
  constructor(options: WebIMAccountDatabaseLifecycleOptions) {
    this.binaryStore = createIndexedDBSQLiteBinaryStore({
      indexedDB: options.indexedDB,
      ...(options.storageDatabaseName
        ? { storageDatabaseName: options.storageDatabaseName }
        : {}),
    });
    this.locateWasmFile = options.locateWasmFile;
  }

  /** 打开并迁移指定账号数据库，切换账号前先关闭旧库。 */
  open(userID: string): Promise<void> {
    return this.enqueue(() => this.openDirect(userID));
  }

  /** 持久化并关闭当前账号数据库。 */
  close(): Promise<void> {
    return this.enqueue(() => this.closeDirect());
  }

  /** 返回完成 migrations 的当前数据库供后续 Repository owner 使用。 */
  getDatabase(): DatabaseAdapter | null {
    return this.currentDatabase;
  }

  /** 串行执行 lifecycle 操作，并允许失败后继续处理后续 close/open。 */
  private enqueue(operation: () => Promise<void>): Promise<void> {
    // 当前操作无论前序成功或失败都必须获得执行机会。
    const result = this.operationQueue.then(operation, operation);
    this.operationQueue = result.catch(() => undefined);
    return result;
  }

  /** 执行单次账号打开、迁移和公开。 */
  private async openDirect(userID: string): Promise<void> {
    // 账号比较使用 trim 结果，命名函数继续负责校验和编码。
    const normalizedUserID = userID.trim();
    if (this.currentDatabase && this.currentUserID === normalizedUserID) {
      return;
    }
    await this.closeDirect();
    // databaseName 不包含 token，只由规范化 userID 派生。
    const databaseName = createAccountDatabaseName(normalizedUserID);
    // 每次账号打开创建独立 adapter，避免跨账号 Repository 复用。
    const database = createSqlJsIndexedDBDatabaseAdapter({
      databaseName,
      binaryStore: this.binaryStore,
      locateWasmFile: this.locateWasmFile,
    });
    try {
      await runMigrations(database);
    } catch (cause) {
      await closeDatabaseAfterFailedMigration(database, cause);
    }
    this.currentDatabase = database;
    this.currentUserID = normalizedUserID;
  }

  /** 执行当前 adapter 的持久化关闭。 */
  private async closeDirect(): Promise<void> {
    // 保留引用直到 close 成功，失败时允许调用方重试。
    const database = this.currentDatabase;
    if (!database) {
      return;
    }
    await database.close();
    this.currentDatabase = null;
    this.currentUserID = null;
  }
}

/** migration 失败时关闭半初始化数据库并保留两个错误。 */
async function closeDatabaseAfterFailedMigration(
  database: DatabaseAdapter,
  migrationCause: unknown,
): Promise<never> {
  try {
    await database.close();
  } catch (closeCause) {
    throw new AggregateError(
      [migrationCause, closeCause],
      'Web IM account database migration and cleanup failed.',
    );
  }
  throw migrationCause;
}
