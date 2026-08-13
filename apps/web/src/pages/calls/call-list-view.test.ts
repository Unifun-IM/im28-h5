import { describe, expect, it } from 'vitest';

import {
  formatCallClock,
  formatCallDateHeader,
  getCallDayRange,
  getCallListEmptyLabel,
  refreshCallListPage,
} from './call-list-view.js';

describe('call detail list view', () => {
  it('creates a local natural-day half-open range', () => {
    /** source 使用本地时区构造以避免依赖测试机器 UTC 偏移。 */
    const source = new Date(2026, 7, 10, 18, 45, 30);
    /** range 是详情页交给 shared SQLite 查询的边界。 */
    const range = getCallDayRange(source.toISOString());
    /** expectedStart 是同一天本地零点。 */
    const expectedStart = new Date(2026, 7, 10, 0, 0, 0, 0).getTime();
    /** expectedEnd 是次日本地零点。 */
    const expectedEnd = new Date(2026, 7, 11, 0, 0, 0, 0).getTime();

    expect(range).toEqual({ startMs: expectedStart, endMs: expectedEnd });
  });

  it('formats RN detail date and clock in local time', () => {
    /** source 固定详情展示需要的本地日期与时分。 */
    const source = new Date(2026, 7, 10, 9, 7, 4).toISOString();

    expect(formatCallDateHeader(source)).toBe('2026年8月10日');
    expect(formatCallClock(source)).toBe('09:07');
    expect(formatCallClock('invalid')).toBe('');
  });

  it('forces remote sync before rereading the selected cached page', async () => {
    /** calls 记录刷新链的稳定调用顺序。 */
    const calls: string[] = [];
    /** service 只实现页面刷新需要的 facade 子集。 */
    const service = {
      async sync() {
        calls.push('sync');
        return { list: [], total: 0 };
      },
      async listCached(options: unknown) {
        calls.push(`cache:${JSON.stringify(options)}`);
        return { list: [], total: 0 };
      },
    };

    await expect(refreshCallListPage(service, 'missed', 'donk', 30)).resolves.toEqual({
      list: [],
      total: 0,
    });
    expect(calls).toEqual([
      'sync',
      'cache:{"answerStatus":"missed","keyword":"donk","limit":30,"offset":0}',
    ]);
  });

  it('does not replace cache when forced sync fails', async () => {
    /** cacheReads 证明失败路径不会读取并投影伪成功快照。 */
    let cacheReads = 0;
    /** service 模拟 Gateway 同步失败。 */
    const service = {
      async sync() {
        throw new Error('network failed');
      },
      async listCached() {
        cacheReads += 1;
        return { list: [], total: 0 };
      },
    };

    await expect(refreshCallListPage(service, 'all', '', 30)).rejects.toThrow('network failed');
    expect(cacheReads).toBe(0);
  });

  it('projects RN empty labels with search taking precedence over the missed filter', () => {
    expect(getCallListEmptyLabel('missed', ' donk ')).toBe('暂无搜索结果');
    expect(getCallListEmptyLabel('missed', '  ')).toBe('暂无未接来电');
    expect(getCallListEmptyLabel('all', '')).toBe('暂无通话记录');
  });
});
