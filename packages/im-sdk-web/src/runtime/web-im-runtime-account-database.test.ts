import type {
  GatewayFetch,
  GatewayFetchResponse,
  GatewayWebSocketConstructor,
} from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import type { WebIMAccountDatabaseLifecycle } from '../storage/index.js';
import { createWebIMAuthSessionStore } from './auth-session-store.js';
import { createWebIMDeviceIdentityStore } from './device-identity-store.js';
import { createWebIMRuntime } from './web-im-runtime.js';

/** 为测试提供互相隔离的同步 browser storage。 */
class MemoryStorage {
  // 当前实例独占 auth 或 device 记录。
  private readonly records = new Map<string, string>();

  /** 读取测试记录。 */
  getItem(key: string): string | null {
    return this.records.get(key) ?? null;
  }

  /** 覆盖测试记录。 */
  setItem(key: string, value: string): void {
    this.records.set(key, value);
  }

  /** 删除测试记录。 */
  removeItem(key: string): void {
    this.records.delete(key);
  }
}

/** 创建记录 open/close 调用的账户数据库端口。 */
function createAccountDatabaseHarness(): {
  readonly lifecycle: WebIMAccountDatabaseLifecycle;
  readonly openedUserIDs: string[];
  readonly getCloseCount: () => number;
} {
  // openedUserIDs 保留调用顺序以验证认证完成后的账号绑定。
  const openedUserIDs: string[] = [];
  // closeCount 验证退出和失效事件均释放数据库。
  let closeCount = 0;
  return {
    lifecycle: {
      open: async userID => {
        openedUserIDs.push(userID);
      },
      close: async () => {
        closeCount += 1;
      },
      getDatabase: () => null,
    },
    openedUserIDs,
    getCloseCount: () => closeCount,
  };
}

/** 创建登录和 check-token 可解析的 Gateway 成功响应。 */
function createGatewayResponse(data: unknown): GatewayFetchResponse {
  return {
    ok: true,
    status: 200,
    json: async () => ({ code: 0, data }),
  };
}

/** 创建允许测试主动推送 token-expired 的 WebSocket harness。 */
function createWebSocketHarness() {
  // sockets 记录 runtime 创建的实时连接。
  const sockets: TestWebSocket[] = [];

  /** 最小 WebSocket 实现只暴露当前测试需要的事件入口。 */
  class TestWebSocket {
    onopen = null;
    onmessage: ((event: { readonly data?: unknown }) => void) | null = null;
    onerror = null;
    onclose = null;
    readonly readyState = 1;

    /** 向 harness 注册当前 socket。 */
    constructor() {
      sockets.push(this);
    }

    /** 当前测试不检查 auth frame 内容。 */
    send(): void {}

    /** Runtime 可幂等关闭测试 socket。 */
    close(): void {}
  }

  return {
    sockets,
    WebSocket: TestWebSocket as unknown as GatewayWebSocketConstructor,
  };
}

/** 创建带账户数据库 harness 的 runtime。 */
function createRuntime(
  gatewayFetch: GatewayFetch,
  accountDatabase: WebIMAccountDatabaseLifecycle,
  realtime: ReturnType<typeof createWebSocketHarness>,
) {
  // Auth store 与 device store 分离，符合生产浏览器存储边界。
  const authSessionStore = createWebIMAuthSessionStore(
    new MemoryStorage(),
    'test.auth',
  );
  // 后台 close 错误在测试中立即抛出，禁止静默吞错。
  const backgroundErrors: unknown[] = [];
  // Runtime 使用真实共享 Gateway clients 和注入式 account owner。
  const runtime = createWebIMRuntime({
    config: {
      gatewayHTTPURL: 'https://gateway.example.com',
      gatewayWebSocketURL: 'wss://push.example.com/ws',
      platformID: 5,
      language: 'zh-CN',
    },
    authSessionStore,
    deviceIdentityStore: createWebIMDeviceIdentityStore(
      new MemoryStorage(),
      () => 'device-account-db',
      'test.device',
    ),
    fetch: gatewayFetch,
    WebSocket: realtime.WebSocket,
    accountDatabase,
    reportBackgroundError: cause => backgroundErrors.push(cause),
  });
  return { authSessionStore, backgroundErrors, runtime };
}

// Runtime 与账户数据库生命周期的集成回归集合。
describe('Web IM runtime account database lifecycle', () => {
  // 验证登录后打开账号库，退出时关闭并清除凭据。
  it('opens after login and closes during sign-out', async () => {
    // Gateway login 返回完整的最小认证会话。
    const gatewayFetch: GatewayFetch = async input =>
      createGatewayResponse(
        input.endsWith('/v1/auth/user-login')
          ? {
              token: { access_token: 'access-db', subject_id: 'user-db' },
              user: { user_id: 'user-db' },
            }
          : {},
      );
    // 数据库 harness 记录 runtime 生命周期调用。
    const database = createAccountDatabaseHarness();
    // Socket harness 满足登录后的 realtime 创建。
    const realtime = createWebSocketHarness();
    // Runtime 聚焦验证 auth 与 account database 的顺序闭环。
    const { runtime } = createRuntime(
      gatewayFetch,
      database.lifecycle,
      realtime,
    );

    await runtime.login({ type: 'account', account: 'a', password: 'p' });
    expect(database.openedUserIDs).toEqual(['user-db']);
    await runtime.signOut();
    expect(database.getCloseCount()).toBe(1);
  });

  // 验证恢复有效 tab session 时先打开对应账号数据库。
  it('opens the restored account database before realtime connect', async () => {
    // check-token 明确确认保存的 access token 有效。
    const gatewayFetch: GatewayFetch = async () =>
      createGatewayResponse({ valid: true });
    // 数据库 harness 记录 restore 绑定的 userID。
    const database = createAccountDatabaseHarness();
    // Socket harness 只验证 restore 会进入 realtime 创建阶段。
    const realtime = createWebSocketHarness();
    // 预置 session 模拟同一 tab 刷新后的认证恢复。
    const { authSessionStore, runtime } = createRuntime(
      gatewayFetch,
      database.lifecycle,
      realtime,
    );
    authSessionStore.save({
      userID: 'user-restored',
      accessToken: 'access-restored',
    });

    await expect(runtime.restore()).resolves.toBe(true);
    expect(database.openedUserIDs).toEqual(['user-restored']);
    expect(realtime.sockets).toHaveLength(1);
    await runtime.signOut();
  });

  // 验证 SQLite 打开失败不会保存认证会话或启动 realtime。
  it('rejects login when the account database cannot open', async () => {
    // Gateway 登录成功用于把失败点收窄到本地数据库。
    const gatewayFetch: GatewayFetch = async () =>
      createGatewayResponse({
        token: { access_token: 'access-failed-db', subject_id: 'user-failed-db' },
        user: { user_id: 'user-failed-db' },
      });
    // 失败 lifecycle 模拟 migration 或 IndexedDB 初始化错误。
    const failedDatabase: WebIMAccountDatabaseLifecycle = {
      open: async () => {
        throw new Error('database migration failed');
      },
      close: async () => undefined,
      getDatabase: () => null,
    };
    // Socket harness 用于确认失败后没有建立实时连接。
    const realtime = createWebSocketHarness();
    // Auth store 用于确认不会保存部分成功会话。
    const { authSessionStore, runtime } = createRuntime(
      gatewayFetch,
      failedDatabase,
      realtime,
    );

    await expect(
      runtime.login({ type: 'account', account: 'a', password: 'p' }),
    ).rejects.toThrow('database migration failed');
    expect(authSessionStore.load()).toBeNull();
    expect(runtime.getSnapshot()).toEqual({ state: 'anonymous', userID: null });
    expect(realtime.sockets).toHaveLength(0);
  });

  // 验证 realtime token 失效会清凭据并异步关闭账号库。
  it('closes when realtime invalidates the session', async () => {
    // 登录链路只需要返回同一完整认证会话。
    const gatewayFetch: GatewayFetch = async () =>
      createGatewayResponse({
        token: { access_token: 'access-expired', subject_id: 'user-expired' },
        user: { user_id: 'user-expired' },
      });
    // 账户数据库 harness 用于确认失效事件触发 close。
    const database = createAccountDatabaseHarness();
    // Socket harness 允许直接送入 Gateway auth-invalid code。
    const realtime = createWebSocketHarness();
    // Auth store 用于确认 runtime 同步清除敏感会话。
    const { authSessionStore, backgroundErrors, runtime } = createRuntime(
      gatewayFetch,
      database.lifecycle,
      realtime,
    );

    await runtime.login({ type: 'account', account: 'a', password: 'p' });
    realtime.sockets[0]?.onmessage?.({
      data: JSON.stringify({ code: 100003 }),
    });
    // close 是异步端口，等待当前 microtask 完成再断言。
    await Promise.resolve();
    expect(database.getCloseCount()).toBe(1);
    expect(authSessionStore.load()).toBeNull();
    expect(runtime.getSnapshot()).toEqual({ state: 'anonymous', userID: null });
    expect(backgroundErrors).toEqual([]);
  });
});
