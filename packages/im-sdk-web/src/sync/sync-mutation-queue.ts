/** 跨同步服务共享的单标签页业务写操作队列。 */
export interface WebIMSyncMutationQueue {
  enqueue<Result>(operation: () => Promise<Result>): Promise<Result>;
}

/** 允许各同步服务接收组合根创建的共享队列。 */
export interface WebIMSyncMutationQueueDependencies {
  readonly mutationQueue?: WebIMSyncMutationQueue;
}

/** 创建失败后仍可继续消费后续操作的 FIFO 队列。 */
export function createWebIMSyncMutationQueue(): WebIMSyncMutationQueue {
  return new WebIMSyncMutationQueueImpl();
}

/** Promise 链只维护执行顺序，不吞掉单次操作结果。 */
class WebIMSyncMutationQueueImpl implements WebIMSyncMutationQueue {
  // operationQueue 表示最近一次排队操作的完成状态。
  private operationQueue: Promise<void> = Promise.resolve();

  /** 将完整业务操作追加到队尾并原样返回其结果。 */
  enqueue<Result>(operation: () => Promise<Result>): Promise<Result> {
    // result 同时覆盖前序成功和失败，确保队列不会中断。
    const result = this.operationQueue.then(operation, operation);
    this.operationQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }
}
