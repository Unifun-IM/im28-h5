/** 跨同步服务共享的单标签页业务写操作队列。 */
export interface WebIMSyncMutationQueue {
    enqueue<Result>(operation: () => Promise<Result>): Promise<Result>;
}
/** 允许各同步服务接收组合根创建的共享队列。 */
export interface WebIMSyncMutationQueueDependencies {
    readonly mutationQueue?: WebIMSyncMutationQueue;
}
/** 创建失败后仍可继续消费后续操作的 FIFO 队列。 */
export declare function createWebIMSyncMutationQueue(): WebIMSyncMutationQueue;
//# sourceMappingURL=sync-mutation-queue.d.ts.map