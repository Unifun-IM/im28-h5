/** Worker 数据库 RPC 的结构化错误。 */
export class WorkerDatabaseError extends Error {
    code;
    retryable;
    /** 保存跨线程稳定错误字段。 */
    constructor(code, message, retryable) {
        super(message);
        this.name = 'WorkerDatabaseError';
        this.code = code;
        this.retryable = retryable;
    }
}
//# sourceMappingURL=worker-database-types.js.map