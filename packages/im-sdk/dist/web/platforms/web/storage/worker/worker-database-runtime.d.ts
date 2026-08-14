import type { DatabaseAdapter } from '@im28/im-sdk/core';
import { z } from 'zod';
import { type WorkerDatabaseResponse } from './worker-database-protocol.js';
declare const OPEN_PAYLOAD_SCHEMA: z.ZodObject<{
    databaseName: z.ZodString;
    wasmURL: z.ZodString;
    storageDatabaseName: z.ZodOptional<z.ZodString>;
    mode: z.ZodOptional<z.ZodEnum<{
        readwrite: "readwrite";
        "readonly-existing": "readonly-existing";
    }>>;
}, z.core.$strip>;
/** Worker open 后创建真实 DatabaseAdapter 的依赖。 */
export interface WorkerDatabaseRuntimeDependencies {
    readonly createDatabase: (options: z.infer<typeof OPEN_PAYLOAD_SCHEMA>) => DatabaseAdapter;
}
/** 创建校验消息并拥有 Worker 数据库状态的 RPC runtime。 */
export declare function createWorkerDatabaseRuntime(dependencies: WorkerDatabaseRuntimeDependencies): WorkerDatabaseRuntime;
export declare class WorkerDatabaseRuntime {
    private readonly dependencies;
    private database;
    private activeTransaction;
    /** 保存数据库 factory，不在构造阶段访问浏览器全局。 */
    constructor(dependencies: WorkerDatabaseRuntimeDependencies);
    /** 校验并执行一条 Worker 消息，所有异常归一为可克隆响应。 */
    handle(value: unknown): Promise<WorkerDatabaseResponse>;
    /** 按有限 operation 集合路由数据库调用。 */
    private dispatch;
    /** 创建并打开唯一数据库；重复 open 仅允许同名配置。 */
    private open;
    /** 启动 adapter transaction 并在 callback 就绪后返回 transactionID。 */
    private beginTransaction;
    /** 校验 transactionID 并返回绑定 statement 的执行器。 */
    private requireTransactionStatement;
    /** 提交或回滚当前 transaction，并等待 adapter 完整收尾。 */
    private finishTransaction;
    /** 正常关闭健康数据库，活动 transaction 必须先完成。 */
    private close;
    /** 获取已打开数据库，拒绝隐式创建空库。 */
    private requireDatabase;
    /** 获取匹配 ID 的活动 transaction。 */
    private requireTransaction;
}
export {};
//# sourceMappingURL=worker-database-runtime.d.ts.map