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

/** 为 refresh 测试提供隔离的同步 storage。 */
class MemoryStorage {
  // 每个实例独占 auth 或 device 记录。
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

/** 创建共享 Gateway client 可解析的成功响应。 */
function createGatewayResponse(data: unknown = {}): GatewayFetchResponse {
  return {
    ok: true,
    status: 200,
    json: async () => ({ code: 0, data }),
  };
}

// Token refresh orchestration 的聚焦回归集合。
describe('Web IM runtime refresh', () => {
  // 验证无效 access token 使用同一 device ID 刷新并替换会话。
  it('refreshes an invalid restored session before realtime connect', async () => {
    // 旧会话模拟页面刷新前保存的 tab token。
    const authSessionStore = createWebIMAuthSessionStore(
      new MemoryStorage(),
      'test.auth',
    );
    authSessionStore.save({
      userID: 'user-refresh',
      accessToken: 'access-old',
      refreshToken: 'refresh-old',
    });
    // 请求记录用于确认 refresh body 沿用稳定 device identity。
    const requests: Array<{ readonly input: string; readonly body: string }> = [];
    // Gateway fetch 返回 check-token invalid 和新的 auth token envelope。
    const gatewayFetch: GatewayFetch = async (input, init) => {
      requests.push({ input, body: init.body });
      if (input.endsWith('/v1/auth/check-token')) {
        return createGatewayResponse({ valid: false });
      }
      if (input.endsWith('/v1/auth/refresh-token')) {
        return createGatewayResponse({
          token: {
            access_token: 'access-new',
            refresh_token: 'refresh-new',
          },
        });
      }
      return createGatewayResponse();
    };
    // Device store 为 check/refresh/realtime 提供同一 ID。
    const deviceIdentityStore = createWebIMDeviceIdentityStore(
      new MemoryStorage(),
      () => 'device-id-refresh',
      'test.device',
    );
    // Socket constructor 只记录连接 URL，测试无需真正打开连接。
    const socketURLs: string[] = [];
    /** refresh 成功后应创建一次 realtime socket。 */
    class TestWebSocket {
      onopen = null;
      onmessage = null;
      onerror = null;
      onclose = null;
      readonly readyState = 1;

      /** 保存带新会话 identity 的连接 URL。 */
      constructor(url: string) {
        socketURLs.push(url);
      }

      /** 未打开的测试 socket 不发送 frame。 */
      send(): void {}

      /** 退出时允许 runtime 幂等关闭测试 socket。 */
      close(): void {}
    }
    // Runtime 使用真实共享 HTTP client 执行 check + refresh。
    const runtime = createWebIMRuntime({
      config: {
        gatewayHTTPURL: 'https://gateway.example.com',
        gatewayWebSocketURL: 'wss://push.example.com/ws',
        platformID: 5,
        language: 'zh-CN',
      },
      authSessionStore,
      deviceIdentityStore,
      fetch: gatewayFetch,
      WebSocket: TestWebSocket as GatewayWebSocketConstructor,
      ...createWebIMRuntimeTestPorts(),
    });

    await expect(runtime.restore()).resolves.toBe(true);
    expect(authSessionStore.load()).toEqual({
      userID: 'user-refresh',
      accessToken: 'access-new',
      refreshToken: 'refresh-new',
    });
    // Refresh request 必须带旧 refresh token 和稳定 device ID。
    const refreshRequest = requests.find(request =>
      request.input.endsWith('/v1/auth/refresh-token'),
    );
    expect(JSON.parse(refreshRequest?.body ?? '{}')).toEqual({
      refresh_token: 'refresh-old',
      device_id: 'device-id-refresh',
    });
    expect(socketURLs[0]).toContain('user_id=user-refresh');
    await runtime.signOut();
    runtime.dispose();
  });
});
