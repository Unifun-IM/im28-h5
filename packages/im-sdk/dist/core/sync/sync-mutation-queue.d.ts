/** 跨同步服务共享的单标签页业务写操作队列。 */
export interface IMSyncMutationQueue {
    enqueue<Result>(operation: () => Promise<Result>): Promise<Result>;
}
/** 允许各同步服务接收组合根创建的共享队列。 */
export interface IMSyncMutationQueueDependencies {
    readonly mutationQueue?: IMSyncMutationQueue;
}
/** 创建失败后仍可继续消费后续操作的 FIFO 队列。 */
export declare function createIMSyncMutationQueue(): IMSyncMutationQueue;
/** 兼容已发布的 Web 命名；权威契约是 IMSyncMutationQueue。 */
export type WebIMSyncMutationQueue = IMSyncMutationQueue;
/** 兼容已发布的 Web 命名；权威契约是 IMSyncMutationQueueDependencies。 */
export type WebIMSyncMutationQueueDependencies = IMSyncMutationQueueDependencies;
/** 兼容已发布的 Web 命名；实现与 createIMSyncMutationQueue 相同。 */
export declare const createWebIMSyncMutationQueue: typeof createIMSyncMutationQueue;
//# sourceMappingURL=sync-mutation-queue.d.ts.map