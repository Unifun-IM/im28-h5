import { describe, expect, it } from 'vitest';

import {
  readChatVideoMetadata,
  type ChatVideoMetadataDependencies,
  type ChatVideoMetadataElement,
} from './chat-video-metadata.js';

/** 创建可控 metadata 事件和清理状态的测试 video element。 */
function createVideoElement(
  values: Readonly<{
    duration: number;
    width: number;
    height: number;
    fail?: boolean;
  }>,
) {
  // removed 记录隐藏 element 是否已回收。
  let removed = false;
  // video 使用 microtask 模拟浏览器 metadata 事件。
  const video: ChatVideoMetadataElement = {
    preload: '',
    src: '',
    duration: values.duration,
    videoWidth: values.width,
    videoHeight: values.height,
    onloadedmetadata: null,
    onerror: null,
    load: () => {
      queueMicrotask(() =>
        values.fail
          ? video.onerror?.(new Event('error'))
          : video.onloadedmetadata?.(new Event('loadedmetadata')),
      );
    },
    remove: () => {
      removed = true;
    },
  };
  return { video, wasRemoved: () => removed };
}

/** 创建不触碰真实 DOM 或 object URL 的 metadata 依赖。 */
function createDependencies(video: ChatVideoMetadataElement) {
  // revoked 保存被释放的测试 URL。
  const revoked: string[] = [];
  // dependencies 隔离生产浏览器 I/O。
  const dependencies: ChatVideoMetadataDependencies = {
    createObjectURL: () => 'blob:test-video',
    revokeObjectURL: url => revoked.push(url),
    createVideoElement: () => video,
  };
  return { dependencies, revoked };
}

// 视频 metadata 必须在任何 SDK 上传前可验证并完整清理临时资源。
describe('chat video metadata', () => {
  // 验证有效时长和尺寸按浏览器结果返回。
  it('reads video metadata and revokes its object URL', async () => {
    // element 提供带小数时长的真实形态。
    const element = createVideoElement({ duration: 7.4, width: 1280, height: 720 });
    // harness 记录资源回收。
    const harness = createDependencies(element.video);
    // file 只作为 object URL 输入身份。
    const file = { name: 'clip.mp4' } as File;

    await expect(
      readChatVideoMetadata(file, harness.dependencies),
    ).resolves.toEqual({ durationSeconds: 7.4, width: 1280, height: 720 });
    expect(harness.revoked).toEqual(['blob:test-video']);
    expect(element.wasRemoved()).toBe(true);
  });

  // 验证损坏 metadata 显式失败且仍释放资源。
  it('rejects invalid dimensions before upload', async () => {
    // element 缺少可用画面尺寸。
    const element = createVideoElement({ duration: 2, width: 0, height: 0 });
    // harness 记录失败路径清理。
    const harness = createDependencies(element.video);

    await expect(
      readChatVideoMetadata({ name: 'broken.mp4' } as File, harness.dependencies),
    ).rejects.toThrow('无法读取视频信息');
    expect(harness.revoked).toEqual(['blob:test-video']);
    expect(element.wasRemoved()).toBe(true);
  });
});
