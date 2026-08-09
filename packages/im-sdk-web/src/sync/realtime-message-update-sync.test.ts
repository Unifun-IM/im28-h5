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
import { readMessageUpdateCursor } from './message-update-cursor-store.js';
import { createWebIMRealtimeSync } from './realtime-sync.js';

// 当前 package 解析器用于定位测试所需 sql.js WASM。
const require = createRequire(import.meta.url);
// WASM 路径来自 workspace 锁定 dependency。
const SQLJS_WASM_PATH = require.resolve('sql.js/dist/sql-wasm.wasm');

/** 创建含原始消息的真实 account SQLite。 */
async function createUpdateHarness() {
  // binaryStore 使用隔离 IndexedDB factory。
  const binaryStore = createIndexedDBSQLiteBinaryStore({
    indexedDB: new IDBFactory(),
  });
  // database 复用生产 adapter 与 shared migrations。
  const database = createSqlJsIndexedDBDatabaseAdapter({
    databaseName: 'message-update.sqlite',
    binaryStore,
    locateWasmFile: () => SQLJS_WASM_PATH,
  });
  await runMigrations(database);
  // conversations 提供不应被 update 修改的 msg/unread 状态。
  const conversations = new ConversationRepository(database);
  await conversations.upsert({
    conversationID: 'si_peer',
    type: 'single',
    targetID: 'peer',
    latestMessageID: 'client-original',
    lastMsgSeq: '5',
    unreadCount: 2,
    updatedAt: 100,
  });
  // messages 预置被编辑和删除的目标。
  const messages = new MessageRepository(database);
  await messages.upsert({
    clientMsgID: 'client-original',
    serverMsgID: 'server-original',
    conversationID: 'si_peer',
    senderID: 'peer',
    direction: 'incoming',
    contentType: 101,
    status: 'received',
    sendTime: 100,
    seq: 5,
    payload: { text: { text: '原文' } },
  });
  // lifecycle 公开当前已迁移 database。
  const lifecycle: WebIMAccountDatabaseLifecycle = {
    open: async () => undefined,
    close: async () => database.close(),
    getDatabase: () => database,
  };
  return { conversations, database, lifecycle, messages };
}

/** 创建带确定性 update recovery 的 Gateway client。 */
function createGatewayClient(
  pullMessageUpdates: GatewayHTTPClient['pullMessageUpdates'],
): GatewayHTTPClient {
  return {
    pullMessageUpdates,
    pullMessages: async () => ({}),
    getConversation: async () => {
      throw new Error('unexpected conversation recovery');
    },
  } as unknown as GatewayHTTPClient;
}

/** 创建服务端完整 edited message DTO。 */
function createEditedMessage(text: string) {
  return {
    msg_id: 'server-original',
    client_msg_id: 'client-original',
    conversation_id: 'si_peer',
    sender_id: 'peer',
    msg_seq: '5',
    type: 101,
    status: 'received',
    sent_at: '2026-08-09T10:00:00.000Z',
    updated_at: '2026-08-09T10:05:00.000Z',
    body: { text: { text } },
  } as const;
}

// Message update 通过真实 Repository/sql.js 验证独立 cursor 语义。
describe('Web IM realtime message update sync', () => {
  // 验证 edit、gap recovery、delete-all 和 cursor/msg 状态隔离。
  it('converges edit and delete updates without changing msg seq or unread', async () => {
    // harness 提供 cursor=0、msg_seq=5、unread=2 的初始状态。
    const harness = await createUpdateHarness();
    // pullRequests 证明 seq3 从 cursor1 发起恢复。
    const pullRequests: unknown[] = [];
    // Gateway recovery 返回 seq2 edit 和与 realtime 重复的 seq3 delete。
    const gatewayClient = createGatewayClient(async request => {
      pullRequests.push(request);
      return {
        list: [
          {
            update_id: 'update-2',
            conversation_id: 'si_peer',
            update_seq: '2',
            type: 'edited',
            target_msg_id: 'server-original',
            message: createEditedMessage('补拉编辑'),
          },
          {
            update_id: 'update-3',
            conversation_id: 'si_peer',
            update_seq: '3',
            type: 'deleted',
            target_msg_id: 'server-original',
            delete_scope: 'all',
          },
        ],
        next_update_seq: '3',
        has_more: false,
      };
    });
    // service 复用主 realtime 串行队列和账号冻结 context。
    const service = createWebIMRealtimeSync({
      gatewayClient,
      accountDatabase: harness.lifecycle,
      getCurrentUserID: () => 'current-user',
    });

    await service.handle({
      type: 'message.update',
      data: {
        update_id: 'update-1',
        conversation_id: 'si_peer',
        update_seq: '1',
        type: 'edited',
        target_msg_id: 'server-original',
        occurred_at: '2026-08-09T10:05:00.000Z',
        message: createEditedMessage('首次编辑'),
      },
    });
    await expect(
      harness.messages.getByClientMsgID('client-original'),
    ).resolves.toMatchObject({
      sendTime: 100,
      seq: 5,
      status: 'received',
      payload: { text: { text: '首次编辑' } },
    });
    await expect(
      readMessageUpdateCursor(harness.database, 'si_peer'),
    ).resolves.toBe('1');
    expect(pullRequests).toEqual([]);

    // cursorless 旧编辑按服务端时间拒绝，不能回退已保存内容或 cursor。
    await service.handle({
      type: 'message.update',
      data: {
        update_id: 'cursorless-old-edit',
        conversation_id: 'si_peer',
        type: 'edited',
        target_msg_id: 'server-original',
        occurred_at: '2026-08-09T10:04:00.000Z',
        message: createEditedMessage('过时编辑'),
      },
    });
    await expect(
      harness.messages.getByClientMsgID('client-original'),
    ).resolves.toMatchObject({ payload: { text: { text: '首次编辑' } } });
    await expect(
      readMessageUpdateCursor(harness.database, 'si_peer'),
    ).resolves.toBe('1');

    // seq3 跳号必须先补拉 seq2/3，再与 realtime update-3 去重。
    await service.handle({
      type: 'message.update',
      data: {
        update_id: 'update-3',
        conversation_id: 'si_peer',
        update_seq: '3',
        type: 'deleted',
        target_msg_id: 'server-original',
        delete_scope: 'all',
      },
    });
    expect(pullRequests).toEqual([
      {
        conversation_id: 'si_peer',
        after_update_seq: '1',
        limit: 100,
      },
    ]);
    await expect(
      harness.messages.getByClientMsgID('client-original'),
    ).resolves.toMatchObject({
      status: 'deleted_local',
      seq: 5,
      payload: { text: { text: '补拉编辑' } },
    });
    await expect(
      harness.messages.getHistory({ conversationID: 'si_peer' }),
    ).resolves.toHaveLength(0);
    await expect(
      readMessageUpdateCursor(harness.database, 'si_peer'),
    ).resolves.toBe('3');
    await expect(
      harness.conversations.getByID('si_peer'),
    ).resolves.toMatchObject({ lastMsgSeq: '5', unreadCount: 2 });
    await harness.lifecycle.close();
  });
});
