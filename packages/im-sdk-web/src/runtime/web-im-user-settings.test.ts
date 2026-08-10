import type {
  GatewayFetch,
  GatewayFetchResponse,
  GatewayWebSocketConstructor,
} from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import { createWebIMAuthSessionStore } from './auth-session-store.js';
import { createWebIMDeviceIdentityStore } from './device-identity-store.js';
import { createWebIMRuntimeTestPorts } from './web-im-runtime-test-ports.js';
import { createWebIMRuntime } from './web-im-runtime.js';

/** 测试使用固定且不含真实凭据的 Gateway 配置。 */
const TEST_RUNTIME_CONFIG = {
  gatewayHTTPURL: 'https://gateway.example.com',
  gatewayWebSocketURL: 'wss://push.example.com/ws',
  platformID: 5,
  language: 'zh-CN',
} as const;

/** 隔离每个测试的浏览器 Storage。 */
class MemoryStorage {
  private readonly records = new Map<string, string>();

  /** 读取记录。 */
  getItem(key: string): string | null { return this.records.get(key) ?? null; }
  /** 写入记录。 */
  setItem(key: string, value: string): void { this.records.set(key, value); }
  /** 删除记录。 */
  removeItem(key: string): void { this.records.delete(key); }
}

/** 测试只要求 WebSocket 满足 runtime constructor contract。 */
class SettingsTestWebSocket {
  onopen: ((event?: unknown) => void) | null = null;
  onmessage: ((event: { readonly data?: unknown }) => void) | null = null;
  onerror: ((event?: unknown) => void) | null = null;
  onclose: ((event?: unknown) => void) | null = null;
  readonly readyState = 1;

  /** URL 不参与设置测试。 */
  constructor(_url: string) {}
  /** 设置测试不消费 realtime frame。 */
  send(_data: string): void {}
  /** 设置测试无需记录关闭行为。 */
  close(): void {}
}

/** 创建共享 Gateway client 可读取的成功信封。 */
function createGatewayResponse(data: unknown): GatewayFetchResponse {
  return { ok: true, status: 200, json: async () => ({ code: 0, data }) };
}

// 用户设置测试证明默认 runtime caller 会命中真实共享 Gateway operation。
describe('Web IM user settings', () => {
  // 匿名读取必须在网络前失败。
  it('rejects anonymous notification settings access', async () => {
    // requests 证明匿名调用没有访问网络。
    const requests: string[] = [];
    // storage 隔离当前 runtime。
    const storage = new MemoryStorage();
    // runtime 使用真实 composition 和无持久化测试端口。
    const runtime = createWebIMRuntime({
      config: TEST_RUNTIME_CONFIG,
      authSessionStore: createWebIMAuthSessionStore(storage),
      deviceIdentityStore: createWebIMDeviceIdentityStore(storage, () => 'device-settings'),
      fetch: async input => { requests.push(input); return createGatewayResponse({}); },
      WebSocket: SettingsTestWebSocket as GatewayWebSocketConstructor,
      ...createWebIMRuntimeTestPorts(),
    });
    await expect(runtime.getSettings().getNotification()).rejects.toMatchObject({
      code: 'USER_SETTINGS_AUTH_REQUIRED',
    });
    expect(requests).toEqual([]);
  });

  // 认证用户的读取和更新必须使用共享 endpoint/body 并返回服务端状态。
  it('reads and updates notification settings through Gateway', async () => {
    // requests 保存最终 generated operation 请求。
    const requests: Array<{ readonly input: string; readonly body: string }> = [];
    // gatewayFetch 按 endpoint 返回登录或通知设置数据。
    const gatewayFetch: GatewayFetch = async (input, init) => {
      requests.push({ input, body: init.body });
      if (input.endsWith('/v1/auth/user-login')) {
        return createGatewayResponse({
          token: { access_token: 'access-settings', subject_id: 'user-settings' },
          user: { user_id: 'user-settings' },
        });
      }
      return createGatewayResponse({
        setting: { user_id: 'user-settings', notification: false, private_chat: true },
      });
    };
    // storage 持有隔离 session/device identity。
    const storage = new MemoryStorage();
    // runtime 复用生产 Gateway client 组合。
    const runtime = createWebIMRuntime({
      config: TEST_RUNTIME_CONFIG,
      authSessionStore: createWebIMAuthSessionStore(storage),
      deviceIdentityStore: createWebIMDeviceIdentityStore(storage, () => 'device-settings'),
      fetch: gatewayFetch,
      WebSocket: SettingsTestWebSocket as GatewayWebSocketConstructor,
      ...createWebIMRuntimeTestPorts(),
    });
    await runtime.login({ type: 'account', account: 'account001', password: 'Password1' });
    await expect(runtime.getSettings().getNotification()).resolves.toMatchObject({ notification: false });
    await expect(runtime.getSettings().updateNotification({ type: 'notification', enabled: false }))
      .resolves.toMatchObject({ private_chat: true });
    expect(requests.at(-2)?.input).toBe('https://gateway.example.com/v1/setting/notification/detail');
    expect(requests.at(-1)?.input).toBe('https://gateway.example.com/v1/setting/notification/switch');
    expect(JSON.parse(requests.at(-1)?.body ?? '{}')).toEqual({ type: 'notification', enabled: false });
    runtime.dispose();
  });
});
