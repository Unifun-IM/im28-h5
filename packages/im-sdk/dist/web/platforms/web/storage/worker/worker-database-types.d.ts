/** 主线程可注入、可测试的 Dedicated Worker 端口。 */
export interface WorkerDatabasePort {
    postMessage(message: unknown): void;
    addEventListener(type: 'message', listener: (event: MessageEvent) => void): void;
    removeEventListener(type: 'message', listener: (event: MessageEvent) => void): void;
    terminate(): void;
}
/** Worker DatabaseAdapter 创建参数。 */
export interface WorkerDatabaseAdapterOptions {
    readonly databaseName: string;
    readonly wasmURL: string;
    readonly createWorker: () => WorkerDatabasePort;
    readonly storageDatabaseName?: string;
    readonly requestTimeoutMs?: number;
    readonly mode?: 'readwrite' | 'readonly-existing';
}
/** Worker 数据库 RPC 的结构化错误。 */
export declare class WorkerDatabaseError extends Error {
    readonly code: string;
    readonly retryable: boolean;
    /** 保存跨线程稳定错误字段。 */
    constructor(code: string, message: string, retryable: boolean);
}
//# sourceMappingURL=worker-database-types.d.ts.map