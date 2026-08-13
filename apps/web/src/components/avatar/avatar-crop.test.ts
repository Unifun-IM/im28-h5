import { describe, expect, it } from 'vitest';

import { resolveAvatarCropRect } from './avatar-crop.js';

// 群头像裁剪坐标覆盖横图、竖图、缩放与边界拖动合同。
describe('group avatar crop', () => {
  it('以 cover 方式居中裁剪横图和竖图', () => {
    expect(resolveAvatarCropRect({ sourceWidth: 1200, sourceHeight: 800, stageSize: 300, scale: 1, translateX: 0, translateY: 0 })).toEqual({ x: 200, y: 0, size: 800 });
    expect(resolveAvatarCropRect({ sourceWidth: 800, sourceHeight: 1200, stageSize: 300, scale: 1, translateX: 0, translateY: 0 })).toEqual({ x: 0, y: 200, size: 800 });
  });

  it('缩放和越界拖动后仍返回源图内部正方形', () => {
    // rect 验证拖动会被约束到右下边界而不会露底。
    const rect = resolveAvatarCropRect({ sourceWidth: 1000, sourceHeight: 800, stageSize: 320, scale: 2, translateX: -9999, translateY: -9999 });
    expect(rect).toEqual({ x: 600, y: 400, size: 400 });
  });
});
