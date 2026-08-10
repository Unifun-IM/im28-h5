import { describe, expect, it } from 'vitest';

import {
  startChatVoiceRecording,
  type ChatVoiceMediaRecorder,
  type ChatVoiceRecorderDependencies,
} from './chat-voice-recorder.js';

/** 创建可触发 data/stop 事件的最小录音器。 */
function createRecorderHarness(mimeType = 'audio/webm;codecs=opus') {
  // recorder 模拟浏览器 MediaRecorder 生命周期。
  const recorder: ChatVoiceMediaRecorder = {
    state: 'inactive',
    mimeType,
    ondataavailable: null,
    onstop: null,
    onerror: null,
    start: () => {
      recorder.state = 'recording';
    },
    stop: () => {
      recorder.state = 'inactive';
      // chunk 使用真实 Blob 证明最终 File 内容来源。
      const chunk = new Blob(['voice'], { type: mimeType });
      recorder.ondataavailable?.({ data: chunk });
      recorder.onstop?.();
    },
  };
  return recorder;
}

/** 创建记录 track cleanup 和 MIME 选择的注入依赖。 */
function createRecorderDependencies(recorder: ChatVoiceMediaRecorder) {
  // stoppedTracks 记录媒体流是否在终态释放。
  let stoppedTracks = 0;
  // selectedMimeTypes 保存 adapter 交给 recorder 的选择。
  const selectedMimeTypes: string[] = [];
  // times 提供确定性录音时长。
  const times = [1_000, 8_400];
  // dependencies 隔离真实麦克风和全局 MediaRecorder。
  const dependencies: ChatVoiceRecorderDependencies = {
    getUserMedia: async () => ({
      getTracks: () => [
        {
          stop: () => {
            stoppedTracks += 1;
          },
        },
      ],
    }),
    isTypeSupported: type => type === 'audio/webm;codecs=opus',
    createMediaRecorder: (_stream, mimeType) => {
      selectedMimeTypes.push(mimeType);
      return recorder;
    },
    now: () => times.shift() ?? 8_400,
  };
  return {
    dependencies,
    selectedMimeTypes,
    getStoppedTracks: () => stoppedTracks,
  };
}

// 浏览器 recorder adapter 必须产出真实 File，并在所有终态释放媒体流。
describe('chat voice recorder', () => {
  // 验证支持的 MIME、扩展名、时长和 track cleanup。
  it('stops a recording into a typed File and releases its stream', async () => {
    // recorder 提供 WebM Opus 输出。
    const recorder = createRecorderHarness();
    // harness 记录平台边界行为。
    const harness = createRecorderDependencies(recorder);
    // session 是页面唯一可持有的短期录音句柄。
    const session = await startChatVoiceRecording(harness.dependencies);

    await expect(session.stop()).resolves.toMatchObject({
      durationSeconds: 7,
      file: {
        type: 'audio/webm;codecs=opus',
        size: 5,
      },
    });
    expect(harness.selectedMimeTypes).toEqual(['audio/webm;codecs=opus']);
    expect(harness.getStoppedTracks()).toBe(1);
  });

  // 验证取消录音不会返回可上传文件且仍释放媒体流。
  it('discards a canceled recording and releases its stream', async () => {
    // recorder 复用同一真实事件形态。
    const recorder = createRecorderHarness();
    // harness 记录取消清理。
    const harness = createRecorderDependencies(recorder);
    // session 在取消前已启动录音。
    const session = await startChatVoiceRecording(harness.dependencies);

    await expect(session.cancel()).resolves.toBeUndefined();
    expect(harness.getStoppedTracks()).toBe(1);
  });

  // 验证权限/设备失败直接 reject，不创建 recorder 或 fake File。
  it('surfaces microphone acquisition failure', async () => {
    // dependencies 模拟浏览器拒绝麦克风访问。
    const dependencies: ChatVoiceRecorderDependencies = {
      getUserMedia: async () => {
        throw new Error('permission denied');
      },
      isTypeSupported: () => true,
      createMediaRecorder: () => createRecorderHarness(),
      now: () => 1,
    };

    await expect(startChatVoiceRecording(dependencies)).rejects.toThrow(
      'permission denied',
    );
  });

  // 验证松手前的 recorder error 可立即被页面观察且不会泄漏音轨。
  it('publishes an early recorder failure and releases its stream', async () => {
    // recorder 允许测试主动触发浏览器异步设备错误。
    const recorder = createRecorderHarness();
    // harness 记录错误终态的 track cleanup。
    const harness = createRecorderDependencies(recorder);
    // session 已经进入 recording，尚未调用 stop/cancel。
    const session = await startChatVoiceRecording(harness.dependencies);
    // failure 是页面退出 recording UI 的确定性信号。
    const failure = session.failure;

    recorder.onerror?.({ error: new Error('device disconnected') });

    await expect(failure).resolves.toMatchObject({
      message: 'device disconnected',
    });
    expect(harness.getStoppedTracks()).toBe(1);
    await expect(session.cancel()).resolves.toBeUndefined();
    expect(harness.getStoppedTracks()).toBe(1);
  });
});
