import { createRequire } from 'node:module';

import {
  MessageRepository,
  runMigrations,
  type DatabaseAdapter,
  type Message,
} from '@im28/im-sdk/web';
import { statement } from '@im28/im-sdk';
import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';

import { createIndexedDBSQLiteBinaryStore } from '../sqlite/indexeddb-sqlite-binary-store.js';
import { createSqlJsIndexedDBDatabaseAdapter } from '../sqlite/sqljs-indexeddb-database-adapter.js';
import { createWorkerDatabaseAdapter } from './worker-database-client.js';
import { createWorkerDatabaseRuntime } from './worker-database-runtime.js';
import type { WorkerDatabasePort } from './worker-database-types.js';

// 当前 package 解析器用于加载真实 sql.js WASM。
const require = createRequire(import.meta.url);
// RPC parity 测试不依赖 Vite public path。
const SQLJS_WASM_PATH = require.resolve('sql.js/dist/sql-wasm.wasm');

// in-process 端口只替代浏览器线程调度，消息仍经过完整协议 runtime。
class InProcessWorkerDatabasePort implements WorkerDatabasePort {
  // message listeners 模拟 Dedicated Worker EventTarget。
  private readonly listeners = new Set<(event: MessageEvent) => void>();
  // terminated 状态用于验证 fatal response 会销毁 owner。
  isTerminated = false;

  /** 保存 Worker runtime 作为协议消息的真实处理 owner。 */
  constructor(
    private readonly runtime: ReturnType<typeof createWorkerDatabaseRuntime>,
  ) {}

  /** 异步投递请求并把 runtime 响应发回主线程 listener。 */
  postMessage(message: unknown): void {
    queueMicrotask(() => {
      void this.deliver(message);
    });
  }

  /** 注册主线程 message listener。 */
  addEventListener(
    _type: 'message',
    listener: (event: MessageEvent) => void,
  ): void {
    this.listeners.add(listener);
  }

  /** 移除主线程 message listener。 */
  removeEventListener(
    _type: 'message',
    listener: (event: MessageEvent) => void,
  ): void {
    this.listeners.delete(listener);
  }

  /** 标记 Worker 已被主线程销毁。 */
  terminate(): void {
    this.isTerminated = true;
  }

  /** 完成一轮 request/response，并尊重 terminate 后不再投递。 */
  private async deliver(message: unknown): Promise<void> {
    if (this.isTerminated) {
      return;
    }
    // response 经过 runtime 的 Zod envelope 和 operation dispatcher。
    const response = await this.runtime.handle(message);
    if (this.isTerminated) {
      return;
    }
    // MessageEvent 只需要 data 字段，避免测试环境伪造浏览器全局。
    const event = { data: response } as MessageEvent;
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

/** 创建使用真实 sql.js/IndexedDB 的 in-process Worker adapter。 */
function createTestWorkerAdapter(
  indexedDB: IDBFactory,
  databaseName: string,
): { adapter: DatabaseAdapter; port: InProcessWorkerDatabasePort } {
  // runtime factory 每次 open 创建 Worker 内唯一 adapter。
  const runtime = createWorkerDatabaseRuntime({
    createDatabase: options =>
      createSqlJsIndexedDBDatabaseAdapter({
        databaseName: options.databaseName,
        binaryStore: createIndexedDBSQLiteBinaryStore({
          indexedDB,
          ...(options.storageDatabaseName
            ? { storageDatabaseName: options.storageDatabaseName }
            : {}),
        }),
        locateWasmFile: () => options.wasmURL,
      }),
  });
  // port 使 client 与 runtime 保持真实异步消息边界。
  const port = new InProcessWorkerDatabasePort(runtime);
  // adapter 暴露共享 DatabaseAdapter，Repository 无需感知 RPC。
  const adapter = createWorkerDatabaseAdapter({
    databaseName,
    wasmURL: SQLJS_WASM_PATH,
    createWorker: () => port,
  });
  return { adapter, port };
}

/** 创建覆盖 Repository JSON payload 的持久化消息。 */
function createTestMessage(): Message {
  return {
    clientMsgID: 'worker-client-1',
    serverMsgID: 'worker-server-1',
    conversationID: 'single-worker-peer',
    senderID: 'worker-user',
    direction: 'outgoing',
    contentType: 101,
    status: 'sent',
    sendTime: 1_800_000_000_000,
    seq: 7,
    payload: { text: 'hello worker sqlite' },
  };
}

// Dedicated Worker DatabaseAdapter 的协议与真实存储 parity 集合。
describe('Worker database adapter', () => {
  // 验证 migrations/Repository 数据经 RPC 后仍能跨 Worker 实例恢复。
  it('preserves repository data across worker adapter instances', async () => {
    // 同一 factory 模拟刷新前后的同源 IndexedDB。
    const indexedDB = new IDBFactory();
    // first adapter 完成 migrations 和 Repository 写入。
    const first = createTestWorkerAdapter(indexedDB, 'worker-user.sqlite');
    await runMigrations(first.adapter);
    // message 是共享 Repository 的真实输入。
    const message = createTestMessage();
    await new MessageRepository(first.adapter).upsert(message);
    await first.adapter.close();
    expect(first.port.isTerminated).toBe(true);

    // second adapter 模拟刷新后新建 Dedicated Worker。
    const second = createTestWorkerAdapter(indexedDB, 'worker-user.sqlite');
    await expect(
      new MessageRepository(second.adapter).getByClientMsgID(
        message.clientMsgID,
      ),
    ).resolves.toEqual(message);
    await second.adapter.close();
  });

  // 验证 transaction callback 失败会跨 RPC rollback 且 adapter 可继续使用。
  it('rolls back a failed RPC transaction without faulting the worker', async () => {
    // 隔离 runtime 只验证 transaction protocol。
    const runtime = createTestWorkerAdapter(
      new IDBFactory(),
      'worker-rollback.sqlite',
    );
    await runtime.adapter.execute(
      statement('CREATE TABLE worker_items (id TEXT PRIMARY KEY NOT NULL)'),
    );

    await expect(
      runtime.adapter.transaction(async transaction => {
        await transaction.execute(
          statement('INSERT INTO worker_items (id) VALUES (?)', ['partial']),
        );
        throw new Error('rollback rpc');
      }),
    ).rejects.toThrow('rollback rpc');
    await expect(
      runtime.adapter.query(statement('SELECT id FROM worker_items')),
    ).resolves.toEqual([]);
    expect(runtime.port.isTerminated).toBe(false);
    await runtime.adapter.close();
  });

  // 验证 callback 同步发起的多个子操作仍由 client transaction queue 串行。
  it('serializes concurrent transaction child calls', async () => {
    // 独立数据库避免与 rollback case 共享 schema。
    const runtime = createTestWorkerAdapter(
      new IDBFactory(),
      'worker-child-queue.sqlite',
    );
    await runtime.adapter.execute(
      statement('CREATE TABLE queued_items (id TEXT PRIMARY KEY NOT NULL)'),
    );

    await runtime.adapter.transaction(async transaction => {
      // query 在 insert 后同步入队，即使调用方用 Promise.all 等待也必须看到新行。
      const insertPromise = transaction.execute(
        statement('INSERT INTO queued_items (id) VALUES (?)', ['queued']),
      );
      // readPromise 应等待 insert RPC 完成后才发送。
      const readPromise = transaction.query(
        statement('SELECT id FROM queued_items'),
      );
      await expect(Promise.all([insertPromise, readPromise])).resolves.toEqual([
        { rowsAffected: 1 },
        [{ id: 'queued' }],
      ]);
    });
    await runtime.adapter.close();
  });

  // 验证 callback 未等待子写入就抛错时，rollback 仍排在子 RPC 完成之后。
  it('drains unawaited child calls before rollback', async () => {
    // 独立数据库用于捕获最容易交错的 fire-and-throw 顺序。
    const runtime = createTestWorkerAdapter(
      new IDBFactory(),
      'worker-unawaited-rollback.sqlite',
    );
    await runtime.adapter.execute(
      statement('CREATE TABLE unawaited_items (id TEXT PRIMARY KEY NOT NULL)'),
    );

    await expect(
      runtime.adapter.transaction(async transaction => {
        // 故意不 await，模拟业务 callback 在派发写入后同步失败。
        void transaction.execute(
          statement('INSERT INTO unawaited_items (id) VALUES (?)', ['partial']),
        );
        throw new Error('rollback after dispatch');
      }),
    ).rejects.toThrow('rollback after dispatch');
    await expect(
      runtime.adapter.query(statement('SELECT id FROM unawaited_items')),
    ).resolves.toEqual([]);
    await runtime.adapter.close();
  });

  // 验证 snapshot 失败被标记 fatal，主线程立即 terminate 且不再发 close RPC。
  it('terminates the worker after a durable snapshot failure', async () => {
    // writeCount 证明 fatal close 不会重试持久化失败状态。
    let writeCount = 0;
    // runtime 注入始终写失败的 durable store。
    const workerRuntime = createWorkerDatabaseRuntime({
      createDatabase: options =>
        createSqlJsIndexedDBDatabaseAdapter({
          databaseName: options.databaseName,
          binaryStore: {
            read: async () => null,
            write: async () => {
              writeCount += 1;
              throw new Error('worker snapshot unavailable');
            },
            delete: async () => undefined,
          },
          locateWasmFile: () => options.wasmURL,
        }),
    });
    // port 暴露 terminate 状态用于断言 Worker 被销毁。
    const port = new InProcessWorkerDatabasePort(workerRuntime);
    // adapter 使用短 timeout 避免协议失败测试悬挂。
    const adapter = createWorkerDatabaseAdapter({
      databaseName: 'worker-fault.sqlite',
      wasmURL: SQLJS_WASM_PATH,
      createWorker: () => port,
      requestTimeoutMs: 1_000,
    });

    await expect(
      adapter.execute(statement('CREATE TABLE faulted_items (id TEXT)')),
    ).rejects.toThrow('worker snapshot unavailable');
    expect(port.isTerminated).toBe(true);
    await expect(adapter.close()).resolves.toBeUndefined();
    expect(writeCount).toBe(1);
  });

  // 验证无响应请求触发 watchdog，拒绝调用并销毁结果未知的 Worker。
  it('faults and terminates a worker after an RPC timeout', async () => {
    // silentPort 接受请求但永不响应，模拟 Worker 卡死或消息丢失。
    const silentPort: WorkerDatabasePort & { isTerminated: boolean } = {
      isTerminated: false,
      postMessage: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      terminate() {
        this.isTerminated = true;
      },
    };
    // 短 timeout 让 watchdog 回归保持快速且确定。
    const adapter = createWorkerDatabaseAdapter({
      databaseName: 'worker-timeout.sqlite',
      wasmURL: SQLJS_WASM_PATH,
      createWorker: () => silentPort,
      requestTimeoutMs: 10,
    });

    await expect(adapter.open()).rejects.toMatchObject({
      code: 'WORKER_DATABASE_TIMEOUT',
    });
    expect(silentPort.isTerminated).toBe(true);
    await expect(adapter.close()).resolves.toBeUndefined();
  });
});
