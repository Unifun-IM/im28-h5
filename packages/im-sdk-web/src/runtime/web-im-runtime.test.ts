import type {
  GatewayFetch,
  GatewayFetchResponse,
  GatewayWebSocketConstructor,
} from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import { createWebIMAuthSessionStore } from './auth-session-store.js';
import { createWebIMDeviceIdentityStore } from './device-identity-store.js';
import { createWebIMRuntime } from './web-im-runtime.js';
import { createWebIMRuntimeTestPorts } from './web-im-runtime-test-ports.js';

// 测试使用的固定 runtime 配置不包含任何真实 Gateway 凭据。
const TEST_RUNTIME_CONFIG = {
  gatewayHTTPURL: 'https://gateway.example.com',
  gatewayWebSocketURL: 'wss://push.example.com/ws',
  platformID: 5,
  language: 'zh-CN',
} as const;

/** 为 auth/device store 提供隔离的同步浏览器 storage。 */
class MemoryStorage {
  // 每个实例独占记录，模拟单一 origin 的指定 storage surface。
  private readonly records = new Map<string, string>();

  /** 按浏览器 Storage contract 读取值。 */
  getItem(key: string): string | null {
    return this.records.get(key) ?? null;
  }

  /** 按浏览器 Storage contract 覆盖值。 */
  setItem(key: string, value: string): void {
    this.records.set(key, value);
  }

  /** 按浏览器 Storage contract 删除值。 */
  removeItem(key: string): void {
    this.records.delete(key);
  }
}

/** 创建可由测试主动触发 open/close 的 WebSocket constructor。 */
function createWebSocketHarness() {
  // sockets 记录 runtime 创建的真实 URL、auth frame 和关闭动作。
  const sockets: TestWebSocket[] = [];

  /** 最小 WebSocket 实现满足共享 Gateway realtime client contract。 */
  class TestWebSocket {
    onopen: ((event?: unknown) => void) | null = null;
    onmessage: ((event: { readonly data?: unknown }) => void) | null = null;
    onerror: ((event?: unknown) => void) | null = null;
    onclose: ((event?: unknown) => void) | null = null;
    readonly readyState = 1;
    readonly sentFrames: string[] = [];
    readonly url: string;
    closed = false;

    /** 保存连接 URL 并向 harness 注册实例。 */
    constructor(url: string) {
      this.url = url;
      sockets.push(this);
    }

    /** 记录共享 realtime client 发送的 auth/heartbeat frame。 */
    send(data: string): void {
      this.sentFrames.push(data);
    }

    /** 标记 runtime 已执行本地 socket close。 */
    close(): void {
      this.closed = true;
    }
  }

  return {
    WebSocket: TestWebSocket as GatewayWebSocketConstructor,
    sockets,
  };
}

/** 创建共享 Gateway fetch 可消费的成功信封。 */
function createGatewayResponse(data: unknown = {}): GatewayFetchResponse {
  return {
    ok: true,
    status: 200,
    json: async () => ({ code: 0, data }),
  };
}

// Web runtime 对共享 Gateway clients 的 orchestration 测试集合。
describe('Web IM runtime', () => {
  // 验证登录、session 保存、realtime auth frame 和本地退出闭环。
  it('logs in, connects realtime and signs out', async () => {
    // sessionStorage 与 localStorage 在测试中保持物理隔离。
    const sessionStorage = new MemoryStorage();
    // Auth store 使用测试 key，避免绑定生产 key 字面量。
    const authSessionStore = createWebIMAuthSessionStore(
      sessionStorage,
      'test.auth',
    );
    // device identity 使用确定性 ID 验证 HTTP/WS 参数一致。
    const deviceIdentityStore = createWebIMDeviceIdentityStore(
      new MemoryStorage(),
      () => 'device-id-0001',
      'test.device',
    );
    // 所有 HTTP 请求用于检查共享 client 生成的 endpoint 和 body。
    const requests: Array<{ readonly input: string; readonly body: string }> = [];
    // Gateway fetch 根据 endpoint 返回真实 envelope shape。
    const gatewayFetch: GatewayFetch = async (input, init) => {
      requests.push({ input, body: init.body });
      if (input.endsWith('/v1/auth/user-login')) {
        return createGatewayResponse({
          token: {
            access_token: 'access-1',
            refresh_token: 'refresh-1',
            subject_id: 'user-1',
          },
          user: { user_id: 'user-1' },
        });
      }
      return createGatewayResponse();
    };
    // WebSocket harness 允许测试控制 connected 时机。
    const realtime = createWebSocketHarness();
    // Runtime 使用真实共享 Gateway client 和注入式 browser ports。
    const runtime = createWebIMRuntime({
      config: TEST_RUNTIME_CONFIG,
      authSessionStore,
      deviceIdentityStore,
      fetch: gatewayFetch,
      WebSocket: realtime.WebSocket,
      ...createWebIMRuntimeTestPorts(),
    });

    await expect(
      runtime.login({ type: 'account', account: 'alice', password: 'secret' }),
    ).resolves.toEqual({ state: 'connecting', userID: 'user-1' });
    // 登录请求必须使用 runtime 注入的稳定 device ID。
    const loginRequest = requests.find(request =>
      request.input.endsWith('/v1/auth/user-login'),
    );
    expect(JSON.parse(loginRequest?.body ?? '{}')).toMatchObject({
      device_id: 'device-id-0001',
    });
    expect(authSessionStore.load()).toEqual({
      userID: 'user-1',
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
    });

    // 首个 socket URL 应携带与 HTTP 相同的 user/device identity。
    const socket = realtime.sockets[0];
    expect(socket?.url).toContain('user_id=user-1');
    expect(socket?.url).toContain('device_id=device-id-0001');
    socket?.onopen?.();
    expect(runtime.getSnapshot()).toEqual({
      state: 'online',
      userID: 'user-1',
    });
    // Auth frame 由共享 realtime client 生成，runtime 只注入配置。
    const authFrame = JSON.parse(socket?.sentFrames[0] ?? '{}');
    expect(authFrame).toMatchObject({
      type: 'auth',
      user_id: 'user-1',
      token: 'access-1',
      platform_id: 5,
      device_id: 'device-id-0001',
    });

    await runtime.signOut();
    expect(runtime.getSnapshot()).toEqual({ state: 'anonymous', userID: null });
    expect(authSessionStore.load()).toBeNull();
    expect(socket?.closed).toBe(true);
    runtime.dispose();
  });

  // 验证已有 tab session 通过 check-token 后恢复 realtime。
  it('restores a valid tab session', async () => {
    // 恢复测试预先写入一个有效的最小认证会话。
    const authSessionStore = createWebIMAuthSessionStore(
      new MemoryStorage(),
      'test.auth',
    );
    authSessionStore.save({
      userID: 'user-2',
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
    });
    // check-token 返回有效，其他 endpoint 仅需成功空信封。
    const gatewayFetch: GatewayFetch = async input =>
      createGatewayResponse(
        input.endsWith('/v1/auth/check-token') ? { valid: true } : {},
      );
    // 恢复链路使用与 session 匹配的稳定 device identity。
    const deviceIdentityStore = createWebIMDeviceIdentityStore(
      new MemoryStorage(),
      () => 'device-id-0002',
      'test.device',
    );
    // WebSocket harness 验证 restore 后确实创建实时连接。
    const realtime = createWebSocketHarness();
    // Runtime 仍使用真实共享 HTTP/WS clients。
    const runtime = createWebIMRuntime({
      config: TEST_RUNTIME_CONFIG,
      authSessionStore,
      deviceIdentityStore,
      fetch: gatewayFetch,
      WebSocket: realtime.WebSocket,
      ...createWebIMRuntimeTestPorts(),
    });

    await expect(runtime.restore()).resolves.toBe(true);
    expect(runtime.getSnapshot()).toEqual({
      state: 'connecting',
      userID: 'user-2',
    });
    expect(realtime.sockets).toHaveLength(1);
    await runtime.signOut();
    runtime.dispose();
  });

  // 验证缺失 token/user 的 Gateway 响应不能保存伪会话。
  it('rejects an incomplete auth response', async () => {
    // Auth store 用于断言失败后没有凭据残留。
    const authSessionStore = createWebIMAuthSessionStore(
      new MemoryStorage(),
      'test.auth',
    );
    // 登录 endpoint 返回业务成功但缺失认证字段的异常 data。
    const gatewayFetch: GatewayFetch = async () => createGatewayResponse({});
    // 无效响应不应创建 socket，但仍提供完整 constructor 依赖。
    const realtime = createWebSocketHarness();
    // Runtime device identity 使用有效确定性值。
    const deviceIdentityStore = createWebIMDeviceIdentityStore(
      new MemoryStorage(),
      () => 'device-id-0003',
      'test.device',
    );
    // Runtime 聚焦验证 auth response gate。
    const runtime = createWebIMRuntime({
      config: TEST_RUNTIME_CONFIG,
      authSessionStore,
      deviceIdentityStore,
      fetch: gatewayFetch,
      WebSocket: realtime.WebSocket,
      ...createWebIMRuntimeTestPorts(),
    });

    await expect(
      runtime.login({ type: 'account', account: 'alice', password: 'secret' }),
    ).rejects.toMatchObject({ code: 'INVALID_AUTH_RESPONSE' });
    expect(runtime.getSnapshot()).toEqual({ state: 'anonymous', userID: null });
    expect(authSessionStore.load()).toBeNull();
    expect(realtime.sockets).toHaveLength(0);
    runtime.dispose();
  });

  // 验证远端 logout 失败不会阻止本地凭据清理。
  it('completes local sign-out when Gateway logout fails', async () => {
    // 已保存会话模拟离线前仍处于登录状态的 tab。
    const authSessionStore = createWebIMAuthSessionStore(
      new MemoryStorage(),
      'test.auth',
    );
    authSessionStore.save({
      userID: 'user-offline',
      accessToken: 'access-offline',
    });
    // 所有 Gateway 请求失败，复现退出时网络不可用。
    const gatewayFetch: GatewayFetch = async () => {
      throw new Error('network unavailable');
    };
    // 退出流程仍需要满足 runtime 构造的 device identity contract。
    const deviceIdentityStore = createWebIMDeviceIdentityStore(
      new MemoryStorage(),
      () => 'device-id-offline',
      'test.device',
    );
    // 未连接 realtime 时 constructor 不会被实际调用。
    const realtime = createWebSocketHarness();
    // Runtime 直接从 session store 读取待退出会话。
    const runtime = createWebIMRuntime({
      config: TEST_RUNTIME_CONFIG,
      authSessionStore,
      deviceIdentityStore,
      fetch: gatewayFetch,
      WebSocket: realtime.WebSocket,
      ...createWebIMRuntimeTestPorts(),
    });

    await expect(runtime.signOut()).resolves.toBeUndefined();
    expect(authSessionStore.load()).toBeNull();
    expect(runtime.getSnapshot()).toEqual({ state: 'anonymous', userID: null });
    runtime.dispose();
  });
});
