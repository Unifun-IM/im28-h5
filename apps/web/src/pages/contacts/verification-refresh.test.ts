import { describe, expect, it, vi } from 'vitest';

import { refreshVerificationEntries } from './verification-refresh.js';

describe('verification list refresh', () => {
  it('keeps a successful list when unread refresh fails', async () => {
    /** loadEntries 返回页面应采用的真实列表。 */
    const loadEntries = vi.fn(async () => ['application-1'] as const);
    /** refreshUnread 模拟独立角标端点失败。 */
    const refreshUnread = vi.fn(() => { throw new Error('unread failed'); });

    await expect(refreshVerificationEntries({ loadEntries, refreshUnread }))
      .resolves.toEqual(['application-1']);
    expect(loadEntries).toHaveBeenCalledTimes(1);
    expect(refreshUnread).toHaveBeenCalledTimes(1);
  });

  it('reports list failure even when unread refresh succeeds', async () => {
    /** loadEntries 模拟列表 Gateway 失败。 */
    const loadEntries = vi.fn(async (): Promise<readonly string[]> => {
      throw new Error('list failed');
    });
    /** refreshUnread 证明独立计数仍会执行。 */
    const refreshUnread = vi.fn(async () => undefined);

    await expect(refreshVerificationEntries({ loadEntries, refreshUnread }))
      .rejects.toThrow('list failed');
    expect(refreshUnread).toHaveBeenCalledTimes(1);
  });
});
