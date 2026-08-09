import { describe, expect, it } from 'vitest';

import {
  createWebIMAuthSessionStore,
  type WebIMSessionStorage,
} from './auth-session-store.js';

/** 创建与 sessionStorage 行为一致的内存测试端口。 */
function createMemorySessionStorage(): WebIMSessionStorage {
  // Map 只归属于单个测试，避免凭据跨测试泄漏。
  const records = new Map<string, string>();
  return {
    getItem: key => records.get(key) ?? null,
    setItem: (key, value) => records.set(key, value),
    removeItem: key => records.delete(key),
  };
}

// tab 级认证会话持久化契约测试集合。
describe('Web IM auth session store', () => {
  // 验证最小凭据可保存、恢复并明确清除。
  it('saves, loads and clears a validated session', () => {
    // 隔离 storage 模拟一个浏览器 tab session。
    const storage = createMemorySessionStorage();
    // 自定义 key 避免测试依赖默认 key 的具体值。
    const store = createWebIMAuthSessionStore(storage, 'test.auth');
    store.save({
      userID: ' user-1 ',
      accessToken: ' access-1 ',
      refreshToken: ' refresh-1 ',
    });

    expect(store.load()).toEqual({
      userID: 'user-1',
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
    });
    store.clear();
    expect(store.load()).toBeNull();
  });

  // 验证损坏记录会被清除且 restore 显式失败。
  it('removes and rejects a corrupt session', () => {
    // 损坏 JSON 模拟被扩展或旧版本污染的 sessionStorage。
    const storage = createMemorySessionStorage();
    storage.setItem('test.auth', '{invalid');
    // Store 必须使用与损坏记录相同的测试 key。
    const store = createWebIMAuthSessionStore(storage, 'test.auth');

    expect(() => store.load()).toThrowError(
      expect.objectContaining({ code: 'CORRUPT_AUTH_SESSION' }),
    );
    expect(storage.getItem('test.auth')).toBeNull();
  });
});
