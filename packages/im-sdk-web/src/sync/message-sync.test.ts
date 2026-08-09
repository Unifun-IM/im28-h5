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
import { createWebIMMessageSync } from './message-sync.js';

// 当前 package 解析器用于定位测试所需的 sql.js WASM。
const require = createRequire(import.meta.url);
// WASM 路径来自已锁定的 workspace dependency。
const SQLJS_WASM_PATH = require.resolve('sql.js/dist/sql-wasm.wasm');

/** 创建包含目标会话的真实 account database。 */
async function createDatabaseHarness(userID: string) {
  // binaryStore 使用隔离 IndexedDB factory。
  const binaryStore = createIndexedDBSQLiteBinaryStore({
    indexedDB: new IDBFactory(),
  });
  // database 复用生产 sql.js adapter。
  const database = createSqlJsIndexedDBDatabaseAdapter({
    databaseName: `messages-${userID}.sqlite`,
    binaryStore,
    locateWasmFile: () => SQLJS_WASM_PATH,
  });
  await runMigrations(database);
  // conversations 预置发送所需的真实 cache row。
  const conversations = new ConversationRepository(database);
  await conversations.upsert({
    conversationID: 'si_user-2',
    type: 'single',
    targetID: 'user-2',
    unreadCount: 0,
    updatedAt: 1,
  });
  // lifecycle 公开已迁移 database。
  const lifecycle: WebIMAccountDatabaseLifecycle = {
    open: async () => undefined,
    close: async () => database.close(),
    getDatabase: () => database,
  };
  return { database, lifecycle };
}

/** 将测试使用的 message methods 收窄为共享 Gateway client。 */
function createGatewayClient(
  methods: Pick<GatewayHTTPClient, 'pullMessages' | 'sendMessage'>,
): GatewayHTTPClient {
  return methods as GatewayHTTPClient;
}

// 消息同步的真实 Repository/SQLite 回归集合。
describe('Web IM message sync', () => {
  // 验证 remote history mapping、持久化与 newest-first cache 读取。
  it('pulls and persists message history', async () => {
    // harness 提供真实 account schema。
    const harness = await createDatabaseHarness('user-1');
    // gatewayClient 返回同一会话两条有序消息。
    const gatewayClient = createGatewayClient({
      pullMessages: async request => ({
        messages: [
          {
            msg_id: 'server-1',
            client_msg_id: 'client-1',
            conversation_id: request.conversation_id,
            sender_id: 'user-2',
            msg_seq: '1',
            type: 101,
            sent_at: '2026-08-09T08:00:00.000Z',
            body: { text: { text: '第一条' } },
          },
          {
            msg_id: 'server-2',
            client_msg_id: 'client-2',
            conversation_id: request.conversation_id,
            sender_id: 'user-1',
            msg_seq: '2',
            type: 101,
            sent_at: '2026-08-09T08:01:00.000Z',
            body: { text: { text: '第二条' } },
          },
        ],
      }),
      sendMessage: async () => {
        throw new Error('unexpected send');
      },
    });
    // service 绑定当前认证账号。
    const service = createWebIMMessageSync({
      gatewayClient,
      accountDatabase: harness.lifecycle,
      getCurrentUserID: () => 'user-1',
    });

    await expect(
      service.pullHistory({
        conversationID: 'si_user-2',
        fromSeq: '0',
      }),
    ).resolves.toMatchObject([
      { clientMsgID: 'client-2', direction: 'outgoing' },
      { clientMsgID: 'client-1', direction: 'incoming' },
    ]);
    await expect(
      service.getCachedHistory({ conversationID: 'si_user-2' }),
    ).resolves.toHaveLength(2);
    await harness.lifecycle.close();
  });

  // 验证 optimistic sending row 使用相同 client ID 收敛到 sent。
  it('sends trimmed text and converges the local row to sent', async () => {
    // harness 提供已有会话和真实 message Repository。
    const harness = await createDatabaseHarness('sender');
    // requests 捕获发给 Gateway 的稳定幂等参数。
    const requests: unknown[] = [];
    // gatewayClient 回显同一 client ID 的成功消息。
    const gatewayClient = createGatewayClient({
      pullMessages: async () => ({}),
      sendMessage: async request => {
        requests.push(request);
        return {
          msg_id: 'server-sent',
          client_msg_id: request.client_msg_id,
          conversation_id: request.conversation_id,
          sender_id: 'sender',
          type: 101,
          status: 'sent',
          sent_at: '2026-08-09T09:00:00.000Z',
          ...(request.body ? { body: request.body } : {}),
        };
      },
    });
    // service 注入确定性 ID 与 clock。
    const service = createWebIMMessageSync({
      gatewayClient,
      accountDatabase: harness.lifecycle,
      getCurrentUserID: () => 'sender',
      createClientMessageID: () => 'client-sent',
      now: () => 1_754_729_000_000,
    });

    await expect(
      service.sendText({ conversationID: 'si_user-2', text: '  你好  ' }),
    ).resolves.toMatchObject({
      clientMsgID: 'client-sent',
      serverMsgID: 'server-sent',
      status: 'sent',
    });
    expect(requests).toMatchObject([
      {
        client_msg_id: 'client-sent',
        body: { text: { text: '你好' } },
      },
    ]);
    // Repository 中只保留相同 client ID 的 sent row。
    const messages = new MessageRepository(harness.database);
    await expect(
      messages.getByClientMsgID('client-sent'),
    ).resolves.toMatchObject({ status: 'sent' });
    await harness.lifecycle.close();
  });

  // 验证 Gateway rejection 将 optimistic row 标记为 failed 并继续抛错。
  it('marks the optimistic row failed when Gateway rejects', async () => {
    // harness 提供已有会话和真实状态机。
    const harness = await createDatabaseHarness('sender-failed');
    // gatewayClient 只在发送 endpoint 抛出 transport error。
    const gatewayClient = createGatewayClient({
      pullMessages: async () => ({}),
      sendMessage: async () => {
        throw new Error('gateway send unavailable');
      },
    });
    // service 使用确定性失败消息 ID。
    const service = createWebIMMessageSync({
      gatewayClient,
      accountDatabase: harness.lifecycle,
      getCurrentUserID: () => 'sender-failed',
      createClientMessageID: () => 'client-failed',
      now: () => 1_754_729_100_000,
    });

    await expect(
      service.sendText({ conversationID: 'si_user-2', text: '失败消息' }),
    ).rejects.toThrow('gateway send unavailable');
    // failed row 允许 UI 提供显式重试，而不是永久显示 sending。
    const messages = new MessageRepository(harness.database);
    await expect(
      messages.getByClientMsgID('client-failed'),
    ).resolves.toMatchObject({ status: 'failed' });
    await harness.lifecycle.close();
  });
});
