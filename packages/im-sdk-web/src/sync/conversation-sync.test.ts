import { createRequire } from 'node:module';

import {
  ConversationRepository,
  MessageRepository,
  runMigrations,
  type GatewayHTTPClient,
} from '@im28/im-sdk/web';
import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';

import type { WebIMAccountDatabaseLifecycle } from '../storage/index.js';
import { createIndexedDBSQLiteBinaryStore } from '../storage/sqlite/indexeddb-sqlite-binary-store.js';
import { createSqlJsIndexedDBDatabaseAdapter } from '../storage/sqlite/sqljs-indexeddb-database-adapter.js';
import { createWebIMConversationSync } from './conversation-sync.js';

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
    databaseName: `sync-${userID}.sqlite`,
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

/** 将测试需要的 listConversations 实现收窄为共享 client。 */
function createGatewayClient(
  listConversations: GatewayHTTPClient['listConversations'],
): GatewayHTTPClient {
  return { listConversations } as GatewayHTTPClient;
}

// 会话同步的真实 Repository/SQLite 回归集合。
describe('Web IM conversation sync', () => {
  // 验证全分页拉取、DTO mapping、latest message 与会话排序落库。
  it('persists all pages and latest messages before replacing conversations', async () => {
    // account database 使用真实 migrations 和 Repository SQL。
    const harness = await createDatabaseHarness('user-1');
    // tokens 记录远端分页调用顺序。
    const tokens: Array<string | undefined> = [];
    // Gateway 返回 direct 与 group 两页真实 DTO shape。
    const gatewayClient = createGatewayClient(async request => {
      tokens.push(request?.page_token);
      if (!request?.page_token) {
        return {
          conversations: [
            {
              conversation_id: 'si_user-2',
              type: 'direct',
              user: { user_id: 'user-2', nickname: '用户二' },
              updated_at: '2026-08-09T08:00:00.000Z',
              last_message: {
                msg_id: 'server-1',
                client_msg_id: 'client-1',
                conversation_id: 'si_user-2',
                sender_id: 'user-2',
                type: 101,
                status: 'sent',
                sent_at: '2026-08-09T08:00:00.000Z',
                body: { text: { text: '第一页' } },
              },
            },
          ],
          next_page_token: 'page-2',
        };
      }
      return {
        conversations: [
          {
            conversation_id: 'sg_group-1',
            type: 'group',
            group: { group_id: 'group-1', title: '研发群' },
            pinned_at: '2026-08-09T09:00:00.000Z',
          },
        ],
      };
    });
    // service 使用已认证账号和当前 account database。
    const service = createWebIMConversationSync({
      gatewayClient,
      accountDatabase: harness.lifecycle,
      getCurrentUserID: () => 'user-1',
    });

    await expect(service.sync({ pageSize: 50 })).resolves.toHaveLength(2);
    expect(tokens).toEqual([undefined, 'page-2']);
    await expect(service.listCached()).resolves.toMatchObject([
      { conversationID: 'sg_group-1', isPinned: true },
      { conversationID: 'si_user-2', latestMessageID: 'client-1' },
    ]);
    await expect(
      service.listCachedItems({ archived: false }),
    ).resolves.toMatchObject([
      {
        conversation: { conversationID: 'sg_group-1' },
        latestMessage: null,
      },
      {
        conversation: { conversationID: 'si_user-2' },
        latestMessage: {
          clientMsgID: 'client-1',
          payload: { text: { text: '第一页' } },
        },
      },
    ]);
    // latest message 必须可由共享 Repository 独立读取。
    const messages = new MessageRepository(harness.database);
    await expect(messages.getByClientMsgID('client-1')).resolves.toMatchObject({
      conversationID: 'si_user-2',
      direction: 'incoming',
    });
    await harness.lifecycle.close();
  });

  // 验证后续分页失败不会清除已有完整会话 cache。
  it('keeps the existing conversation cache when a later page fails', async () => {
    // account database 预置一个旧但完整的 cache snapshot。
    const harness = await createDatabaseHarness('user-failure');
    // repository 直接写入既有 cache，后续必须保持不变。
    const conversations = new ConversationRepository(harness.database);
    await conversations.upsert({
      conversationID: 'si_existing',
      type: 'single',
      targetID: 'existing',
      unreadCount: 0,
      updatedAt: 1,
    });
    // 第二页模拟真实 transport failure。
    const gatewayClient = createGatewayClient(async request => {
      if (request?.page_token) {
        throw new Error('second page unavailable');
      }
      return {
        conversations: [
          {
            conversation_id: 'si_new',
            type: 'direct',
            user: { user_id: 'new' },
          },
        ],
        next_page_token: 'page-2',
      };
    });
    // service 失败必须 reject，不返回 fake cached success。
    const service = createWebIMConversationSync({
      gatewayClient,
      accountDatabase: harness.lifecycle,
      getCurrentUserID: () => 'user-failure',
    });

    await expect(service.sync()).rejects.toThrow('second page unavailable');
    await expect(service.listCached()).resolves.toMatchObject([
      { conversationID: 'si_existing' },
    ]);
    await harness.lifecycle.close();
  });

  // 验证匿名 runtime 无法读取或同步任何账号 cache。
  it('rejects access without an authenticated user', async () => {
    // 未认证场景不应触发 Gateway 调用。
    const gatewayClient = createGatewayClient(async () => {
      throw new Error('unexpected gateway call');
    });
    // lifecycle 在认证前不公开 database。
    const lifecycle: WebIMAccountDatabaseLifecycle = {
      open: async () => undefined,
      close: async () => undefined,
      getDatabase: () => null,
    };
    // service 使用 runtime 的空 session snapshot。
    const service = createWebIMConversationSync({
      gatewayClient,
      accountDatabase: lifecycle,
      getCurrentUserID: () => null,
    });

    await expect(service.listCached()).rejects.toMatchObject({
      code: 'SYNC_AUTH_REQUIRED',
    });
  });
});
