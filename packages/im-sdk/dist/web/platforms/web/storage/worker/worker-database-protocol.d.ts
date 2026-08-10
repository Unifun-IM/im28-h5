import { z } from 'zod';
declare const WORKER_DATABASE_OPERATION_SCHEMA: z.ZodEnum<{
    close: "close";
    open: "open";
    execute: "execute";
    query: "query";
    "transaction.begin": "transaction.begin";
    "transaction.execute": "transaction.execute";
    "transaction.query": "transaction.query";
    "transaction.commit": "transaction.commit";
    "transaction.rollback": "transaction.rollback";
}>;
declare const WORKER_DATABASE_REQUEST_SCHEMA: z.ZodObject<{
    id: z.ZodString;
    operation: z.ZodEnum<{
        close: "close";
        open: "open";
        execute: "execute";
        query: "query";
        "transaction.begin": "transaction.begin";
        "transaction.execute": "transaction.execute";
        "transaction.query": "transaction.query";
        "transaction.commit": "transaction.commit";
        "transaction.rollback": "transaction.rollback";
    }>;
    payload: z.ZodUnknown;
}, z.core.$strip>;
declare const WORKER_DATABASE_ERROR_SCHEMA: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    retryable: z.ZodBoolean;
    fatal: z.ZodBoolean;
}, z.core.$strip>;
declare const WORKER_DATABASE_RESPONSE_SCHEMA: z.ZodDiscriminatedUnion<[z.ZodObject<{
    id: z.ZodString;
    ok: z.ZodLiteral<true>;
    result: z.ZodUnknown;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    ok: z.ZodLiteral<false>;
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        retryable: z.ZodBoolean;
        fatal: z.ZodBoolean;
    }, z.core.$strip>;
}, z.core.$strip>], "ok">;
/** Worker 数据库 RPC 操作集合。 */
export type WorkerDatabaseOperation = z.infer<typeof WORKER_DATABASE_OPERATION_SCHEMA>;
/** Worker 数据库 RPC 请求 envelope。 */
export type WorkerDatabaseRequest = z.infer<typeof WORKER_DATABASE_REQUEST_SCHEMA>;
/** Worker 数据库 RPC 错误。 */
export type WorkerDatabaseRPCError = z.infer<typeof WORKER_DATABASE_ERROR_SCHEMA>;
/** Worker 数据库 RPC 响应 envelope。 */
export type WorkerDatabaseResponse = z.infer<typeof WORKER_DATABASE_RESPONSE_SCHEMA>;
/** 校验主线程发往 Worker 的请求。 */
export declare function parseWorkerDatabaseRequest(value: unknown): WorkerDatabaseRequest;
/** 校验 Worker 返回主线程的响应。 */
export declare function parseWorkerDatabaseResponse(value: unknown): WorkerDatabaseResponse;
/** 创建具名成功响应。 */
export declare function createWorkerDatabaseSuccess(id: string, result: unknown): WorkerDatabaseResponse;
/** 创建具名失败响应并规范化未知异常。 */
export declare function createWorkerDatabaseFailure(id: string, cause: unknown, fatal: boolean): WorkerDatabaseResponse;
export {};
//# sourceMappingURL=worker-database-protocol.d.ts.map