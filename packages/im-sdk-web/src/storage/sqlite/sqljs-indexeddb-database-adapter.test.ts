import { createRequire } from 'node:module';

import {
  MessageRepository,
  runMigrations,
  statement,
  type Message,
} from '@im28/im-sdk';
import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';

import { createAccountDatabaseName } from './account-database-name.js';
import { createIndexedDBSQLiteBinaryStore } from './indexeddb-sqlite-binary-store.js';
import { createSqlJsIndexedDBDatabaseAdapter } from './sqljs-indexeddb-database-adapter.js';

// 当前测试文件所在 package 的解析器用于定位被 workspace 提升的依赖。
const require = createRequire(import.meta.url);
// 测试直接加载 npm 安装的 sql.js WASM，不依赖 node_modules 的物理层级。
const SQLJS_WASM_PATH = require.resolve('sql.js/dist/sql-wasm.wasm');

/** 为单个测试创建隔离的 IndexedDB factory 和 Web SQLite adapter。 */
function createTestAdapter(indexedDB: IDBFactory, userID: string) {
  // 每个测试 factory 使用相同容器名也不会共享数据。
  const binaryStore = createIndexedDBSQLiteBinaryStore({ indexedDB });
  // 账号名沿用生产命名函数，测试同时覆盖隔离入口。
  const databaseName = createAccountDatabaseName(userID);
  // Adapter 使用真实 sql.js 和共享 im-sdk DatabaseAdapter contract。
  const adapter = createSqlJsIndexedDBDatabaseAdapter({
    databaseName,
    binaryStore,
    locateWasmFile: () => SQLJS_WASM_PATH,
  });
  return { adapter, binaryStore, databaseName };
}

// Web SQLite foundation 的契约测试集合。
describe('sql.js IndexedDB database adapter', () => {
  // 验证账号数据库名稳定、编码安全且拒绝空账号。
  it('creates an account-scoped database name', () => {
    expect(createAccountDatabaseName(' user/a ')).toBe(
      'im28-web-user%2Fa.sqlite',
    );
    expect(() => createAccountDatabaseName('   ')).toThrow();
  });

  // 验证现有 im-sdk migration/repository SQL 可直接运行并跨 reopen 恢复。
  it('persists im-sdk repository data across adapter instances', async () => {
    // 独立 factory 模拟一个干净浏览器 origin。
    const indexedDB = new IDBFactory();
    // 第一个 adapter 写入共享 SDK schema 和消息。
    const firstRuntime = createTestAdapter(indexedDB, 'user-1');
    await runMigrations(firstRuntime.adapter);
    // 共享 MessageRepository 是验证 SQL 兼容性的真实 consumer。
    const firstRepository = new MessageRepository(firstRuntime.adapter);
    // 测试消息覆盖文本 payload 与服务端 seq 持久化。
    const message: Message = {
      clientMsgID: 'client-1',
      serverMsgID: 'server-1',
      conversationID: 'single_user-2',
      senderID: 'user-1',
      direction: 'outgoing',
      contentType: 101,
      status: 'sent',
      sendTime: 1_800_000_000_000,
      seq: 9,
      payload: { text: 'hello web sqlite' },
    };
    await firstRepository.upsert(message);
    await firstRuntime.adapter.close();

    // 第二个 adapter 从同一 IndexedDB snapshot 模拟页面刷新恢复。
    const secondRuntime = createTestAdapter(indexedDB, 'user-1');
    await secondRuntime.adapter.open();
    // 重建 Repository 后应读取到相同消息和 payload。
    const secondRepository = new MessageRepository(secondRuntime.adapter);
    await expect(secondRepository.getByClientMsgID('client-1')).resolves.toEqual(
      message,
    );
    await secondRuntime.adapter.close();
  });

  // 验证 transaction callback 失败时 SQL 和 IndexedDB 都不保留部分写入。
  it('rolls back failed transactions without persisting partial writes', async () => {
    // 独立 factory 避免其他测试 snapshot 影响 rollback 断言。
    const indexedDB = new IDBFactory();
    // rollback 测试只需要基础 SQL 表，不依赖 SDK migration。
    const runtime = createTestAdapter(indexedDB, 'rollback-user');
    await runtime.adapter.execute(
      statement('CREATE TABLE rollback_items (id TEXT PRIMARY KEY NOT NULL)'),
    );

    await expect(
      runtime.adapter.transaction(async transaction => {
        await transaction.execute(
          statement('INSERT INTO rollback_items (id) VALUES (?)', ['partial']),
        );
        throw new Error('expected rollback');
      }),
    ).rejects.toThrow('expected rollback');

    // 同一实例查询用于验证内存 SQLite 已回滚。
    const rows = await runtime.adapter.query(
      statement('SELECT id FROM rollback_items'),
    );
    expect(rows).toEqual([]);
    await runtime.adapter.close();

    // reopen 验证失败事务也没有污染 IndexedDB durable snapshot。
    const reopenedRuntime = createTestAdapter(indexedDB, 'rollback-user');
    // 持久化表结构应该保留，但失败 insert 不应出现。
    const reopenedRows = await reopenedRuntime.adapter.query(
      statement('SELECT id FROM rollback_items'),
    );
    expect(reopenedRows).toEqual([]);
    await reopenedRuntime.adapter.close();
  });
});
