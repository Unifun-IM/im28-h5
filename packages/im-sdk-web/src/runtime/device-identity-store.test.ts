import { describe, expect, it } from 'vitest';

import {
  createWebIMDeviceIdentityStore,
  type WebIMPersistentStorage,
} from './device-identity-store.js';

/** 创建隔离的 localStorage 测试端口。 */
function createMemoryPersistentStorage(): WebIMPersistentStorage {
  // 单测试 Map 避免 device identity 跨用例共享。
  const records = new Map<string, string>();
  return {
    getItem: key => records.get(key) ?? null,
    setItem: (key, value) => records.set(key, value),
    removeItem: key => records.delete(key),
  };
}

// 浏览器 device identity 持久化测试集合。
describe('Web IM device identity store', () => {
  // 验证首次生成后始终复用相同 device ID。
  it('creates and reuses a stable device ID', () => {
    // 隔离 storage 模拟同一浏览器 origin。
    const storage = createMemoryPersistentStorage();
    // Store 使用确定性 generator 便于断言。
    const store = createWebIMDeviceIdentityStore(
      storage,
      () => 'device-id-0001',
      'test.device',
    );

    expect(store.getOrCreate()).toBe('device-id-0001');
    expect(store.getOrCreate()).toBe('device-id-0001');
  });

  // 验证损坏 device binding 被清理并显式报错。
  it('removes and rejects a corrupt device ID', () => {
    // 过短值违反 device ID contract。
    const storage = createMemoryPersistentStorage();
    storage.setItem('test.device', 'bad');
    // Generator 不应在损坏恢复时被静默调用。
    const store = createWebIMDeviceIdentityStore(
      storage,
      () => 'device-id-0002',
      'test.device',
    );

    expect(() => store.getOrCreate()).toThrowError(
      expect.objectContaining({ code: 'CORRUPT_DEVICE_ID' }),
    );
    expect(storage.getItem('test.device')).toBeNull();
  });
});
