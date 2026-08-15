import {
  createBrowserChatVoiceLevelReader,
  type ChatVoiceLevelReader,
} from './chat-voice-level-reader.js';

/** 浏览器媒体流只暴露当前录音会话需要的 track cleanup。 */
export interface ChatVoiceMediaStream {
  getTracks(): readonly { stop(): void }[];
}

/** 浏览器录音器的最小可注入事件和生命周期 contract。 */
export interface ChatVoiceMediaRecorder {
  state: string;
  readonly mimeType: string;
  ondataavailable: ((event: { readonly data: Blob }) => void) | null;
  onstop: (() => void) | null;
  onerror: ((event: { readonly error?: Error }) => void) | null;
  start(): void;
  stop(): void;
}

/** 录音 adapter 的浏览器能力依赖可由测试替换。 */
export interface ChatVoiceRecorderDependencies {
  readonly getUserMedia: () => Promise<ChatVoiceMediaStream>;
  readonly isTypeSupported: (mimeType: string) => boolean;
  readonly createMediaRecorder: (
    stream: ChatVoiceMediaStream,
    mimeType: string,
  ) => ChatVoiceMediaRecorder;
  readonly createLevelReader?: (
    stream: ChatVoiceMediaStream,
  ) => ChatVoiceLevelReader;
  readonly now: () => number;
}

/** 浏览器优先选择服务端可透传且主流实现可录制的音频格式。 */
const CHAT_VOICE_MIME_CANDIDATES = [
  'audio/mp4;codecs=mp4a.40.2',
  'audio/webm;codecs=opus',
  'audio/ogg;codecs=opus',
] as const;

/** 创建调用标准 getUserMedia/MediaRecorder 的生产依赖。 */
export function createDefaultChatVoiceRecorderDependencies(): ChatVoiceRecorderDependencies {
  return {
    getUserMedia: async () => {
      /** mediaDevices 必须真实存在，缺失时不可退化为 fake recorder。 */
      const mediaDevices = globalThis.navigator?.mediaDevices;
      if (!mediaDevices?.getUserMedia) {
        throw new Error('当前浏览器不支持麦克风录音');
      }
      return mediaDevices.getUserMedia({ audio: true });
    },
    isTypeSupported: mimeType =>
      typeof globalThis.MediaRecorder === 'function' &&
      globalThis.MediaRecorder.isTypeSupported(mimeType),
    createMediaRecorder: (stream, mimeType) => {
      if (typeof globalThis.MediaRecorder !== 'function') {
        throw new Error('当前浏览器不支持录音');
      }
      /** recorder 仅在此处把 DOM 回调签名收窄为可注入 platform contract。 */
      const recorder = new globalThis.MediaRecorder(
        stream as MediaStream,
        mimeType ? { mimeType } : undefined,
      );
      return recorder as unknown as ChatVoiceMediaRecorder;
    },
    createLevelReader: stream => createBrowserChatVoiceLevelReader(stream),
    now: () => Date.now(),
  };
}

/** 选择浏览器明确报告支持的首个录音 MIME。 */
export function selectChatVoiceMimeType(
  dependencies: ChatVoiceRecorderDependencies,
): string {
  return (
    CHAT_VOICE_MIME_CANDIDATES.find(candidate =>
      dependencies.isTypeSupported(candidate),
    ) ?? ''
  );
}

/** 将录音 MIME 映射为 OSS 对象扩展名。 */
export function chatVoiceExtensionFromMimeType(mimeType: string): string {
  /** normalized 忽略 codecs 参数和大小写。 */
  const normalized = mimeType.toLowerCase().split(';')[0]?.trim();
  if (normalized === 'audio/mp4') return 'm4a';
  if (normalized === 'audio/ogg') return 'ogg';
  return 'webm';
}

/** 停止媒体流中的全部 track，且不让单个 cleanup 失败阻塞其余 track。 */
export function stopChatVoiceStream(stream: ChatVoiceMediaStream): void {
  /** track 逐个释放，单轨异常不阻断其余设备资源 cleanup。 */
  for (const track of stream.getTracks()) {
    try {
      track.stop();
    } catch {
      // 浏览器 track 释放是 best effort，终态仍由 recorder 结果决定。
    }
  }
}
