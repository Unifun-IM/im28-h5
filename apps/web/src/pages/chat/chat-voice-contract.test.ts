import { describe, expect, it } from 'vitest';

import {
  isChatVoiceRecordingTooShort,
  shouldCancelChatVoiceGesture,
} from './chat-voice-contract.js';

// 语音交互 helper 锁定 RN 的 56px 和 2 秒边界。
describe('chat voice interaction contract', () => {
  // 验证刚好 56px 进入取消态，避免设备像素近似漂移。
  it('cancels at the 56px upward threshold', () => {
    expect(shouldCancelChatVoiceGesture(200, 144)).toBe(true);
    expect(shouldCancelChatVoiceGesture(200, 145)).toBe(false);
  });

  // 验证刚好 2 秒可发送，少一毫秒仍拒绝。
  it('accepts recordings at exactly two seconds', () => {
    expect(isChatVoiceRecordingTooShort(1_000, 2_999)).toBe(true);
    expect(isChatVoiceRecordingTooShort(1_000, 3_000)).toBe(false);
  });
});
