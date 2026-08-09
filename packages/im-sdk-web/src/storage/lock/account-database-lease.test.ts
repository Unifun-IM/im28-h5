import { describe, expect, it } from 'vitest';

import {
  createAccountDatabaseLeaseManager,
  createAccountDatabaseLockName,
  type WebLockManagerPort,
} from './account-database-lease.js';

// Fake manager 保留真实 Web Locks 的同名独占与 ifAvailable 立即返回语义。
class FakeWebLockManager implements WebLockManagerPort {
  // heldNames 代表当前仍在 callback promise 内的独占 lock。
  private readonly heldNames = new Set<string>();
  // requestedOptions 用于证明实现没有等待或使用 steal。
  readonly requestedOptions: Array<{
    readonly mode: 'exclusive';
    readonly ifAvailable: true;
  }> = [];

  /** 同名已持有时回调 null，否则持有到 callback 完成。 */
  async request<Result>(
    name: string,
    options: { readonly mode: 'exclusive'; readonly ifAvailable: true },
    callback: (
      lock: { readonly name: string; readonly mode: 'exclusive' } | null,
    ) => Promise<Result>,
  ): Promise<Result> {
    this.requestedOptions.push(options);
    if (this.heldNames.has(name)) {
      return callback(null);
    }
    this.heldNames.add(name);
    try {
      return await callback({ name, mode: 'exclusive' });
    } finally {
      this.heldNames.delete(name);
    }
  }
}

// 账户数据库 lease manager 的 Web Locks contract 回归集合。
describe('account database lease manager', () => {
  // 验证同账号快速失败、异账号并行和释放后重新获取。
  it('holds one exclusive lease per account database lifecycle', async () => {
    // fakeManager 让两个 manager 实例模拟同源不同标签页。
    const fakeManager = new FakeWebLockManager();
    // firstTab 和 secondTab 共享浏览器原生 LockManager owner。
    const firstTab = createAccountDatabaseLeaseManager(fakeManager);
    const secondTab = createAccountDatabaseLeaseManager(fakeManager);
    // firstLease 持有 user-a 的完整数据库生命周期。
    const firstLease = await firstTab.acquire('im28-web-user-a.sqlite');

    await expect(
      secondTab.acquire('im28-web-user-a.sqlite'),
    ).rejects.toMatchObject({ code: 'ACCOUNT_DATABASE_BUSY' });
    // 不同账号使用不同 lock name，可同时打开。
    const otherAccountLease = await secondTab.acquire(
      'im28-web-user-b.sqlite',
    );
    await otherAccountLease.release();
    await firstLease.release();

    // 原 owner 释放后，第二个标签页可通过显式重试取得 lease。
    const retriedLease = await secondTab.acquire('im28-web-user-a.sqlite');
    expect(retriedLease.lockName).toBe(
      createAccountDatabaseLockName('im28-web-user-a.sqlite'),
    );
    await retriedLease.release();
    expect(fakeManager.requestedOptions).toEqual(
      expect.arrayContaining([{ mode: 'exclusive', ifAvailable: true }]),
    );
  });

  // 验证不支持 Web Locks 时明确 fail closed。
  it('fails closed when Web Locks are unavailable', async () => {
    // manager 保留缺失能力，直到实际 acquire 时给出稳定错误码。
    const manager = createAccountDatabaseLeaseManager(undefined);
    await expect(manager.acquire('im28-web-user.sqlite')).rejects.toMatchObject(
      { code: 'STORAGE_COORDINATION_UNAVAILABLE' },
    );
  });

  // 验证空数据库名不会创建宽泛 lock。
  it('rejects an empty account database lock name', () => {
    expect(() => createAccountDatabaseLockName('   ')).toThrow(
      'requires a database name',
    );
  });
});
