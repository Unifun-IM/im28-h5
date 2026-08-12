import { describe, expect, it } from 'vitest';

import {
  formatCallClock,
  formatCallDateHeader,
  getCallDayRange,
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
});
