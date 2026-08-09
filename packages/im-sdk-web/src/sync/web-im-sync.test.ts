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
import { createWebIMSync } from './web-im-sync.js';

// 当前 package 解析器用于定位测试所需的 sql.js WASM。
const require = createRequire(import.meta.url);
// WASM 路径来自已锁定的 workspace dependency。
const SQLJS_WASM_PATH = require.resolve('sql.js/dist/sql-wasm.wasm');

/** 从共享 client 推导会话列表响应，避免复制 transport contract。 */
type ConversationListResponse = Awaited<
  ReturnType<GatewayHTTPClient['listConversations']>
>;

/** 从共享 client 推导消息拉取响应，保持测试与 Gateway contract 同步。 */
type PullMessagesResponse = Awaited<
  ReturnType<GatewayHTTPClient['pullMessages']>
>;

/** 创建已迁移且仅属于当前测试账号的真实 SQLite。 */
async function createSyncHarness(userID: string) {
  // binaryStore 隔离 IndexedDB snapshot，避免测试之间互相污染。
  const binaryStore = createIndexedDBSQLiteBinaryStore({
    indexedDB: new IDBFactory(),
  });
  // database 复用生产 sql.js adapter 和 shared migrations。
  const database = createSqlJsIndexedDBDatabaseAdapter({
    databaseName: `shared-sync-${userID}.sqlite`,
    binaryStore,
    locateWasmFile: () => SQLJS_WASM_PATH,
  });
  await runMigrations(database);
  // lifecycle 模拟 runtime 已完成认证和账号数据库打开。
  const lifecycle: WebIMAccountDatabaseLifecycle = {
    open: async () => undefined,
    close: async () => database.close(),
    getDatabase: () => database,
  };
  return { database, lifecycle };
}

/** 创建可被全量同步和 realtime 共同识别的文本消息。 */
function createMessage(seq: string) {
  return {
    msg_id: `server-${seq}`,
    client_msg_id: `client-${seq}`,
    conversation_id: 'si_user-2',
    sender_id: 'user-2',
    msg_seq: seq,
    type: 101,
    status: 'sent',
    sent_at: `2026-08-09T08:00:0${seq}.000Z`,
    body: { text: { text: `消息 ${seq}` } },
  } as const;
}

/** 让已排队的 Promise 和 SQLite 微任务获得一次执行机会。 */
async function waitForTaskTurn(): Promise<void> {
  await new Promise<void>(resolve => setTimeout(resolve, 0));
}

// 聚合 facade 必须为所有 mutation owner 提供同一业务队列。
describe('Web IM shared sync mutation queue', () => {
  // 验证延迟全量替换先完成，后入队 realtime delta 再推进最终状态。
  it('serializes delayed full sync before a later realtime message', async () => {
    // harness 使用真实 Repository 和持久化 adapter 复现覆盖风险。
    const harness = await createSyncHarness('serialized-user');
    // releaseList 由测试控制旧全量 snapshot 的返回时机。
    let releaseList:
      | ((response: ConversationListResponse) => void)
      | undefined;
    // markListStarted 证明全量操作已经占用共享队列。
    let markListStarted: (() => void) | undefined;
    // listStarted 在 Gateway 请求真正开始时完成。
    const listStarted = new Promise<void>(resolve => {
      markListStarted = resolve;
    });
    // delayedList 保持旧全量结果未完成，允许插入 realtime 调用。
    const delayedList = new Promise<ConversationListResponse>(resolve => {
      releaseList = resolve;
    });
    // gatewayClient 只实现本回归实际会触发的 canonical operations。
    const gatewayClient = {
      listConversations: async () => {
        markListStarted?.();
        return delayedList;
      },
      pullMessages: async () => ({}),
      getConversation: async () => {
        throw new Error('unexpected conversation recovery');
      },
    } as unknown as GatewayHTTPClient;
    // sync 是生产组合根，三个子服务必须收到同一 mutation queue。
    const sync = createWebIMSync({
      gatewayClient,
      accountDatabase: harness.lifecycle,
      getCurrentUserID: () => 'serialized-user',
    });

    // fullSync 首先入队，并停在延迟的 Gateway response。
    const fullSync = sync.conversations.sync();
    await listStarted;
    // realtime 后入队，不能提前写库再被旧全量 snapshot 覆盖。
    const realtime = sync.realtime.handle({
      type: 'message',
      data: createMessage('6'),
    });
    // realtimeSettled 用于直接证明业务队列而非最终偶然一致。
    let realtimeSettled = false;
    void realtime.then(() => {
      realtimeSettled = true;
    });
    await waitForTaskTurn();
    expect(realtimeSettled).toBe(false);

    releaseList?.({
      conversations: [
        {
          conversation_id: 'si_user-2',
          type: 'direct',
          user: { user_id: 'user-2', nickname: '用户二' },
          unread_count: '0',
          last_msg_seq: '5',
          updated_at: '2026-08-09T08:00:05.000Z',
          last_message: createMessage('5'),
        },
      ],
    });
    await Promise.all([fullSync, realtime]);

    // conversation 必须保留后执行的 realtime cursor/latest/unread。
    const conversations = new ConversationRepository(harness.database);
    await expect(conversations.getByID('si_user-2')).resolves.toMatchObject({
      latestMessageID: 'client-6',
      lastMsgSeq: '6',
      unreadCount: 1,
    });
    // seq 5 全量 latest 和 seq 6 realtime 消息都必须存在。
    const messages = new MessageRepository(harness.database);
    await expect(messages.getByClientMsgID('client-5')).resolves.not.toBeNull();
    await expect(messages.getByClientMsgID('client-6')).resolves.not.toBeNull();
    await harness.lifecycle.close();
  });

  // 验证 history 未完成时 send 和 realtime 都不能越过其业务边界。
  it('orders history, text send and realtime mutations through one queue', async () => {
    // harness 提供消息和会话服务共同使用的 account database。
    const harness = await createSyncHarness('message-queue-user');
    // conversations 预置发送文本所要求的真实 cache 会话。
    const conversations = new ConversationRepository(harness.database);
    await conversations.upsert({
      conversationID: 'si_user-2',
      type: 'single',
      targetID: 'user-2',
      unreadCount: 0,
      updatedAt: 1,
    });
    // releasePull 由测试控制 history Gateway response。
    let releasePull: ((response: PullMessagesResponse) => void) | undefined;
    // markPullStarted 证明 history 已开始执行并占用共享队列。
    let markPullStarted: (() => void) | undefined;
    // pullStarted 在 history transport 调用开始时完成。
    const pullStarted = new Promise<void>(resolve => {
      markPullStarted = resolve;
    });
    // delayedPull 暂停 history 的完整网络加持久化 operation。
    const delayedPull = new Promise<PullMessagesResponse>(resolve => {
      releasePull = resolve;
    });
    // sendCalls 验证发送 transport 不会越过未完成的 history。
    let sendCalls = 0;
    // gatewayClient 返回共享 mapper 可消费的真实文本消息结构。
    const gatewayClient = {
      listConversations: async () => ({ conversations: [] }),
      pullMessages: async () => {
        markPullStarted?.();
        return delayedPull;
      },
      sendMessage: async (request: Parameters<GatewayHTTPClient['sendMessage']>[0]) => {
        sendCalls += 1;
        return {
          msg_id: 'server-outgoing',
          client_msg_id: request.client_msg_id,
          conversation_id: request.conversation_id,
          sender_id: 'message-queue-user',
          type: 101,
          status: 'sent',
          sent_at: '2026-08-09T08:00:06.000Z',
          body: request.body,
        };
      },
      getConversation: async () => {
        throw new Error('unexpected conversation recovery');
      },
    } as unknown as GatewayHTTPClient;
    // sync 通过生产组合根注入唯一业务队列。
    const sync = createWebIMSync({
      gatewayClient,
      accountDatabase: harness.lifecycle,
      getCurrentUserID: () => 'message-queue-user',
      createClientMessageID: () => 'client-outgoing',
      now: () => Date.parse('2026-08-09T08:00:05.000Z'),
    });

    // history 首先入队并等待远端响应。
    const history = sync.messages.pullHistory({
      conversationID: 'si_user-2',
      fromSeq: '1',
    });
    await pullStarted;
    // send 排在 history 之后，不能提前创建 sending row 或调用 Gateway。
    const send = sync.messages.sendText({
      conversationID: 'si_user-2',
      text: '排队发送',
    });
    // realtime 再排在 send 之后，用完整会话 delta 避免额外 recovery。
    const realtime = sync.realtime.handle({
      type: 'conversation',
      data: {
        conversation_id: 'sg_team-1',
        type: 'group',
        group: { group_id: 'team-1', title: '队列群' },
      },
    });
    await waitForTaskTurn();
    expect(sendCalls).toBe(0);
    // optimistic row 也属于 send operation，不能在 history 阻塞时提前出现。
    const messages = new MessageRepository(harness.database);
    await expect(
      messages.getByClientMsgID('client-outgoing'),
    ).resolves.toBeNull();

    releasePull?.({ messages: [] });
    await Promise.all([history, send, realtime]);
    expect(sendCalls).toBe(1);
    await expect(
      messages.getByClientMsgID('client-outgoing'),
    ).resolves.toMatchObject({ status: 'sent' });
    await expect(conversations.getByID('sg_team-1')).resolves.toMatchObject({
      name: '队列群',
    });
    await harness.lifecycle.close();
  });
});
