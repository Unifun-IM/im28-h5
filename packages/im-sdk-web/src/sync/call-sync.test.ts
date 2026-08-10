import { createRequire } from 'node:module';

import {
  runMigrations,
  type GatewayHTTPClient,
} from '@im28/im-sdk/web';
import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';

import type { WebIMAccountDatabaseLifecycle } from '../storage/index.js';
import { createIndexedDBSQLiteBinaryStore } from '../storage/sqlite/indexeddb-sqlite-binary-store.js';
import { createSqlJsIndexedDBDatabaseAdapter } from '../storage/sqlite/sqljs-indexeddb-database-adapter.js';
import { createWebIMCallSync } from './call-sync.js';

// 当前 package 解析器用于定位测试所需的 sql.js WASM。
const require = createRequire(import.meta.url);
// WASM 路径来自已锁定的 workspace dependency。
const SQLJS_WASM_PATH = require.resolve('sql.js/dist/sql-wasm.wasm');

/** 创建已迁移的真实 sql.js account database harness。 */
async function createDatabaseHarness(userID: string) {
  // binaryStore 使用隔离 IndexedDB factory，测试之间不共享 snapshot。
  const binaryStore = createIndexedDBSQLiteBinaryStore({
    indexedDB: new IDBFactory(),
  });
  // database 复用生产 adapter 和共享 schema。
  const database = createSqlJsIndexedDBDatabaseAdapter({
    databaseName: `calls-${userID}.sqlite`,
    binaryStore,
    locateWasmFile: () => SQLJS_WASM_PATH,
  });
  await runMigrations(database);
  // lifecycle 只公开当前已迁移 database，符合 runtime contract。
  const lifecycle: WebIMAccountDatabaseLifecycle = {
    open: async () => undefined,
    close: async () => database.close(),
    getDatabase: () => database,
  };
  return { database, lifecycle };
}

/** 将测试需要的通话方法收窄为共享 Gateway client。 */
function createGatewayClient(
  fetchCallList: GatewayHTTPClient['fetchCallList'],
  deleteCalls: GatewayHTTPClient['deleteCalls'] = async () => undefined,
): GatewayHTTPClient {
  return { fetchCallList, deleteCalls } as GatewayHTTPClient;
}

// 通话记录同步的真实 SQLite 回归集合。
describe('Web IM call sync', () => {
  // 验证 Gateway 列表原子落库后可按未接和关键词读取。
  it('syncs call records into account SQLite and reads filtered cache', async () => {
    // harness 代表当前已认证账号的生产数据库形态。
    const harness = await createDatabaseHarness('call-user');
    // gatewayClient 返回两条不同方向和接听状态的真实 DTO。
    const gatewayClient = createGatewayClient(async () => ({
      list: [
        {
          call_id: 'call-answered',
          direction: 'outgoing',
          user_id: 'friend-1',
          nickname: 'Alice',
          call_type: 'audio',
          status: 'ended',
          answer_status: 'answered',
          started_at: '2026-08-10T08:00:00.000Z',
          answered_at: '2026-08-10T08:00:05.000Z',
          ended_at: '2026-08-10T08:01:05.000Z',
        },
        {
          call_id: 'call-missed',
          direction: 'incoming',
          user_id: 'friend-2',
          nickname: 'Bob',
          call_type: 'video',
          status: 'ended',
          answer_status: 'missed',
          started_at: '2026-08-10T09:00:00.000Z',
        },
      ],
      total: 2,
    }));
    // calls facade 只依赖 runtime owners。
    const calls = createWebIMCallSync({
      gatewayClient,
      accountDatabase: harness.lifecycle,
      getCurrentUserID: () => 'call-user',
    });

    await expect(calls.sync()).resolves.toMatchObject({ total: 2 });
    await expect(
      calls.listCached({ answerStatus: 'missed', keyword: 'bob' }),
    ).resolves.toEqual({
      list: [expect.objectContaining({ call_id: 'call-missed', user_id: 'friend-2' })],
      total: 1,
    });
    await expect(calls.listCached()).resolves.toMatchObject({
      list: [{ call_id: 'call-missed' }, { call_id: 'call-answered' }],
      total: 2,
    });
    await harness.lifecycle.close();
  });

  // 验证服务端删除成功后才收敛本地缓存。
  it('deletes remote records before removing cached rows', async () => {
    // harness 提供可查询的真实本地缓存。
    const harness = await createDatabaseHarness('delete-user');
    // deletedIDs 记录 Gateway 实际收到的去重列表。
    const deletedIDs: string[][] = [];
    // gatewayClient 同时提供初次同步与删除 endpoint。
    const gatewayClient = createGatewayClient(
      async () => ({ list: [{ call_id: 'call-1' }], total: 1 }),
      async request => {
        deletedIDs.push([...request.call_ids]);
      },
    );
    // calls 使用当前账号数据库。
    const calls = createWebIMCallSync({
      gatewayClient,
      accountDatabase: harness.lifecycle,
      getCurrentUserID: () => 'delete-user',
    });

    await calls.sync();
    await calls.delete([' call-1 ', 'call-1']);
    expect(deletedIDs).toEqual([['call-1']]);
    await expect(calls.listCached()).resolves.toEqual({ list: [], total: 0 });
    await harness.lifecycle.close();
  });

  // 验证 Gateway 删除失败时不会伪装成功或提前删除本地 cache。
  it('keeps cached rows when remote delete fails', async () => {
    // harness 提供失败后的持久化断言环境。
    const harness = await createDatabaseHarness('delete-failure-user');
    // gatewayClient 的删除端点模拟真实网络失败。
    const gatewayClient = createGatewayClient(
      async () => ({ list: [{ call_id: 'call-kept' }], total: 1 }),
      async () => {
        throw new Error('delete unavailable');
      },
    );
    // calls 不包含任何 fallback 或 fake-success 分支。
    const calls = createWebIMCallSync({
      gatewayClient,
      accountDatabase: harness.lifecycle,
      getCurrentUserID: () => 'delete-failure-user',
    });

    await calls.sync();
    await expect(calls.delete(['call-kept'])).rejects.toThrow('delete unavailable');
    await expect(calls.listCached()).resolves.toMatchObject({
      list: [{ call_id: 'call-kept' }],
      total: 1,
    });
    await harness.lifecycle.close();
  });
});
