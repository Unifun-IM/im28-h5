import type {
  DatabaseAdapter,
  DatabaseStatement,
  DatabaseTransaction,
} from '@im28/im-sdk/web';
import { z } from 'zod';

import { SqlJsPersistenceError } from '../sqlite/sqljs-indexeddb-database-adapter.js';
import {
  createWorkerDatabaseFailure,
  createWorkerDatabaseSuccess,
  parseWorkerDatabaseRequest,
  type WorkerDatabaseRequest,
  type WorkerDatabaseResponse,
} from './worker-database-protocol.js';

// open payload 只传可克隆的构建和存储定位信息。
const OPEN_PAYLOAD_SCHEMA = z.object({
  databaseName: z.string().min(1),
  wasmURL: z.string().min(1),
  storageDatabaseName: z.string().min(1).optional(),
});

// SQL 参数允许共享 DatabaseAdapter contract 中的浏览器可克隆值。
const DATABASE_PARAMETER_SCHEMA = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.instanceof(ArrayBuffer),
]);

// statement payload 禁止函数、对象或不可识别参数进入 sql.js。
const STATEMENT_SCHEMA = z.object({
  sql: z.string().min(1),
  params: z.array(DATABASE_PARAMETER_SCHEMA).optional(),
});

// 普通 statement 请求包含唯一 statement 字段。
const STATEMENT_PAYLOAD_SCHEMA = z.object({ statement: STATEMENT_SCHEMA });

// transaction 子请求同时校验 transactionID 和 statement。
const TRANSACTION_STATEMENT_PAYLOAD_SCHEMA = z.object({
  transactionID: z.string().min(1),
  statement: STATEMENT_SCHEMA,
});

// transaction 完成请求只携带当前 transactionID。
const TRANSACTION_ID_PAYLOAD_SCHEMA = z.object({
  transactionID: z.string().min(1),
});

/** Worker open 后创建真实 DatabaseAdapter 的依赖。 */
export interface WorkerDatabaseRuntimeDependencies {
  readonly createDatabase: (
    options: z.infer<typeof OPEN_PAYLOAD_SCHEMA>,
  ) => DatabaseAdapter;
}

/** Worker 内唯一活动 transaction 的控制器。 */
interface ActiveWorkerTransaction {
  readonly id: string;
  readonly transaction: DatabaseTransaction;
  readonly completion: Promise<unknown>;
  readonly commit: () => void;
  readonly rollback: (cause: unknown) => void;
}

/** 创建校验消息并拥有 Worker 数据库状态的 RPC runtime。 */
export function createWorkerDatabaseRuntime(
  dependencies: WorkerDatabaseRuntimeDependencies,
): WorkerDatabaseRuntime {
  return new WorkerDatabaseRuntime(dependencies);
}

// rollback sentinel 区分预期 rollback 与 adapter/IndexedDB 自身异常。
const EXPECTED_ROLLBACK = Symbol('expected-worker-database-rollback');

// Worker runtime 是 sql.js adapter 与跨线程协议之间的唯一 dispatcher。
export class WorkerDatabaseRuntime {
  // 显式依赖用于生产 IndexedDB 和测试 fake-indexeddb 注入。
  private readonly dependencies: WorkerDatabaseRuntimeDependencies;
  // 单个 Dedicated Worker 生命周期只拥有一个数据库。
  private database: DatabaseAdapter | null = null;
  // 同一时刻只允许一个 transaction callback 持有 connection。
  private activeTransaction: ActiveWorkerTransaction | null = null;

  /** 保存数据库 factory，不在构造阶段访问浏览器全局。 */
  constructor(dependencies: WorkerDatabaseRuntimeDependencies) {
    this.dependencies = dependencies;
  }

  /** 校验并执行一条 Worker 消息，所有异常归一为可克隆响应。 */
  async handle(value: unknown): Promise<WorkerDatabaseResponse> {
    // parse failure 可能没有可信 request ID，使用 protocol 占位 ID。
    let request: WorkerDatabaseRequest;
    try {
      request = parseWorkerDatabaseRequest(value);
    } catch (cause) {
      return createWorkerDatabaseFailure('protocol', cause, true);
    }
    try {
      // result 由 operation handler 保持共享 DatabaseAdapter 语义。
      const result = await this.dispatch(request);
      return createWorkerDatabaseSuccess(request.id, result);
    } catch (cause) {
      // 持久化失败后内存状态不可再信任，主线程必须 terminate Worker。
      const isFatal =
        cause instanceof SqlJsPersistenceError || request.operation === 'open';
      return createWorkerDatabaseFailure(request.id, cause, isFatal);
    }
  }

  /** 按有限 operation 集合路由数据库调用。 */
  private async dispatch(request: WorkerDatabaseRequest): Promise<unknown> {
    switch (request.operation) {
      case 'open':
        return this.open(OPEN_PAYLOAD_SCHEMA.parse(request.payload));
      case 'execute':
        return this.requireDatabase().execute(
          parseStatementPayload(request.payload),
        );
      case 'query':
        return this.requireDatabase().query(
          parseStatementPayload(request.payload),
        );
      case 'transaction.begin':
        return this.beginTransaction(request.id);
      case 'transaction.execute':
        return this.requireTransactionStatement(request.payload).execute();
      case 'transaction.query':
        return this.requireTransactionStatement(request.payload).query();
      case 'transaction.commit':
        return this.finishTransaction(request.payload, true);
      case 'transaction.rollback':
        return this.finishTransaction(request.payload, false);
      case 'close':
        return this.close();
    }
  }

  /** 创建并打开唯一数据库；重复 open 仅允许同名配置。 */
  private async open(
    options: z.infer<typeof OPEN_PAYLOAD_SCHEMA>,
  ): Promise<void> {
    if (this.database) {
      if (this.database.name !== options.databaseName) {
        throw new Error('Worker database is already open for another account.');
      }
      return;
    }
    // database 在 open 成功前不公开，失败实例由主线程终止 Worker 回收。
    const database = this.dependencies.createDatabase(options);
    await database.open();
    this.database = database;
  }

  /** 启动 adapter transaction 并在 callback 就绪后返回 transactionID。 */
  private async beginTransaction(requestID: string): Promise<string> {
    if (this.activeTransaction) {
      throw new Error('Worker database transaction is already active.');
    }
    // transactionID 与 begin request 一一对应，便于协议诊断。
    const transactionID = `transaction:${requestID}`;
    // ready signal 在 adapter callback 获得真实 transaction facade 后完成。
    let resolveReady: (() => void) | null = null;
    // finish signal 由后续 commit/rollback RPC 控制 callback 返回。
    let resolveFinish: (() => void) | null = null;
    let rejectFinish: ((cause: unknown) => void) | null = null;
    // readyPromise 防止 begin 在 transaction 尚不可用时抢先响应。
    const readyPromise = new Promise<void>(resolve => {
      resolveReady = resolve;
    });
    // finishPromise 将 adapter transaction 生命周期跨多条 RPC 保持打开。
    const finishPromise = new Promise<void>((resolve, reject) => {
      resolveFinish = resolve;
      rejectFinish = reject;
    });
    // transaction facade 只在 adapter callback 内有效。
    let scopedTransaction: DatabaseTransaction | null = null;
    // completion 最终包含 COMMIT + durable snapshot 或 rollback 结果。
    const completion = this.requireDatabase().transaction(async transaction => {
      scopedTransaction = transaction;
      resolveReady?.();
      await finishPromise;
    });
    await Promise.race([
      readyPromise,
      completion.then(() => {
        throw new Error('Worker transaction completed before becoming ready.');
      }),
    ]);
    if (!scopedTransaction || !resolveFinish || !rejectFinish) {
      throw new Error('Worker transaction failed to initialize.');
    }
    this.activeTransaction = {
      id: transactionID,
      transaction: scopedTransaction,
      completion,
      commit: resolveFinish,
      rollback: rejectFinish,
    };
    return transactionID;
  }

  /** 校验 transactionID 并返回绑定 statement 的执行器。 */
  private requireTransactionStatement(payload: unknown): {
    execute: () => Promise<unknown>;
    query: () => Promise<unknown>;
  } {
    // payload 在触碰 active transaction 前完成 schema 校验。
    const parsedPayload = TRANSACTION_STATEMENT_PAYLOAD_SCHEMA.parse(payload);
    // transaction 必须与 begin 返回的稳定 ID 完全一致。
    const activeTransaction = this.requireTransaction(parsedPayload.transactionID);
    // statement 收窄为共享接口，二进制参数仍保持 ArrayBuffer。
    const statement = parsedPayload.statement as DatabaseStatement;
    return {
      execute: () => activeTransaction.transaction.execute(statement),
      query: () => activeTransaction.transaction.query(statement),
    };
  }

  /** 提交或回滚当前 transaction，并等待 adapter 完整收尾。 */
  private async finishTransaction(
    payload: unknown,
    shouldCommit: boolean,
  ): Promise<void> {
    // transactionID 校验先于任何完成 signal。
    const parsedPayload = TRANSACTION_ID_PAYLOAD_SCHEMA.parse(payload);
    // 保存局部引用后立即清空 owner，完成失败也不复用旧 facade。
    const activeTransaction = this.requireTransaction(
      parsedPayload.transactionID,
    );
    this.activeTransaction = null;
    if (shouldCommit) {
      activeTransaction.commit();
      await activeTransaction.completion;
      return;
    }
    activeTransaction.rollback(EXPECTED_ROLLBACK);
    try {
      await activeTransaction.completion;
    } catch (cause) {
      if (cause !== EXPECTED_ROLLBACK) {
        throw cause;
      }
    }
  }

  /** 正常关闭健康数据库，活动 transaction 必须先完成。 */
  private async close(): Promise<void> {
    if (this.activeTransaction) {
      throw new Error('Cannot close Worker database during a transaction.');
    }
    // database 在 close 成功后清空，Worker 随后由主线程 terminate。
    const database = this.database;
    if (!database) {
      return;
    }
    await database.close();
    this.database = null;
  }

  /** 获取已打开数据库，拒绝隐式创建空库。 */
  private requireDatabase(): DatabaseAdapter {
    if (!this.database) {
      throw new Error('Worker database is not open.');
    }
    return this.database;
  }

  /** 获取匹配 ID 的活动 transaction。 */
  private requireTransaction(transactionID: string): ActiveWorkerTransaction {
    if (!this.activeTransaction || this.activeTransaction.id !== transactionID) {
      throw new Error('Worker database transaction ID is invalid or inactive.');
    }
    return this.activeTransaction;
  }
}

/** 校验普通 SQL payload 并收窄到共享 statement。 */
function parseStatementPayload(payload: unknown): DatabaseStatement {
  // Zod 已拒绝不可克隆或不受支持的参数类型。
  const parsedPayload = STATEMENT_PAYLOAD_SCHEMA.parse(payload);
  return parsedPayload.statement as DatabaseStatement;
}
