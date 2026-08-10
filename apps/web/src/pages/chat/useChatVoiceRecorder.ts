import { useCallback, useEffect, useRef, useState } from 'react';

import {
  CHAT_VOICE_MAX_DURATION_MS,
  isChatVoiceRecordingTooShort,
} from './chat-voice-contract.js';
import {
  startChatVoiceRecording,
  type ChatVoiceRecordingSession,
} from './chat-voice-recorder.js';

/** Composer 可见的语音录制状态。 */
export type ChatVoiceRecordingStatus =
  | 'idle'
  | 'starting'
  | 'recording'
  | 'sending';

/** 页面注入真实 audio send 和可见错误 owner。 */
interface UseChatVoiceRecorderOptions {
  readonly disabled: boolean;
  readonly onSend: (file: File, durationSeconds: number) => Promise<void>;
  readonly onError: (message: string) => void;
}

/** permission-await 期间暂存松手意图，避免启动完成后遗留录音。 */
type PendingVoiceAction = 'send' | 'cancel' | null;

/** 管理一次浏览器录音的开始、取消、时长和发送终态。 */
export function useChatVoiceRecorder({
  disabled,
  onSend,
  onError,
}: UseChatVoiceRecorderOptions) {
  // status 驱动 RN composer 的可见状态。
  const [status, setStatus] = useState<ChatVoiceRecordingStatus>('idle');
  // seconds 只用于 60 秒进度展示，不作为 Gateway 真相。
  const [seconds, setSeconds] = useState(0);
  // sessionRef 持有唯一短期 recorder session。
  const sessionRef = useRef<ChatVoiceRecordingSession | null>(null);
  // startingRef 覆盖等待权限期间尚无 session 的状态。
  const startingRef = useRef(false);
  // pendingActionRef 保存权限弹窗期间发生的 release/cancel。
  const pendingActionRef = useRef<PendingVoiceAction>(null);
  // tickRef 刷新 RN 秒数和进度。
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // autoStopRef 固定 60 秒自动发送。
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // disposedRef 阻止路由退出后的异步权限结果写回 React。
  const disposedRef = useRef(false);

  /** 清除录音期间的全部页面 timer。 */
  const clearTimers = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (autoStopRef.current) clearTimeout(autoStopRef.current);
    tickRef.current = null;
    autoStopRef.current = null;
  }, []);

  /** 恢复空闲 UI，不修改已由 session 处理的媒体流。 */
  const resetState = useCallback(() => {
    clearTimers();
    sessionRef.current = null;
    startingRef.current = false;
    pendingActionRef.current = null;
    if (!disposedRef.current) {
      setSeconds(0);
      setStatus('idle');
    }
  }, [clearTimers]);

  /** 按 release/cancel 意图终结当前录音。 */
  const finishRecording = useCallback(
    async (action: Exclude<PendingVoiceAction, null>) => {
      if (startingRef.current && !sessionRef.current) {
        pendingActionRef.current = action;
        return;
      }
      // session 固定本轮终结目标，随后立即从 ref 移除避免双击。
      const session = sessionRef.current;
      if (!session) return;
      sessionRef.current = null;
      clearTimers();
      if (action === 'cancel') {
        try {
          await session.cancel();
        } finally {
          resetState();
        }
        return;
      }
      if (isChatVoiceRecordingTooShort(session.startedAt, Date.now())) {
        try {
          await session.cancel();
        } finally {
          resetState();
        }
        onError('录音时间太短');
        return;
      }
      if (!disposedRef.current) setStatus('sending');
      try {
        // result 来自已停止 recorder 的真实 File 和稳定秒数。
        const result = await session.stop();
        await onSend(result.file, result.durationSeconds);
      } catch (cause) {
        onError(readChatVoiceError(cause));
      } finally {
        resetState();
      }
    },
    [clearTimers, onError, onSend, resetState],
  );

  /** 在用户 pointer hold 内请求麦克风并启动 recorder。 */
  const start = useCallback(async () => {
    if (disabled || startingRef.current || sessionRef.current) return;
    startingRef.current = true;
    pendingActionRef.current = null;
    setSeconds(0);
    setStatus('starting');
    try {
      // session 只有标准浏览器能力成功后才存在。
      const session = await startChatVoiceRecording();
      startingRef.current = false;
      if (disposedRef.current) {
        await session.cancel();
        return;
      }
      sessionRef.current = session;
      void session.failure.then(cause => {
        // 已进入 finish 或被替换的 session 由对应终态自行处理。
        if (sessionRef.current !== session) return;
        resetState();
        if (!disposedRef.current) onError(readChatVoiceError(cause));
      });
      // pendingAction 捕获权限弹窗期间已发生的松手动作。
      const pendingAction = pendingActionRef.current;
      pendingActionRef.current = null;
      if (pendingAction) {
        await finishRecording(pendingAction);
        return;
      }
      setSeconds(1);
      setStatus('recording');
      tickRef.current = setInterval(() => {
        // elapsed 只用于 RN 进度显示并限制在 60 秒。
        const elapsed = Date.now() - session.startedAt;
        setSeconds(Math.min(60, Math.max(1, Math.ceil(elapsed / 1000))));
      }, 120);
      autoStopRef.current = setTimeout(() => {
        void finishRecording('send');
      }, CHAT_VOICE_MAX_DURATION_MS);
    } catch (cause) {
      resetState();
      onError(readChatVoiceError(cause));
    }
  }, [disabled, finishRecording, onError, resetState]);

  useEffect(() => {
    disposedRef.current = false;
    return () => {
      disposedRef.current = true;
      pendingActionRef.current = 'cancel';
      clearTimers();
      // session 在 route unmount 时必须停止并丢弃 Blob。
      const session = sessionRef.current;
      sessionRef.current = null;
      if (session) void session.cancel();
    };
  }, [clearTimers]);

  return {
    status,
    seconds,
    start,
    send: () => finishRecording('send'),
    cancel: () => finishRecording('cancel'),
  };
}

/** 将浏览器录音异常转换为不泄漏设备细节的文案。 */
function readChatVoiceError(cause: unknown): string {
  return cause instanceof Error && cause.message
    ? cause.message
    : '语音录制失败';
}
