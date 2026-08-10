import {
  IMError,
  type GatewayFetch,
  type GatewayFetchResponse,
  type GatewayWebSocketConstructor,
} from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import { createWebIMAuthSessionStore } from './auth-session-store.js';
import { createWebIMDeviceIdentityStore } from './device-identity-store.js';
import { createWebIMRuntime } from './web-im-runtime.js';
import { isWebIMUnregisteredAccountError } from './web-im-authentication.js';
import { createWebIMRuntimeTestPorts } from './web-im-runtime-test-ports.js';

/** 测试 runtime 使用的固定非生产配置。 */
const TEST_RUNTIME_CONFIG = {
  gatewayHTTPURL: 'https://gateway.example.com',
  gatewayWebSocketURL: 'wss://push.example.com/ws',
  platformID: 5,
  language: 'zh-CN',
} as const;

/** 测试隔离使用的同步 Storage。 */
class MemoryStorage {
  // records 只存在于单个测试实例。
  private readonly records = new Map<string, string>();

  /** 读取指定 key。 */
  getItem(key: string): string | null {
    return this.records.get(key) ?? null;
  }

  /** 覆盖指定 key。 */
  setItem(key: string, value: string): void {
    this.records.set(key, value);
  }

  /** 删除指定 key。 */
  removeItem(key: string): void {
    this.records.delete(key);
  }
}

/** 最小 WebSocket 只满足注册/登录后 realtime 构造。 */
class SilentWebSocket {
  onopen: ((event?: unknown) => void) | null = null;
  onmessage: ((event: { readonly data?: unknown }) => void) | null = null;
  onerror: ((event?: unknown) => void) | null = null;
  onclose: ((event?: unknown) => void) | null = null;
  readonly readyState = 1;

  /** 测试不需要读取连接 URL。 */
  constructor(_url: string) {}

  /** 测试不消费认证 frame。 */
  send(_data: string): void {}

  /** 测试只要求 close 可调用。 */
  close(): void {}
}

/** 创建共享 Gateway client 可消费的成功信封。 */
function createGatewayResponse(data: unknown): GatewayFetchResponse {
  return {
    ok: true,
    status: 200,
    json: async () => ({ code: 0, data }),
  };
}

/** 创建带确定性 device ID 的 runtime。 */
function createRuntime(fetch: GatewayFetch) {
  // authSessionStore 用于断言注册结果已进入 tab session。
  const authSessionStore = createWebIMAuthSessionStore(
    new MemoryStorage(),
    'test.auth.register',
  );
  // deviceIdentityStore 固定 device ID 便于检查请求体。
  const deviceIdentityStore = createWebIMDeviceIdentityStore(
    new MemoryStorage(),
    () => 'device-auth-0001',
    'test.device.register',
  );
  // runtime 使用真实 Gateway client 与无状态测试端口。
  const runtime = createWebIMRuntime({
    config: TEST_RUNTIME_CONFIG,
    authSessionStore,
    deviceIdentityStore,
    fetch,
    WebSocket: SilentWebSocket as GatewayWebSocketConstructor,
    ...createWebIMRuntimeTestPorts(),
  });
  return { authSessionStore, runtime };
}

// 注册与验证码登录共享同一认证生命周期的聚焦回归。
describe('Web IM runtime auth methods', () => {
  // 页面只消费 SDK 标准化判断，不读取 Gateway 原始错误信封。
  it('normalizes the unregistered account business error', () => {
    // unregisteredError 模拟共享 client 对 20002 信封的结构化异常。
    const unregisteredError = new IMError({
      code: 'GATEWAY_API_ERROR',
      message: 'account not registered',
      source: 'transport',
      cause: { code: 20002 },
    });
    expect(isWebIMUnregisteredAccountError(unregisteredError)).toBe(true);
    expect(isWebIMUnregisteredAccountError(new Error('network failed'))).toBe(false);
  });

  // 账号注册必须命中共享 register operation 并建立真实会话。
  it('registers an account and establishes the authenticated runtime', async () => {
    // requests 保存 endpoint 和 JSON body。
    const requests: Array<{ readonly input: string; readonly body: string }> = [];
    // gatewayFetch 为注册返回完整认证数据。
    const gatewayFetch: GatewayFetch = async (input, init) => {
      requests.push({ input, body: init.body });
      return createGatewayResponse({
        token: { access_token: 'access-register', subject_id: 'user-register' },
        user: { user_id: 'user-register' },
      });
    };
    // harness 暴露 runtime 和 session store。
    const { authSessionStore, runtime } = createRuntime(gatewayFetch);

    await expect(runtime.register({
      type: 'account',
      account: 'account001',
      password: 'Password1',
    })).resolves.toMatchObject({ state: 'connecting', userID: 'user-register' });
    expect(requests[0]?.input).toBe('https://gateway.example.com/v1/auth/register');
    expect(JSON.parse(requests[0]?.body ?? '{}')).toEqual({
      type: 'account',
      account: 'account001',
      password: 'Password1',
      device_id: 'device-auth-0001',
    });
    expect(authSessionStore.load()).toMatchObject({ userID: 'user-register' });
    runtime.dispose();
  });

  // 手机号登录字段必须原样交给共享 user-login operation。
  it('forwards phone verification fields through the login operation', async () => {
    // requestBody 捕获共享 client 最终发送的 JSON。
    let requestBody = '';
    // gatewayFetch 返回完整认证数据并记录请求体。
    const gatewayFetch: GatewayFetch = async (_input, init) => {
      requestBody = init.body;
      return createGatewayResponse({
        token: { access_token: 'access-phone', subject_id: 'user-phone' },
        user: { user_id: 'user-phone' },
      });
    };
    // runtime 使用与注册测试相同的真实 client composition。
    const { runtime } = createRuntime(gatewayFetch);

    await runtime.login({
      type: 'phone',
      account: '13800138000',
      phone_area_code: '+86',
      verification_code: '666666',
    });
    expect(JSON.parse(requestBody)).toMatchObject({
      type: 'phone',
      account: '13800138000',
      phone_area_code: '+86',
      verification_code: '666666',
      device_id: 'device-auth-0001',
    });
    runtime.dispose();
  });
});
