import { parseWorkerDatabaseResponse, } from './worker-database-protocol.js';
import { WorkerDatabaseError, } from './worker-database-types.js';
/** 创建在 Dedicated Worker 中执行 SQL 的 DatabaseAdapter。 */
export function createWorkerDatabaseAdapter(options) {
    return new WorkerDatabaseAdapter(options);
}
// 默认超时仅防止 RPC 永久悬挂，调用方可按部署性能显式覆盖。
const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;
// Worker client 是主线程唯一 RPC queue 和 DatabaseAdapter facade。
class WorkerDatabaseAdapter {
    name;
    // 创建参数包含 Worker factory，不隐式回退 caller-thread adapter。
    options;
    // 单个 adapter 生命周期只创建一个 Worker。
    worker;
    // FIFO 防止普通操作越过 transaction callback。
    operationQueue = Promise.resolve();
    // 请求序号只要求当前 Worker 生命周期内唯一。
    requestSequence = 0;
    // pending map 负责把异步 message 响应归还原调用方。
    pendingRequests = new Map();
    // 状态显式区分未打开、可用、致命失败与正常关闭。
    state = 'new';
    /** 创建 Worker 并绑定唯一消息监听器。 */
    constructor(options) {
        this.options = options;
        this.name = options.databaseName;
        this.worker = options.createWorker();
        this.worker.addEventListener('message', this.handleMessage);
    }
    /** 在 Worker 内加载 sql.js 与最新 IndexedDB snapshot。 */
    open() {
        return this.runSerialized(() => this.openDirect());
    }
    /** 正常关闭健康 Worker；faulted Worker 只销毁不再导出。 */
    close() {
        return this.runSerialized(async () => {
            if (this.state === 'closed') {
                return;
            }
            if (this.state === 'ready') {
                await this.sendRequest('close', null);
            }
            this.disposeWorker();
            this.state = 'closed';
        });
    }
    /** 执行写语句并等待 Worker snapshot durable。 */
    execute(statement) {
        return this.runSerialized(async () => {
            await this.openDirect();
            return this.sendRequest('execute', { statement });
        });
    }
    /** 在 Worker 查询并返回结构化克隆行。 */
    query(statement) {
        return this.runSerialized(async () => {
            await this.openDirect();
            return this.sendRequest('query', { statement });
        });
    }
    /** 独占 FIFO 执行 transaction callback，子 RPC 不重新入队。 */
    transaction(run) {
        return this.runSerialized(async () => {
            await this.openDirect();
            // Worker 返回的 transactionID 约束所有 transaction 子操作。
            const transactionID = await this.sendRequest('transaction.begin', null);
            // 子操作也必须串行，防止 callback 内 Promise.all 并发触碰同一 SQLite transaction。
            let transactionQueue = Promise.resolve();
            // enqueueTransactionOperation 保持 transaction facade 的调用顺序。
            const enqueueTransactionOperation = (operation) => {
                // 当前子操作在前序 settle 后执行，失败不阻断 rollback 获得机会。
                const operationResult = transactionQueue.then(operation, operation);
                transactionQueue = operationResult.then(() => undefined, () => undefined);
                return operationResult;
            };
            // transaction facade 直接发送带 ID 的 RPC，避免队列递归死锁。
            const transaction = {
                execute: statement => enqueueTransactionOperation(() => this.sendRequest('transaction.execute', {
                    transactionID,
                    statement,
                })),
                query: statement => enqueueTransactionOperation(() => this.sendRequest('transaction.query', {
                    transactionID,
                    statement,
                })),
            };
            try {
                // callback 结果只有在 Worker COMMIT 和 IndexedDB commit 后返回。
                const result = await run(transaction);
                await transactionQueue;
                await this.sendRequest('transaction.commit', { transactionID });
                return result;
            }
            catch (cause) {
                // callback 可在未 await 子操作时抛错；rollback 必须排在所有已发起 RPC 之后。
                await transactionQueue.catch(() => undefined);
                if (this.state === 'ready') {
                    await this.sendRequest('transaction.rollback', { transactionID });
                }
                throw cause;
            }
        });
    }
    /** 串行调度公开操作，并允许非致命失败后的下一次调用继续。 */
    runSerialized(run) {
        // result 始终跟随前序 settled 状态执行。
        const result = this.operationQueue.then(run, run);
        this.operationQueue = result.then(() => undefined, () => undefined);
        return result;
    }
    /** 幂等打开 Worker 数据库并拒绝关闭/致命状态。 */
    async openDirect() {
        if (this.state === 'ready') {
            return;
        }
        if (this.state !== 'new') {
            throw new WorkerDatabaseError('WORKER_DATABASE_UNAVAILABLE', `Worker database cannot open from ${this.state} state.`, false);
        }
        await this.sendRequest('open', {
            databaseName: this.options.databaseName,
            wasmURL: this.options.wasmURL,
            ...(this.options.storageDatabaseName
                ? { storageDatabaseName: this.options.storageDatabaseName }
                : {}),
        });
        this.state = 'ready';
    }
    /** 发送具名 RPC 并安装 timeout watchdog。 */
    sendRequest(operation, payload) {
        // requestID 在 Worker 生命周期内单调递增且便于测试断言。
        const requestID = `${this.name}:${++this.requestSequence}`;
        // request 使用已冻结 envelope，不传递函数或 Error 实例。
        const request = {
            id: requestID,
            operation,
            payload,
        };
        return new Promise((resolve, reject) => {
            // 超时表示操作结果未知，必须 fault 整个 Worker。
            const timeout = setTimeout(() => this.faultWorker(new WorkerDatabaseError('WORKER_DATABASE_TIMEOUT', `Worker database request timed out: ${operation}.`, false)), this.options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS);
            this.pendingRequests.set(requestID, {
                resolve: value => resolve(value),
                reject,
                timeout,
            });
            this.worker.postMessage(request);
        });
    }
    /** 校验 Worker 响应并完成对应 pending request。 */
    handleMessage = (event) => {
        // malformed response 属于协议破坏，不能继续信任 Worker 状态。
        let response;
        try {
            response = parseWorkerDatabaseResponse(event.data);
        }
        catch (cause) {
            this.faultWorker(cause);
            return;
        }
        // 未知 requestID 可能是超时后的迟到结果，也视为不可继续。
        const pendingRequest = this.pendingRequests.get(response.id);
        if (!pendingRequest) {
            this.faultWorker(new Error(`Unexpected Worker database response: ${response.id}.`));
            return;
        }
        clearTimeout(pendingRequest.timeout);
        this.pendingRequests.delete(response.id);
        if (response.ok) {
            pendingRequest.resolve(response.result);
            return;
        }
        // 先拒绝当前调用，再按 fatal 标志销毁所有剩余请求。
        const cause = new WorkerDatabaseError(response.error.code, response.error.message, response.error.retryable);
        pendingRequest.reject(cause);
        if (response.error.fatal) {
            this.faultWorker(cause);
        }
    };
    /** 将 Worker 标记为 fatal 并拒绝所有未知结果的请求。 */
    faultWorker(cause) {
        if (this.state === 'closed' || this.state === 'faulted') {
            return;
        }
        this.state = 'faulted';
        for (const pendingRequest of this.pendingRequests.values()) {
            clearTimeout(pendingRequest.timeout);
            pendingRequest.reject(cause);
        }
        this.pendingRequests.clear();
        this.disposeWorker();
    }
    /** 解绑 listener 并终止 Worker，保证其无法继续写 snapshot。 */
    disposeWorker() {
        this.worker.removeEventListener('message', this.handleMessage);
        this.worker.terminate();
    }
}
//# sourceMappingURL=worker-database-client.js.map