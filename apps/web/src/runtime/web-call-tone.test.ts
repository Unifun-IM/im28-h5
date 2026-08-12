import { describe, expect, it, vi } from 'vitest';

import {
  createWebCallToneController,
  type WebCallToneAudio,
} from './web-call-tone.js';

/** 创建可观察播放动作的测试音频。 */
function createAudio(): WebCallToneAudio {
  return {
    loop: false,
    currentTime: 0,
    play: vi.fn(async () => undefined),
    pause: vi.fn(),
  };
}

describe('createWebCallToneController', () => {
  it('循环播放来电音并可停止重置', async () => {
    /** callingAudio 记录循环和停止状态。 */
    const callingAudio = createAudio();
    /** hangupAudio 与来电音隔离。 */
    const hangupAudio = createAudio();
    /** controller 使用确定性依赖。 */
    const controller = createWebCallToneController('calling.mp3', 'hangup.mp3', {
      createAudio: source => source === 'calling.mp3' ? callingAudio : hangupAudio,
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
    });

    await expect(controller.startCalling()).resolves.toBe(true);
    controller.stopCalling();

    expect(callingAudio.loop).toBe(true);
    expect(callingAudio.play).toHaveBeenCalledOnce();
    expect(callingAudio.pause).toHaveBeenCalled();
    expect(callingAudio.currentTime).toBe(0);
  });

  it('自动播放被拦截时返回 false 供 UI 显示恢复入口', async () => {
    /** callingAudio 模拟浏览器 autoplay policy。 */
    const callingAudio = createAudio();
    vi.mocked(callingAudio.play).mockRejectedValue(new Error('NotAllowedError'));
    /** controller 不把策略拒绝升级为来电失败。 */
    const controller = createWebCallToneController('calling.mp3', 'hangup.mp3', {
      createAudio: source => source === 'calling.mp3' ? callingAudio : createAudio(),
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
    });

    await expect(controller.startCalling()).resolves.toBe(false);
  });

  it('挂断音最多播放一秒且不恢复来电循环', async () => {
    /** callingAudio 验证切换前先停止。 */
    const callingAudio = createAudio();
    /** hangupAudio 验证短音播放。 */
    const hangupAudio = createAudio();
    /** stopCallback 保存定时停止动作。 */
    let stopCallback: (() => void) | null = null;
    /** controller 使用可控定时器。 */
    const controller = createWebCallToneController('calling.mp3', 'hangup.mp3', {
      createAudio: source => source === 'calling.mp3' ? callingAudio : hangupAudio,
      setTimeout: vi.fn(callback => {
        stopCallback = callback;
        return 1 as ReturnType<typeof setTimeout>;
      }),
      clearTimeout: vi.fn(),
    });

    await controller.playHangup();
    if (stopCallback) (stopCallback as () => void)();

    expect(callingAudio.pause).toHaveBeenCalled();
    expect(hangupAudio.play).toHaveBeenCalledOnce();
    expect(hangupAudio.pause).toHaveBeenCalled();
  });
});
