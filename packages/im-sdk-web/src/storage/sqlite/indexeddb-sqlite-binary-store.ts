import { z } from 'zod';

// IndexedDB schema 版本：仅管理 SQLite 二进制快照 object store。
const INDEXED_DB_VERSION = 1;
// SQLite 快照 object store 名称。
const SQLITE_DATABASE_STORE = 'sqlite-databases';

// 持久化记录校验：读取损坏数据时必须失败，不能静默创建空库。
const PERSISTED_SNAPSHOT_SCHEMA = z.object({
  databaseName: z.string().min(1),
  bytes: z.instanceof(ArrayBuffer),
  updatedAt: z.number().int().nonnegative(),
});

/** SQLite 二进制快照的持久化端口。 */
export interface SQLiteBinaryStore {
  read(databaseName: string): Promise<Uint8Array | null>;
  write(databaseName: string, bytes: Uint8Array): Promise<void>;
  delete(databaseName: string): Promise<void>;
}

/** IndexedDB 快照存储的可注入配置。 */
export interface IndexedDBSQLiteBinaryStoreOptions {
  readonly indexedDB: IDBFactory;
  readonly storageDatabaseName?: string;
}

/** 创建按 SQLite database name 存取二进制快照的 IndexedDB store。 */
export function createIndexedDBSQLiteBinaryStore(
  options: IndexedDBSQLiteBinaryStoreOptions,
): SQLiteBinaryStore {
  // 存储容器名与账号数据库名分离，便于同源内统一管理多账号快照。
  const storageDatabaseName =
    options.storageDatabaseName ?? 'im28-h5-sqlite-storage';

  return {
    /** 读取并复制快照，避免调用方修改 IndexedDB 返回的缓冲区。 */
    async read(databaseName: string): Promise<Uint8Array | null> {
      // 每次操作短开连接，避免测试、热更新和页面卸载残留连接。
      const database = await openIndexedDB(
        options.indexedDB,
        storageDatabaseName,
      );
      try {
        // 只读事务用于加载指定账号的 SQLite 快照。
        const transaction = database.transaction(
          SQLITE_DATABASE_STORE,
          'readonly',
        );
        // transaction Promise 必须在请求发出前绑定，避免错过快速完成事件。
        const transactionDone = transactionToPromise(transaction);
        // 主键查询不会扫描其他账号的数据库记录。
        const request = transaction
          .objectStore(SQLITE_DATABASE_STORE)
          .get(databaseName);
        // 同时订阅 request 和 transaction，任何错误都不会留下未处理 Promise。
        const [record] = await Promise.all([
          requestToPromise<unknown>(request),
          transactionDone,
        ]);
        if (record === undefined) {
          return null;
        }
        // 校验可阻止损坏或旧格式记录被当作空数据库覆盖。
        const snapshot = PERSISTED_SNAPSHOT_SCHEMA.parse(record);
        return new Uint8Array(snapshot.bytes.slice(0));
      } finally {
        database.close();
      }
    },

    /** 原子替换指定账号的完整 SQLite 二进制快照。 */
    async write(databaseName: string, bytes: Uint8Array): Promise<void> {
      // 每次写入复制 Uint8Array，避免 sql.js 后续复用同一内存视图。
      const ownedBytes = Uint8Array.from(bytes);
      // 持久化记录只包含账号数据库名、二进制和更新时间。
      const record = {
        databaseName,
        bytes: ownedBytes.buffer,
        updatedAt: Date.now(),
      };
      // 写入前执行相同 schema 校验，保证 store 内只有规范记录。
      const validatedRecord = PERSISTED_SNAPSHOT_SCHEMA.parse(record);
      // 短连接保证版本升级不被长期连接阻塞。
      const database = await openIndexedDB(
        options.indexedDB,
        storageDatabaseName,
      );
      try {
        // 单记录 readwrite 事务提供 IndexedDB 原子替换语义。
        const transaction = database.transaction(
          SQLITE_DATABASE_STORE,
          'readwrite',
        );
        // 提前绑定完成事件，保证 put request 与 transaction commit 都被等待。
        const transactionDone = transactionToPromise(transaction);
        transaction
          .objectStore(SQLITE_DATABASE_STORE)
          .put(validatedRecord, databaseName);
        await transactionDone;
      } finally {
        database.close();
      }
    },

    /** 删除指定账号的本地 SQLite 快照。 */
    async delete(databaseName: string): Promise<void> {
      // 删除只影响传入账号，不清理其他账号缓存。
      const database = await openIndexedDB(
        options.indexedDB,
        storageDatabaseName,
      );
      try {
        // readwrite 事务保证删除完成后再向调用方返回。
        const transaction = database.transaction(
          SQLITE_DATABASE_STORE,
          'readwrite',
        );
        // 删除也必须等待整个 transaction 完成，而不只是提交 delete request。
        const transactionDone = transactionToPromise(transaction);
        transaction
          .objectStore(SQLITE_DATABASE_STORE)
          .delete(databaseName);
        await transactionDone;
      } finally {
        database.close();
      }
    },
  };
}

/** 打开 IndexedDB 容器并在首次升级时创建 SQLite 快照 store。 */
function openIndexedDB(
  indexedDB: IDBFactory,
  databaseName: string,
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // blocked 后 Promise 已拒绝；迟到的成功连接必须主动关闭。
    let wasBlocked = false;
    // open request 同时承担首次建库与后续版本升级。
    const request = indexedDB.open(databaseName, INDEXED_DB_VERSION);
    request.onupgradeneeded = () => {
      // 升级事务中的 database 是创建 object store 的唯一 owner。
      const database = request.result;
      if (!database.objectStoreNames.contains(SQLITE_DATABASE_STORE)) {
        database.createObjectStore(SQLITE_DATABASE_STORE);
      }
    };
    request.onsuccess = () => {
      if (wasBlocked) {
        request.result.close();
        return;
      }
      resolve(request.result);
    };
    request.onerror = () =>
      reject(request.error ?? new Error('IndexedDB open failed.'));
    request.onblocked = () => {
      wasBlocked = true;
      reject(new Error('IndexedDB upgrade is blocked by another connection.'));
    };
  });
}

/** 将 IDBRequest 事件接口转换为可组合的 Promise。 */
function requestToPromise<Result>(request: IDBRequest<Result>): Promise<Result> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('IndexedDB request failed.'));
  });
}

/** 等待 IndexedDB transaction 真正 commit，避免提前报告持久化成功。 */
function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('IndexedDB transaction failed.'));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('IndexedDB transaction aborted.'));
  });
}
