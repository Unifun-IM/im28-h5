import { describe, expect, it } from 'vitest';

import { readChatVoiceError } from './useChatVoiceRecorder.js';

// 浏览器麦克风错误必须归一化为稳定中文提示，避免泄漏内核英文细节。
describe('chat voice recorder error projection', () => {
  // 权限与安全策略拒绝复用同一可操作提示。
  it('maps microphone permission denial to a localized message', () => {
    expect(readChatVoiceError(new DOMException('permission denied', 'NotAllowedError'))).toBe(
      '无法访问麦克风，请检查浏览器权限',
    );
    expect(readChatVoiceError(new DOMException('blocked', 'SecurityError'))).toBe(
      '无法访问麦克风，请检查浏览器权限',
    );
  });

  // 设备缺失与临时占用分别给出稳定恢复建议。
  it('maps unavailable microphone failures without exposing browser details', () => {
    expect(readChatVoiceError(new DOMException('missing', 'NotFoundError'))).toBe(
      '未检测到可用麦克风',
    );
    expect(readChatVoiceError(new DOMException('busy', 'NotReadableError'))).toBe(
      '麦克风暂时不可用，请稍后重试',
    );
  });

  // 非平台异常保留业务层已归一化的具体文案。
  it('preserves explicit recorder errors and provides a final fallback', () => {
    expect(readChatVoiceError(new Error('浏览器录音失败'))).toBe('浏览器录音失败');
    expect(readChatVoiceError(null)).toBe('语音录制失败');
  });
});
