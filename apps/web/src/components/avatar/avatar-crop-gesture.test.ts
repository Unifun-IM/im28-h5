import { describe, expect, it } from 'vitest';

import {
  getAvatarGestureSnapshot,
  resolveAvatarGestureTransform,
} from './avatar-crop-gesture.js';

// 头像裁剪手势合同覆盖单指拖动、双指缩放和倍率边界。
describe('avatar crop gesture', () => {
  it('单指移动只更新图片位移', () => {
    expect(resolveAvatarGestureTransform({
      startTransform: { scale: 2, translate: { x: 5, y: -4 } },
      startSnapshot: { center: { x: 100, y: 120 }, distance: 0 },
      currentSnapshot: { center: { x: 124, y: 110 }, distance: 0 },
    })).toEqual({ scale: 2, translate: { x: 29, y: -14 } });
  });

  it('双指间距和中心变化同时驱动缩放与拖动', () => {
    expect(resolveAvatarGestureTransform({
      startTransform: { scale: 1.5, translate: { x: 0, y: 0 } },
      startSnapshot: { center: { x: 100, y: 100 }, distance: 80 },
      currentSnapshot: { center: { x: 110, y: 96 }, distance: 160 },
    })).toEqual({ scale: 3, translate: { x: 10, y: -4 } });
  });

  it('触点快照计算中心、距离并限制缩放范围', () => {
    expect(getAvatarGestureSnapshot([{ x: 10, y: 20 }, { x: 40, y: 60 }])).toEqual({
      center: { x: 25, y: 40 },
      distance: 50,
    });
    expect(resolveAvatarGestureTransform({
      startTransform: { scale: 3, translate: { x: 0, y: 0 } },
      startSnapshot: { center: { x: 0, y: 0 }, distance: 10 },
      currentSnapshot: { center: { x: 0, y: 0 }, distance: 100 },
    }).scale).toBe(4);
  });
});
