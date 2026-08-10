import { z } from 'zod';
// Worker 支持的数据库操作必须保持有限集合，避免任意消息进入 SQL owner。
const WORKER_DATABASE_OPERATION_SCHEMA = z.enum([
    'open',
    'execute',
    'query',
    'transaction.begin',
    'transaction.execute',
    'transaction.query',
    'transaction.commit',
    'transaction.rollback',
    'close',
]);
// 跨线程请求只校验 envelope；payload 由对应 operation handler 继续收窄。
const WORKER_DATABASE_REQUEST_SCHEMA = z.object({
    id: z.string().min(1),
    operation: WORKER_DATABASE_OPERATION_SCHEMA,
    payload: z.unknown(),
});
// 失败响应包含稳定 code 和 fatal 标志，供主线程决定是否销毁 Worker。
const WORKER_DATABASE_ERROR_SCHEMA = z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    retryable: z.boolean(),
    fatal: z.boolean(),
});
// 成功与失败响应使用判别联合，禁止悬空 result/error。
const WORKER_DATABASE_RESPONSE_SCHEMA = z.discriminatedUnion('ok', [
    z.object({ id: z.string().min(1), ok: z.literal(true), result: z.unknown() }),
    z.object({
        id: z.string().min(1),
        ok: z.literal(false),
        error: WORKER_DATABASE_ERROR_SCHEMA,
    }),
]);
/** 校验主线程发往 Worker 的请求。 */
export function parseWorkerDatabaseRequest(value) {
    return WORKER_DATABASE_REQUEST_SCHEMA.parse(value);
}
/** 校验 Worker 返回主线程的响应。 */
export function parseWorkerDatabaseResponse(value) {
    return WORKER_DATABASE_RESPONSE_SCHEMA.parse(value);
}
/** 创建具名成功响应。 */
export function createWorkerDatabaseSuccess(id, result) {
    return { id, ok: true, result };
}
/** 创建具名失败响应并规范化未知异常。 */
export function createWorkerDatabaseFailure(id, cause, fatal) {
    // Error message 保留可诊断信息，但不跨线程传递不可克隆的 Error 实例。
    const message = cause instanceof Error ? cause.message : String(cause);
    return {
        id,
        ok: false,
        error: {
            code: fatal ? 'WORKER_DATABASE_FATAL' : 'WORKER_DATABASE_OPERATION_FAILED',
            message,
            retryable: !fatal,
            fatal,
        },
    };
}
//# sourceMappingURL=worker-database-protocol.js.map