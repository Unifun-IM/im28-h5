/** 创建失败后仍可继续消费后续操作的 FIFO 队列。 */
export function createIMSyncMutationQueue() {
    return new IMSyncMutationQueueImpl();
}
/** Promise 链只维护执行顺序，不吞掉单次操作结果。 */
class IMSyncMutationQueueImpl {
    // operationQueue 表示最近一次排队操作的完成状态。
    operationQueue = Promise.resolve();
    /** 将完整业务操作追加到队尾并原样返回其结果。 */
    enqueue(operation) {
        // result 同时覆盖前序成功和失败，确保队列不会中断。
        const result = this.operationQueue.then(operation, operation);
        this.operationQueue = result.then(() => undefined, () => undefined);
        return result;
    }
}
/** 兼容已发布的 Web 命名；实现与 createIMSyncMutationQueue 相同。 */
export const createWebIMSyncMutationQueue = createIMSyncMutationQueue;
//# sourceMappingURL=sync-mutation-queue.js.map