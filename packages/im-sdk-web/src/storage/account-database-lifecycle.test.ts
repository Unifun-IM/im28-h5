import { createRequire } from 'node:module';

import {
  MessageRepository,
  type Message,
} from '@im28/im-sdk/web';
import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';

import { createWebIMAccountDatabaseLifecycle } from './account-database-lifecycle.js';
import {
  createAccountDatabaseLeaseManager,
  type WebLockManagerPort,
} from './lock/account-database-lease.js';
import { createIndexedDBSQLiteBinaryStore } from './sqlite/indexeddb-sqlite-binary-store.js';
import { createSqlJsIndexedDBDatabaseAdapter } from './sqlite/sqljs-indexeddb-database-adapter.js';
import { createWorkerDatabaseRuntime } from './worker/worker-database-runtime.js';
import type { WorkerDatabasePort } from './worker/worker-database-types.js';

// 当前 package 的解析器用于定位测试环境中的 sql.js WASM。
const require = createRequire(import.meta.url);
// 测试加载真实 sql.js WASM，避免用内存假实现掩盖迁移错误。
const SQLJS_WASM_PATH = require.resolve('sql.js/dist/sql-wasm.wasm');

// Lifecycle 测试的 Worker 端口保留真实 RPC/runtime，只省略物理线程。
class LifecycleWorkerPort implements WorkerDatabasePort {
  // listeners 模拟 Dedicated Worker 的 message EventTarget。
  private readonly listeners = new Set<(event: MessageEvent) => void>();
  // terminate 证明 close 在 lease release 之前销毁 Worker。
  isTerminated = false;

  /** 保存真实 Worker database runtime。 */
  constructor(
    private readonly runtime: ReturnType<typeof createWorkerDatabaseRuntime>,
  ) {}

  /** 异步投递完整 Worker RPC。 */
  postMessage(message: unknown): void {
    queueMicrotask(() => void this.deliver(message));
  }

  /** 注册主线程消息监听器。 */
  addEventListener(
    _type: 'message',
    listener: (event: MessageEvent) => void,
  ): void {
    this.listeners.add(listener);
  }

  /** 移除主线程消息监听器。 */
  removeEventListener(
    _type: 'message',
    listener: (event: MessageEvent) => void,
  ): void {
    this.listeners.delete(listener);
  }

  /** 标记 Worker 已无法继续写 snapshot。 */
  terminate(): void {
    this.isTerminated = true;
  }

  /** 将 runtime response 返回所有当前 listener。 */
  private async deliver(message: unknown): Promise<void> {
    // response 仍经过真实 Zod protocol 与 SQL dispatcher。
    const response = await this.runtime.handle(message);
    // terminated Worker 不再向主线程发送迟到响应。
    if (this.isTerminated) {
      return;
    }
    // 测试 MessageEvent 只需 data 字段。
    const event = { data: response } as MessageEvent;
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

/** 创建真实 sql.js/IndexedDB runtime 的测试 Worker port。 */
function createLifecycleWorkerPort(indexedDB: IDBFactory): LifecycleWorkerPort {
  // Worker runtime 在 open payload 到达后创建账号 adapter。
  const runtime = createWorkerDatabaseRuntime({
    createDatabase: options =>
      createSqlJsIndexedDBDatabaseAdapter({
        databaseName: options.databaseName,
        binaryStore: createIndexedDBSQLiteBinaryStore({ indexedDB }),
        locateWasmFile: () => options.wasmURL,
      }),
  });
  return new LifecycleWorkerPort(runtime);
}

// 共享 fake LockManager 模拟同源标签页对命名 lock 的竞争。
class LifecycleLockManager implements WebLockManagerPort {
  // heldNames 在 callback promise settle 前保持占用。
  private readonly heldNames = new Set<string>();

  /** 同名 lock 返回 null，异名 lock 可并行持有。 */
  async request<Result>(
    name: string,
    _options: { readonly mode: 'exclusive'; readonly ifAvailable: true },
    callback: (
      lock: { readonly name: string; readonly mode: 'exclusive' } | null,
    ) => Promise<Result>,
  ): Promise<Result> {
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

/** 创建可验证账号切换和持久化恢复的测试消息。 */
function createTestMessage(userID: string): Message {
  return {
    clientMsgID: `client-${userID}`,
    serverMsgID: `server-${userID}`,
    conversationID: 'single-peer',
    senderID: userID,
    direction: 'outgoing',
    contentType: 101,
    status: 'sent',
    sendTime: 1_800_000_000_000,
    seq: 1,
    payload: { text: `hello ${userID}` },
  };
}

// 账号数据库生命周期的真实 sql.js + IndexedDB 回归集合。
describe('Web IM account database lifecycle', () => {
  // 验证切换账号时关闭旧库，并在重开时恢复各自缓存。
  it('migrates, switches and restores account-scoped databases', async () => {
    // 隔离 factory 模拟单一干净浏览器 origin。
    const lifecycle = createWebIMAccountDatabaseLifecycle({
      indexedDB: new IDBFactory(),
      locateWasmFile: () => SQLJS_WASM_PATH,
    });

    await lifecycle.open('user-a');
    // migration 完成后共享 Repository 应可立即读写。
    const userAMessage = createTestMessage('user-a');
    await new MessageRepository(lifecycle.getDatabase()!).upsert(userAMessage);

    await lifecycle.open('user-b');
    // 新账号数据库不能看到前一账号消息。
    await expect(
      new MessageRepository(lifecycle.getDatabase()!).getByClientMsgID(
        userAMessage.clientMsgID,
      ),
    ).resolves.toBeNull();

    await lifecycle.open('user-a');
    // 重开 user-a 时应从 IndexedDB 恢复已提交 snapshot。
    await expect(
      new MessageRepository(lifecycle.getDatabase()!).getByClientMsgID(
        userAMessage.clientMsgID,
      ),
    ).resolves.toEqual(userAMessage);

    await lifecycle.close();
    expect(lifecycle.getDatabase()).toBeNull();
  });

  // 验证 lease 在 Worker 创建前取得，并在 Worker terminate 后允许同账号重试。
  it('owns one same-account worker lifecycle across tabs', async () => {
    // 同一 IDBFactory 和 LockManager 模拟同源内三个标签页。
    const indexedDB = new IDBFactory();
    // leaseManager 是三个 lifecycle 的唯一跨 tab owner。
    const leaseManager = createAccountDatabaseLeaseManager(
      new LifecycleLockManager(),
    );
    // workerPorts 记录实际创建数量和 terminate 时机。
    const workerPorts: LifecycleWorkerPort[] = [];
    // createLifecycle 返回生产同构的 Worker + Web Lock lifecycle。
    const createLifecycle = () =>
      createWebIMAccountDatabaseLifecycle({
        indexedDB,
        locateWasmFile: () => SQLJS_WASM_PATH,
        wasmURL: SQLJS_WASM_PATH,
        accountDatabaseLeaseManager: leaseManager,
        createDatabaseWorker: () => {
          // port 只有在 acquire 成功后才允许创建。
          const port = createLifecycleWorkerPort(indexedDB);
          workerPorts.push(port);
          return port;
        },
      });
    // firstTab 首先持有 user-lock 的数据库生命周期。
    const firstTab = createLifecycle();
    // secondTab 模拟竞争同一账号。
    const secondTab = createLifecycle();
    // otherAccountTab 验证不同账号不互相阻塞。
    const otherAccountTab = createLifecycle();

    await firstTab.open('user-lock');
    await expect(secondTab.open('user-lock')).rejects.toMatchObject({
      code: 'ACCOUNT_DATABASE_BUSY',
    });
    // 被拒绝的 tab 不能创建 stale Worker。
    expect(workerPorts).toHaveLength(1);
    await otherAccountTab.open('user-other');
    expect(workerPorts).toHaveLength(2);

    await firstTab.close();
    expect(workerPorts[0]?.isTerminated).toBe(true);
    // 明确重试在 release 完成后创建新的同账号 Worker。
    await secondTab.open('user-lock');
    expect(workerPorts).toHaveLength(3);
    await secondTab.close();
    await otherAccountTab.close();
    expect(workerPorts.every(port => port.isTerminated)).toBe(true);
  });

  // 验证 Worker 配置缺少 lease owner 时在创建 Worker 前失败。
  it('rejects an unsafe worker configuration without a lease manager', async () => {
    // workerCreated 用于证明没有无锁 fallback。
    let workerCreated = false;
    // lifecycle 显式开启 Worker，但故意不提供协调 owner。
    const lifecycle = createWebIMAccountDatabaseLifecycle({
      indexedDB: new IDBFactory(),
      locateWasmFile: () => SQLJS_WASM_PATH,
      wasmURL: SQLJS_WASM_PATH,
      createDatabaseWorker: () => {
        workerCreated = true;
        return createLifecycleWorkerPort(new IDBFactory());
      },
    });

    await expect(lifecycle.open('unsafe-user')).rejects.toThrow(
      'requires an account database lease manager',
    );
    expect(workerCreated).toBe(false);
  });
});
