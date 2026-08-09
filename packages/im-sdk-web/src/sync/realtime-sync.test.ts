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
import { createWebIMRealtimeSync } from './realtime-sync.js';

// 当前 package 解析器用于定位测试所需的 sql.js WASM。
const require = createRequire(import.meta.url);
// WASM 路径来自已锁定的 workspace dependency。
const SQLJS_WASM_PATH = require.resolve('sql.js/dist/sql-wasm.wasm');

/** 从公开 Gateway client 推导消息补拉响应，避免复制 DTO。 */
type PullMessagesResponse = Awaited<
  ReturnType<GatewayHTTPClient['pullMessages']>
>;

/** 创建带 seq cursor 的真实 account SQLite。 */
async function createRealtimeHarness(userID: string) {
  // binaryStore 使用隔离 IndexedDB factory，避免测试间共享状态。
  const binaryStore = createIndexedDBSQLiteBinaryStore({
    indexedDB: new IDBFactory(),
  });
  // database 复用生产 sql.js adapter 和 shared migrations。
  const database = createSqlJsIndexedDBDatabaseAdapter({
    databaseName: `realtime-${userID}.sqlite`,
    binaryStore,
    locateWasmFile: () => SQLJS_WASM_PATH,
  });
  await runMigrations(database);
  // conversations 预置本地 cursor 与 unread，供增量收敛断言。
  const conversations = new ConversationRepository(database);
  await conversations.upsert({
    conversationID: 'si_user-2',
    type: 'single',
    targetID: 'user-2',
    lastMsgSeq: '5',
    unreadCount: 2,
    updatedAt: 5,
  });
  // lifecycle 公开已迁移的真实 database。
  const lifecycle: WebIMAccountDatabaseLifecycle = {
    open: async () => undefined,
    close: async () => database.close(),
    getDatabase: () => database,
  };
  return { conversations, database, lifecycle };
}

/** 将测试 methods 收窄为共享 Gateway client。 */
function createGatewayClient(
  methods: Pick<GatewayHTTPClient, 'pullMessages' | 'getConversation'>,
): GatewayHTTPClient {
  return methods as GatewayHTTPClient;
}

/** 创建稳定的入站文本消息 DTO。 */
function createMessage(seq: string) {
  return {
    msg_id: `server-${seq}`,
    client_msg_id: `client-${seq}`,
    conversation_id: 'si_user-2',
    sender_id: 'user-2',
    msg_seq: seq,
    type: 101,
    sent_at: `2026-08-09T08:00:0${seq}.000Z`,
    body: { text: { text: `消息 ${seq}` } },
  } as const;
}

// 实时同步通过真实 Repository/sql.js 验证持久化语义。
describe('Web IM realtime sync', () => {
  // 验证新消息落库、会话推进和事件重放不重复累计 unread。
  it('persists a new message and keeps replay idempotent', async () => {
    // harness 提供 lastMsgSeq=5 的当前账号 cache。
    const harness = await createRealtimeHarness('user-1');
    // pullRequests 证明连续 seq 不触发 HTTP recovery。
    const pullRequests: unknown[] = [];
    // service 只允许测试路径需要的两个 Gateway operation。
    const service = createWebIMRealtimeSync({
      gatewayClient: createGatewayClient({
        pullMessages: async request => {
          pullRequests.push(request);
          return {};
        },
        getConversation: async () => {
          throw new Error('unexpected conversation recovery');
        },
      }),
      accountDatabase: harness.lifecycle,
      getCurrentUserID: () => 'user-1',
    });
    // event 模拟 shared normalizer 输出的 direct message shape。
    const event = { type: 'message', data: createMessage('6') } as const;

    await expect(service.handle(event)).resolves.toBe(true);
    await expect(service.handle(event)).resolves.toBe(true);
    // message 主键在重放后仍只有同一稳定记录。
    const messages = new MessageRepository(harness.database);
    await expect(messages.getByClientMsgID('client-6')).resolves.toMatchObject({
      seq: 6,
      direction: 'incoming',
    });
    // unread 只增加一次，latest/cursor 同时推进。
    await expect(
      harness.conversations.getByID('si_user-2'),
    ).resolves.toMatchObject({
      latestMessageID: 'client-6',
      lastMsgSeq: '6',
      unreadCount: 3,
    });
    expect(pullRequests).toEqual([]);
    await harness.lifecycle.close();
  });

  // 验证 seq 跳号先从本地 cursor 正序补拉，再合并事件消息。
  it('recovers a sequence gap before converging the event', async () => {
    // harness 初始 cursor 仍为 5。
    const harness = await createRealtimeHarness('user-gap');
    // pullRequests 捕获恢复 cursor、方向和窗口限制。
    const pullRequests: unknown[] = [];
    // Gateway 补回 seq 6/7，会话详情 endpoint 不应被调用。
    const service = createWebIMRealtimeSync({
      gatewayClient: createGatewayClient({
        pullMessages: async request => {
          pullRequests.push(request);
          return pullRequests.length === 1
            ? {
                messages: [createMessage('6')],
                has_more: true,
                next_seq: '6',
              }
            : { messages: [createMessage('7')], has_more: false };
        },
        getConversation: async () => {
          throw new Error('unexpected conversation recovery');
        },
      }),
      accountDatabase: harness.lifecycle,
      getCurrentUserID: () => 'user-gap',
    });

    await service.handle({
      type: 'message',
      data: { conversation_id: 'si_user-2', messages: [createMessage('8')] },
    });
    expect(pullRequests).toEqual([
      {
        conversation_id: 'si_user-2',
        from_seq: '5',
        limit: 100,
        desc: false,
      },
      {
        conversation_id: 'si_user-2',
        from_seq: '6',
        limit: 100,
        desc: false,
      },
    ]);
    // history 包含恢复窗口与实时消息三条记录。
    const messages = new MessageRepository(harness.database);
    await expect(
      messages.getHistory({ conversationID: 'si_user-2' }),
    ).resolves.toHaveLength(3);
    await expect(
      harness.conversations.getByID('si_user-2'),
    ).resolves.toMatchObject({
      latestMessageID: 'client-8',
      lastMsgSeq: '8',
      unreadCount: 5,
    });
    await harness.lifecycle.close();
  });

  // 验证会话事件执行 delta upsert 并保留已有会话。
  it('upserts a conversation delta without replacing the cache', async () => {
    // harness 已有 si_user-2，会话事件将增加一个群会话。
    const harness = await createRealtimeHarness('user-conversation');
    // conversation DTO 完整时不需要任何 HTTP recovery。
    const service = createWebIMRealtimeSync({
      gatewayClient: createGatewayClient({
        pullMessages: async () => ({}),
        getConversation: async () => {
          throw new Error('unexpected conversation recovery');
        },
      }),
      accountDatabase: harness.lifecycle,
      getCurrentUserID: () => 'user-conversation',
    });

    await service.handle({
      type: 'conversation',
      data: {
        conversation_id: 'sg_team-1',
        type: 'group',
        group: { group_id: 'team-1', title: '研发群' },
        unread_count: '4',
        last_msg_seq: '12',
        updated_at: '2026-08-09T09:00:00.000Z',
      },
    });
    await expect(harness.conversations.list()).resolves.toHaveLength(2);
    await expect(
      harness.conversations.getByID('sg_team-1'),
    ).resolves.toMatchObject({
      targetID: 'team-1',
      name: '研发群',
      unreadCount: 4,
      lastMsgSeq: '12',
    });
    await harness.lifecycle.close();
  });

  // 验证排队事件冻结入队账号，切换 owner 后不会写入新账号。
  it('keeps queued events bound to the account active at enqueue time', async () => {
    // accountA/accountB 提供两个物理隔离的真实 SQLite owners。
    const accountA = await createRealtimeHarness('queued-a');
    const accountB = await createRealtimeHarness('queued-b');
    // activeDatabase/activeUserID 模拟 runtime 快速切换认证账号。
    let activeDatabase = accountA.database;
    let activeUserID = 'queued-a';
    // releaseRecovery 控制首个 gap 事件占用串行队列。
    let releaseRecovery:
      | ((value: PullMessagesResponse) => void)
      | undefined;
    // recovery 在 owner 切换后才允许首个事件继续。
    const recovery = new Promise<PullMessagesResponse>(resolve => {
      releaseRecovery = resolve;
    });
    // service 的 context dependencies 始终读取当前模拟 runtime owner。
    const service = createWebIMRealtimeSync({
      gatewayClient: createGatewayClient({
        pullMessages: async () => recovery,
        getConversation: async () => {
          throw new Error('unexpected conversation recovery');
        },
      }),
      accountDatabase: {
        open: async () => undefined,
        close: async () => undefined,
        getDatabase: () => activeDatabase,
      },
      getCurrentUserID: () => activeUserID,
    });

    // first/second 在账号 A 活跃时同步入队并冻结其 context。
    const first = service.handle({ type: 'message', data: createMessage('8') });
    const second = service.handle({ type: 'message', data: createMessage('6') });
    activeDatabase = accountB.database;
    activeUserID = 'queued-b';
    releaseRecovery?.({
      messages: [createMessage('6'), createMessage('7')],
      has_more: false,
    });
    await Promise.all([first, second]);

    // 旧队列消息只存在账号 A，账号 B 仍保持空消息 cache。
    const messagesA = new MessageRepository(accountA.database);
    const messagesB = new MessageRepository(accountB.database);
    await expect(
      messagesA.getHistory({ conversationID: 'si_user-2' }),
    ).resolves.toHaveLength(3);
    await expect(
      messagesB.getHistory({ conversationID: 'si_user-2' }),
    ).resolves.toHaveLength(0);
    await accountA.lifecycle.close();
    await accountB.lifecycle.close();
  });
});
