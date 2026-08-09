import { createRequire } from 'node:module';

import type {
  GatewayFetch,
  GatewayFetchResponse,
  GatewayWebSocketConstructor,
} from '@im28/im-sdk/web';
import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it, vi } from 'vitest';

import { createWebIMAccountDatabaseLifecycle } from '../storage/index.js';
import { createWebIMAuthSessionStore } from './auth-session-store.js';
import { createWebIMDeviceIdentityStore } from './device-identity-store.js';
import { createWebIMRuntime } from './web-im-runtime.js';

// 当前 package 解析器用于定位真实 account database 所需 WASM。
const require = createRequire(import.meta.url);
// WASM 路径来自 workspace 锁定的 sql.js dependency。
const SQLJS_WASM_PATH = require.resolve('sql.js/dist/sql-wasm.wasm');

/** 为 runtime store 提供隔离的同步浏览器存储。 */
class MemoryStorage {
  // records 只属于当前 auth 或 device store。
  private readonly records = new Map<string, string>();

  /** 按 Storage contract 读取值。 */
  getItem(key: string): string | null {
    return this.records.get(key) ?? null;
  }

  /** 按 Storage contract 覆盖值。 */
  setItem(key: string, value: string): void {
    this.records.set(key, value);
  }

  /** 按 Storage contract 删除值。 */
  removeItem(key: string): void {
    this.records.delete(key);
  }
}

/** 创建可主动推送 normalized data event 的 WebSocket harness。 */
function createWebSocketHarness() {
  // sockets 记录 runtime 唯一实时连接。
  const sockets: TestWebSocket[] = [];

  /** 最小 socket 允许测试触发 open/message 并观察关闭。 */
  class TestWebSocket {
    onopen: ((event?: unknown) => void) | null = null;
    onmessage: ((event: { readonly data?: unknown }) => void) | null = null;
    onerror: ((event?: unknown) => void) | null = null;
    onclose: ((event?: unknown) => void) | null = null;
    readonly readyState = 1;

    /** 注册当前 runtime 创建的 socket。 */
    constructor() {
      sockets.push(this);
    }

    /** Auth frame 不属于当前数据持久化断言。 */
    send(): void {}

    /** Runtime 退出时允许幂等关闭。 */
    close(): void {}
  }

  return {
    sockets,
    WebSocket: TestWebSocket as unknown as GatewayWebSocketConstructor,
  };
}

/** 创建共享 Gateway client 可解析的成功信封。 */
function createGatewayResponse(data: unknown): GatewayFetchResponse {
  return {
    ok: true,
    status: 200,
    json: async () => ({ code: 0, data }),
  };
}

// Runtime 默认 WebSocket -> sync -> SQLite -> snapshot 链路集成回归。
describe('Web IM runtime realtime data bridge', () => {
  // 验证会话和消息事件由 runtime 默认消费并发布 cache 版本。
  it('persists socket data events and publishes a data version', async () => {
    // accountDatabase 使用生产 lifecycle、sql.js、IndexedDB 与 migrations。
    const accountDatabase = createWebIMAccountDatabaseLifecycle({
      indexedDB: new IDBFactory(),
      locateWasmFile: () => SQLJS_WASM_PATH,
      storageDatabaseName: 'runtime-realtime-data-test',
    });
    // gatewayFetch 只返回真实登录信封，其他 endpoint 保持成功空 data。
    const gatewayFetch: GatewayFetch = async input =>
      createGatewayResponse(
        input.endsWith('/v1/auth/user-login')
          ? {
              token: {
                access_token: 'access-realtime',
                subject_id: 'user-runtime',
              },
              user: { user_id: 'user-runtime' },
            }
          : {},
      );
    // realtime 允许经共享 client normalizer 送入原始 JSON frame。
    const realtime = createWebSocketHarness();
    // backgroundErrors 必须保持为空，证明 callback 没有吞掉持久化失败。
    const backgroundErrors: unknown[] = [];
    // runtime 组合生产 auth、Gateway clients 和 account database owners。
    const runtime = createWebIMRuntime({
      config: {
        gatewayHTTPURL: 'https://gateway.example.com',
        gatewayWebSocketURL: 'wss://push.example.com/ws',
        platformID: 5,
        language: 'zh-CN',
      },
      authSessionStore: createWebIMAuthSessionStore(
        new MemoryStorage(),
        'test.auth',
      ),
      deviceIdentityStore: createWebIMDeviceIdentityStore(
        new MemoryStorage(),
        () => 'device-realtime-data',
        'test.device',
      ),
      fetch: gatewayFetch,
      WebSocket: realtime.WebSocket,
      accountDatabase,
      reportBackgroundError: cause => backgroundErrors.push(cause),
    });
    // publishedVersions 记录 useSyncExternalStore 会收到的数据通知。
    const publishedVersions: number[] = [];
    // unsubscribe 与 runtime 生命周期一起释放。
    const unsubscribe = runtime.subscribe(() => {
      publishedVersions.push(runtime.getSnapshot().dataVersion);
    });

    await runtime.login({ type: 'account', account: 'a', password: 'p' });
    // socket open 先让 lifecycle 进入 online。
    const socket = realtime.sockets[0];
    socket?.onopen?.();
    // 会话事件先建立 message 所需的本地 conversation cursor。
    socket?.onmessage?.({
      data: JSON.stringify({
        type: 'conversation.changed',
        data: {
          conversation_id: 'sg_runtime-team',
          type: 'group',
          group: { group_id: 'runtime-team', title: 'Runtime 群' },
          unread_count: '0',
          last_msg_seq: '0',
          updated_at: '2026-08-09T10:00:00.000Z',
        },
      }),
    });
    // message.created 由共享 normalizer 归一化为 message event。
    socket?.onmessage?.({
      data: JSON.stringify({
        type: 'message.created',
        data: {
          msg_id: 'server-runtime-1',
          client_msg_id: 'client-runtime-1',
          conversation_id: 'sg_runtime-team',
          sender_id: 'peer-runtime',
          msg_seq: '1',
          type: 101,
          sent_at: '2026-08-09T10:01:00.000Z',
          body: { text: { text: '实时消息' } },
        },
      }),
    });

    await vi.waitFor(() => {
      expect(runtime.getSnapshot().dataVersion).toBe(2);
    });
    // getSync 返回同一 facade，页面与 runtime 共享唯一 realtime queue owner。
    expect(runtime.getSync()).toBe(runtime.getSync());
    await expect(runtime.getSync().conversations.listCached()).resolves.toMatchObject([
      {
        conversationID: 'sg_runtime-team',
        latestMessageID: 'client-runtime-1',
        lastMsgSeq: '1',
        unreadCount: 1,
      },
    ]);
    await expect(
      runtime.getSync().messages.getCachedHistory({
        conversationID: 'sg_runtime-team',
      }),
    ).resolves.toMatchObject([
      {
        clientMsgID: 'client-runtime-1',
        direction: 'incoming',
      },
    ]);
    // 编辑事件复用独立 update_seq，不改变原始 msg_seq。
    socket?.onmessage?.({
      data: JSON.stringify({
        type: 'message.update',
        data: {
          update_id: 'runtime-update-1',
          conversation_id: 'sg_runtime-team',
          update_seq: '1',
          type: 'edited',
          target_msg_id: 'server-runtime-1',
          message: {
            msg_id: 'server-runtime-1',
            client_msg_id: 'client-runtime-1',
            conversation_id: 'sg_runtime-team',
            sender_id: 'peer-runtime',
            msg_seq: '1',
            type: 101,
            sent_at: '2026-08-09T10:01:00.000Z',
            body: { text: { text: '实时编辑' } },
          },
        },
      }),
    });
    await vi.waitFor(() => {
      expect(runtime.getSnapshot().dataVersion).toBe(3);
    });
    await expect(
      runtime.getSync().messages.getCachedHistory({
        conversationID: 'sg_runtime-team',
      }),
    ).resolves.toMatchObject([
      { seq: 1, payload: { text: { text: '实时编辑' } } },
    ]);
    // delete_scope=all 对应 Gateway 全员撤回，本地历史应隐藏目标。
    socket?.onmessage?.({
      data: JSON.stringify({
        type: 'message.update',
        data: {
          update_id: 'runtime-update-2',
          conversation_id: 'sg_runtime-team',
          update_seq: '2',
          type: 'deleted',
          target_msg_id: 'server-runtime-1',
          delete_scope: 'all',
        },
      }),
    });
    await vi.waitFor(() => {
      expect(runtime.getSnapshot().dataVersion).toBe(4);
    });
    await expect(
      runtime.getSync().messages.getCachedHistory({
        conversationID: 'sg_runtime-team',
      }),
    ).resolves.toHaveLength(0);
    expect(publishedVersions).toContain(1);
    expect(publishedVersions).toContain(2);
    expect(publishedVersions).toContain(3);
    expect(publishedVersions).toContain(4);
    expect(backgroundErrors).toEqual([]);
    unsubscribe();
    await runtime.signOut();
    runtime.dispose();
  });
});
