import { describe, expect, it } from 'vitest';

import { createWebIMSyncMutationQueue } from './sync-mutation-queue.js';

// 业务队列必须在单次失败后继续执行后续 operation。
describe('Web IM sync mutation queue', () => {
  // 验证失败结果向调用方传播，但不会污染队列尾状态。
  it('continues with the next operation after a rejection', async () => {
    // queue 是同步 facade 内部使用的同一实现。
    const queue = createWebIMSyncMutationQueue();
    // order 记录两个 operation 的实际执行顺序。
    const order: string[] = [];
    // first 模拟 Gateway 或持久化失败。
    const first = queue.enqueue(async () => {
      order.push('first');
      throw new Error('first failed');
    });
    // second 必须等待 first 结束后仍可正常返回。
    const second = queue.enqueue(async () => {
      order.push('second');
      return 'completed';
    });

    await expect(first).rejects.toThrow('first failed');
    await expect(second).resolves.toBe('completed');
    expect(order).toEqual(['first', 'second']);
  });
});
