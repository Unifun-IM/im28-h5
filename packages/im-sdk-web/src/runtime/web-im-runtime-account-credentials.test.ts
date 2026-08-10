import type { GatewayFetch, GatewayFetchResponse, GatewayWebSocketConstructor } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import type { WebIMAccountDatabaseLifecycle } from '../storage/index.js';
import { createWebIMAuthSessionStore } from './auth-session-store.js';
import { createWebIMDeviceIdentityStore } from './device-identity-store.js';
import { createWebIMRuntime } from './web-im-runtime.js';

/** 测试 runtime 使用固定且不含真实凭据的 Gateway 配置。 */
const TEST_RUNTIME_CONFIG = {
  gatewayHTTPURL: 'https://gateway.example.com',
  gatewayWebSocketURL: 'wss://push.example.com/ws',
  platformID: 5,
  language: 'zh-CN',
} as const;

/** 隔离每个测试的浏览器 Storage 记录。 */
class MemoryStorage {
  private readonly records = new Map<string, string>();

  /** 读取指定 key。 */
  getItem(key: string): string | null { return this.records.get(key) ?? null; }
  /** 覆盖指定 key。 */
  setItem(key: string, value: string): void { this.records.set(key, value); }
  /** 删除指定 key。 */
  removeItem(key: string): void { this.records.delete(key); }
}

/** 最小 WebSocket 暴露 reset 后的 close 证据。 */
class CredentialTestWebSocket {
  onopen: ((event?: unknown) => void) | null = null;
  onmessage: ((event: { readonly data?: unknown }) => void) | null = null;
  onerror: ((event?: unknown) => void) | null = null;
  onclose: ((event?: unknown) => void) | null = null;
  readonly readyState = 1;
  closed = false;

  /** 测试只需满足 constructor contract。 */
  constructor(_url: string) {}
  /** 测试不消费 realtime frame。 */
  send(_data: string): void {}
  /** 记录 runtime 已关闭 realtime。 */
  close(): void { this.closed = true; }
}

/** 聚焦记录 Gateway endpoint/body 和账号 DB 生命周期。 */
interface CredentialRuntimeHarness {
  readonly runtime: ReturnType<typeof createWebIMRuntime>;
  readonly authSessionStore: ReturnType<typeof createWebIMAuthSessionStore>;
  readonly requests: Array<{ readonly input: string; readonly body: string }>;
  readonly databaseCloseCount: () => number;
}

/** 创建真实 Gateway client composition 的账号凭据测试 runtime。 */
function createCredentialRuntimeHarness(): CredentialRuntimeHarness {
  // requests 保存最终 generated operation 请求。
  const requests: Array<{ readonly input: string; readonly body: string }> = [];
  // closeCount 证明 reset 会关闭 account DB。
  let closeCount = 0;
  // authSessionStore 暴露本地 session 是否被清除。
  const authSessionStore = createWebIMAuthSessionStore(new MemoryStorage(), 'test.security.auth');
  // accountDatabase 只记录 open/close，不执行持久化。
  const accountDatabase: WebIMAccountDatabaseLifecycle = {
    open: async () => undefined,
    close: async () => { closeCount += 1; },
    getDatabase: () => null,
  };
  // gatewayFetch 为登录返回认证数据，其余 operation 返回成功空信封。
  const gatewayFetch: GatewayFetch = async (input, init) => {
    requests.push({ input, body: init.body });
    return createGatewayResponse(input.endsWith('/v1/auth/user-login') ? {
      token: { access_token: 'access-security', subject_id: 'user-security' },
      user: { user_id: 'user-security' },
    } : {});
  };
  // runtime 使用稳定 device ID 便于请求可重复。
  const runtime = createWebIMRuntime({
    config: TEST_RUNTIME_CONFIG,
    authSessionStore,
    deviceIdentityStore: createWebIMDeviceIdentityStore(new MemoryStorage(), () => 'device-security', 'test.security.device'),
    fetch: gatewayFetch,
    WebSocket: CredentialTestWebSocket as GatewayWebSocketConstructor,
    accountDatabase,
    reportBackgroundError: cause => { throw cause; },
  });
  return { runtime, authSessionStore, requests, databaseCloseCount: () => closeCount };
}

/** 创建共享 Gateway client 可读取的成功信封。 */
function createGatewayResponse(data: unknown): GatewayFetchResponse {
  return { ok: true, status: 200, json: async () => ({ code: 0, data }) };
}

// 账号凭据 mutation 必须保持真实 Gateway 与本地 session 语义一致。
describe('Web IM runtime account credentials', () => {
  // 匿名调用必须在网络请求前失败。
  it('rejects anonymous credential mutations', async () => {
    const harness = createCredentialRuntimeHarness();
    await expect(harness.runtime.setAccountPassword({ account: 'account001', password: 'Password1' }))
      .rejects.toMatchObject({ code: 'ACCOUNT_SECURITY_AUTH_REQUIRED' });
    await expect(harness.runtime.resetPassword({ old_password: 'Password1', password: 'Password2' }))
      .rejects.toMatchObject({ code: 'ACCOUNT_SECURITY_AUTH_REQUIRED' });
    expect(harness.requests).toHaveLength(0);
  });

  // 首次设置账号密码不应退出当前会话。
  it('sets account credentials and retains the authenticated runtime', async () => {
    const harness = createCredentialRuntimeHarness();
    await harness.runtime.login({ type: 'account', account: 'account001', password: 'Password1' });
    await harness.runtime.setAccountPassword({ account: ' account002 ', password: 'Password2' });
    const request = harness.requests.at(-1);
    expect(request?.input).toBe('https://gateway.example.com/v1/user/account-password/set');
    expect(JSON.parse(request?.body ?? '{}')).toEqual({ account: 'account002', password: 'Password2' });
    expect(harness.runtime.getSnapshot().userID).toBe('user-security');
    expect(harness.authSessionStore.load()?.userID).toBe('user-security');
    expect(harness.databaseCloseCount()).toBe(0);
    harness.runtime.dispose();
  });

  // 密码重置成功后必须关闭 socket、清 session 并关闭账号 DB。
  it('resets the password and invalidates the revoked session locally', async () => {
    const harness = createCredentialRuntimeHarness();
    await harness.runtime.login({ type: 'account', account: 'account001', password: 'Password1' });
    await harness.runtime.resetPassword({ old_password: 'Password1', password: 'Password2' });
    const request = harness.requests.at(-1);
    expect(request?.input).toBe('https://gateway.example.com/v1/auth/password/reset');
    expect(JSON.parse(request?.body ?? '{}')).toEqual({ old_password: 'Password1', password: 'Password2' });
    expect(harness.runtime.getSnapshot()).toEqual({ state: 'anonymous', userID: null, dataVersion: 0 });
    expect(harness.authSessionStore.load()).toBeNull();
    expect(harness.databaseCloseCount()).toBe(1);
    harness.runtime.dispose();
  });
});
