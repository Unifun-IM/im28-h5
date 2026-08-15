import { describe, expect, it } from 'vitest';

import {
  getPullRefreshDistance,
  shouldStartPointerPullRefresh,
  shouldTriggerPullRefresh,
} from './use-pull-refresh.js';

// 下拉刷新 contract 锁定跨列表共用的阻尼、最大距离和触发阈值。
describe('pull refresh', () => {
  /** 验证向上移动不会产生可见距离，过长下拉受上限约束。 */
  it('clamps the damped pull distance', () => {
    expect(getPullRefreshDistance(-20)).toBe(0);
    expect(getPullRefreshDistance(100)).toBe(45);
    expect(getPullRefreshDistance(1000)).toBe(76);
  });

  /** 验证只有达到 RN 对齐阈值才触发一次刷新。 */
  it('arms refresh at the visible threshold', () => {
    expect(shouldTriggerPullRefresh(55.9)).toBe(false);
    expect(shouldTriggerPullRefresh(56)).toBe(true);
  });

  /** PC 只接受鼠标主键，触摸 pointer 继续由既有 Touch Events 处理。 */
  it('accepts only the primary mouse pointer', () => {
    expect(shouldStartPointerPullRefresh('mouse', 0)).toBe(true);
    expect(shouldStartPointerPullRefresh('mouse', 2)).toBe(false);
    expect(shouldStartPointerPullRefresh('touch', 0)).toBe(false);
    expect(shouldStartPointerPullRefresh('pen', 0)).toBe(false);
  });
});
