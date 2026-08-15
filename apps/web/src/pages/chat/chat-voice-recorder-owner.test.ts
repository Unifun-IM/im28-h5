import { describe, expect, it } from 'vitest';

import platformSource from './chat-voice-recorder-platform.ts?raw';
import recorderSource from './chat-voice-recorder.ts?raw';

/** 录音 owner 合同阻止浏览器能力与会话终态再次合并。 */
describe('chat voice recorder owners', () => {
  /** Platform owner 独占麦克风、MediaRecorder、MIME 和 track cleanup。 */
  it('keeps browser media primitives in one bounded platform owner', () => {
    expect(platformSource).toContain('globalThis.navigator?.mediaDevices');
    expect(platformSource).toContain('new globalThis.MediaRecorder');
    expect(platformSource).toContain('CHAT_VOICE_MIME_CANDIDATES');
    expect(platformSource).toContain('export function stopChatVoiceStream');
    expect(recorderSource).not.toMatch(/globalThis\.navigator|new globalThis\.MediaRecorder|CHAT_VOICE_MIME_CANDIDATES/);
  });

  /** Session owner 继续独占 start/stop/cancel/error 的单次终态。 */
  it('keeps recording lifecycle outside the browser platform owner', () => {
    expect(recorderSource).toContain('export async function startChatVoiceRecording');
    expect(recorderSource).toContain('finishChatVoiceRecording');
    expect(recorderSource).toContain('createChatVoiceCompletion');
    expect(platformSource).not.toMatch(/finishChatVoiceRecording|terminalPromise|completionReject/);
    expect(recorderSource.split('\n').length).toBeLessThanOrEqual(301);
    expect(platformSource.split('\n').length).toBeLessThanOrEqual(301);
  });
});
