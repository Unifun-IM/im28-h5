import {
  createBrowserChatVoiceLevelReader,
  disposeChatVoiceLevelReader,
  readChatVoiceLevel,
  SILENT_CHAT_VOICE_LEVEL_READER,
  type ChatVoiceLevelReader,
} from './chat-voice-level-reader.js';

/** 浏览器媒体流只暴露本切片需要的 track cleanup。 */
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

/** 成功停止后交给 shared SDK 的真实录音文件和时长。 */
export interface ChatVoiceRecordingResult {
  readonly file: File;
  readonly durationSeconds: number;
}

/** 页面持有的短期录音会话只允许 stop 或 discard。 */
export interface ChatVoiceRecordingSession {
  readonly startedAt: number;
  readonly failure: Promise<Error>;
  readLevel(): number;
  stop(): Promise<ChatVoiceRecordingResult>;
  cancel(): Promise<void>;
}

/** 单次录音的可变终态集中在 adapter 内部，页面不可访问。 */
interface ChatVoiceRecorderState {
  readonly dependencies: ChatVoiceRecorderDependencies;
  readonly stream: ChatVoiceMediaStream;
  readonly recorder: ChatVoiceMediaRecorder;
  readonly levelReader: ChatVoiceLevelReader;
  readonly requestedMimeType: string;
  readonly startedAt: number;
  readonly chunks: Blob[];
  readonly failure: Promise<Error>;
  resolveFailure(error: Error): void;
  recorderError: Error | null;
  completionReject: ((cause: Error) => void) | null;
  terminalPromise: Promise<ChatVoiceRecordingResult | null> | null;
}

/** failure promise 需要同时暴露内部 resolve 以接收 recorder 事件。 */
interface ChatVoiceFailureDeferred {
  readonly promise: Promise<Error>;
  readonly resolve: (error: Error) => void;
}

/** 浏览器优先选择服务端可透传且主流实现可录制的音频格式。 */
const CHAT_VOICE_MIME_CANDIDATES = [
  'audio/mp4;codecs=mp4a.40.2',
  'audio/webm;codecs=opus',
  'audio/ogg;codecs=opus',
] as const;

/** 打开麦克风并返回不泄漏媒体流细节的录音会话。 */
export async function startChatVoiceRecording(
  dependencies: ChatVoiceRecorderDependencies =
    createDefaultChatVoiceRecorderDependencies(),
): Promise<ChatVoiceRecordingSession> {
  // stream 只在当前录音会话内存活。
  const stream = await dependencies.getUserMedia();
  try {
    // requestedMimeType 是浏览器明确支持的首个候选格式。
    const requestedMimeType = selectChatVoiceMimeType(dependencies);
    // recorder 是本次 Blob chunk 的唯一平台 owner。
    const recorder = dependencies.createMediaRecorder(
      stream,
      requestedMimeType,
    );
    // levelReader 只增强 HUD，Web Audio 缺失不得阻断真实 MediaRecorder。
    const levelReader = dependencies.createLevelReader?.(stream) ??
      SILENT_CHAT_VOICE_LEVEL_READER;
    // startedAt 使用注入时钟统一交互和消息时长。
    const startedAt = dependencies.now();
    // failure 将松手前设备异常暴露给页面状态 owner。
    const failure = createChatVoiceFailureDeferred();
    // state 集中 recorder 的可变终态，避免页面复制生命周期。
    const state: ChatVoiceRecorderState = {
      dependencies,
      stream,
      recorder,
      levelReader,
      requestedMimeType,
      startedAt,
      chunks: [],
      failure: failure.promise,
      resolveFailure: failure.resolve,
      recorderError: null,
      completionReject: null,
      terminalPromise: null,
    };

    bindChatVoiceRecorderEvents(state);
    try {
      recorder.start();
    } catch (cause) {
      disposeChatVoiceLevelReader(levelReader);
      throw cause;
    }
    return {
      startedAt,
      failure: state.failure,
      readLevel: () => readChatVoiceLevel(state.levelReader),
      stop: () => stopChatVoiceRecording(state),
      cancel: async () => {
        await finishChatVoiceRecording(state, true);
      },
    };
  } catch (cause) {
    stopChatVoiceStream(stream);
    throw cause;
  }
}

/** 绑定 chunk 和错误事件，确保设备中断立即释放媒体流。 */
function bindChatVoiceRecorderEvents(state: ChatVoiceRecorderState): void {
  state.recorder.ondataavailable = event => {
    if (event.data.size > 0) state.chunks.push(event.data);
  };
  state.recorder.onerror = event => {
    // error 归一化浏览器可能省略的事件详情。
    const error = event.error ?? new Error('浏览器录音失败');
    state.recorderError = error;
    if (state.completionReject) {
      state.completionReject(error);
      return;
    }
    stopChatVoiceStream(state.stream);
    disposeChatVoiceLevelReader(state.levelReader);
    state.resolveFailure(error);
  };
}

/** 停止录音并保证非丢弃路径返回真实 File。 */
async function stopChatVoiceRecording(
  state: ChatVoiceRecorderState,
): Promise<ChatVoiceRecordingResult> {
  // result 在非 discard 路径必须存在。
  const result = await finishChatVoiceRecording(state, false);
  if (!result) throw new Error('浏览器录音未生成文件');
  return result;
}

/** 以 stop 或 discard 意图建立唯一 recorder 终态 promise。 */
function finishChatVoiceRecording(
  state: ChatVoiceRecorderState,
  discard: boolean,
): Promise<ChatVoiceRecordingResult | null> {
  if (state.terminalPromise) return state.terminalPromise;
  if (state.recorderError) {
    state.terminalPromise = discard
      ? Promise.resolve(null)
      : Promise.reject(state.recorderError);
    return state.terminalPromise;
  }
  // completion 由真实 recorder stop/error 事件决定。
  const completion = createChatVoiceCompletion(state, discard);
  state.terminalPromise = completion.finally(() => {
    state.completionReject = null;
    disposeChatVoiceLevelReader(state.levelReader);
    stopChatVoiceStream(state.stream);
  });
  return state.terminalPromise;
}

/** 把 recorder stop/error 事件映射为可等待的单次完成信号。 */
function createChatVoiceCompletion(
  state: ChatVoiceRecorderState,
  discard: boolean,
): Promise<ChatVoiceRecordingResult | null> {
  return new Promise((resolve, reject) => {
    state.completionReject = reject;
    state.recorder.onstop = () =>
      resolve(discard ? null : createChatVoiceRecordingResult(state));
    try {
      if (state.recorder.state === 'inactive') {
        reject(new Error('浏览器录音已停止'));
        return;
      }
      state.recorder.stop();
    } catch (cause) {
      reject(cause);
    }
  });
}

/** 从真实 chunk、格式和时钟构造 shared SDK 输入。 */
function createChatVoiceRecordingResult(
  state: ChatVoiceRecorderState,
): ChatVoiceRecordingResult {
  // mimeType 优先使用真实 chunk/recorder，再回退选择格式。
  const mimeType =
    state.chunks.find(chunk => chunk.type)?.type ||
    state.recorder.mimeType ||
    state.requestedMimeType ||
    'audio/webm';
  // extension 与真实 MIME 对齐，供 OSS credential 使用。
  const extension = chatVoiceExtensionFromMimeType(mimeType);
  // file 是唯一交给 shared SDK 的平台对象。
  const file = new File(
    state.chunks,
    `voice-${state.startedAt}.${extension}`,
    { type: mimeType },
  );
  // durationSeconds 对齐 RN 四舍五入和 60 秒上限。
  const durationSeconds = Math.min(
    60,
    Math.max(
      1,
      Math.round((state.dependencies.now() - state.startedAt) / 1000),
    ),
  );
  return { file, durationSeconds };
}

/** 创建只 resolve 一次的录音失败信号。 */
function createChatVoiceFailureDeferred(): ChatVoiceFailureDeferred {
  // resolveFailure 在 promise 构造后转交 recorder 事件。
  let resolveFailure: (error: Error) => void = () => undefined;
  // promise 只用于通知页面异步设备失败。
  const promise = new Promise<Error>(resolve => {
    resolveFailure = resolve;
  });
  return { promise, resolve: resolveFailure };
}

/** 创建调用标准 getUserMedia/MediaRecorder 的生产依赖。 */
function createDefaultChatVoiceRecorderDependencies(): ChatVoiceRecorderDependencies {
  return {
    getUserMedia: async () => {
      // mediaDevices 必须真实存在，缺失时不可退化为 fake recorder。
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
      // recorder 仅在此处把 DOM 回调签名收窄为可注入 platform contract。
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
function selectChatVoiceMimeType(
  dependencies: ChatVoiceRecorderDependencies,
): string {
  return (
    CHAT_VOICE_MIME_CANDIDATES.find(candidate =>
      dependencies.isTypeSupported(candidate),
    ) ?? ''
  );
}

/** 将录音 MIME 映射为 OSS 对象扩展名。 */
function chatVoiceExtensionFromMimeType(mimeType: string): string {
  // normalized 忽略 codecs 参数和大小写。
  const normalized = mimeType.toLowerCase().split(';')[0]?.trim();
  if (normalized === 'audio/mp4') return 'm4a';
  if (normalized === 'audio/ogg') return 'ogg';
  return 'webm';
}

/** 停止媒体流中的全部 track，且不让单个 cleanup 失败阻塞其余 track。 */
function stopChatVoiceStream(stream: ChatVoiceMediaStream): void {
  for (const track of stream.getTracks()) {
    try {
      track.stop();
    } catch {
      // 浏览器 track 释放是 best effort，终态仍由 recorder 结果决定。
    }
  }
}
