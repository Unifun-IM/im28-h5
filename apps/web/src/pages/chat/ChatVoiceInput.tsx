import { useRef, useState, type PointerEvent, type ReactNode } from 'react';

import keyboardIconURL from '../../assets/rn/assets/icons/imm28/keyboard.svg';
import microphoneIconURL from '../../assets/rn/assets/icons/imm28/microphone.solid.svg';
import voiceIconURL from '../../assets/rn/assets/icons/imm28/voice.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { shouldCancelChatVoiceGesture } from './chat-voice-contract.js';
import type { ChatVoiceRecordingStatus } from './useChatVoiceRecorder.js';
import './chat-voice-input.css';

/** RN voice/text mode 和 pointer 录音手势的展示参数。 */
interface ChatVoiceInputProps {
  readonly children: ReactNode;
  readonly voiceMode: boolean;
  readonly disabled: boolean;
  readonly status: ChatVoiceRecordingStatus;
  readonly seconds: number;
  readonly onToggleMode: () => void;
  readonly onStart: () => void | Promise<void>;
  readonly onSend: () => void | Promise<void>;
  readonly onCancel: () => void | Promise<void>;
}

/** 呈现 RN voice/keyboard 切换、hold 进度和上滑取消 HUD。 */
export function ChatVoiceInput({
  children,
  voiceMode,
  disabled,
  status,
  seconds,
  onToggleMode,
  onStart,
  onSend,
  onCancel,
}: ChatVoiceInputProps) {
  // startYRef 记录当前 pointer hold 的屏幕纵坐标。
  const startYRef = useRef<number | null>(null);
  // canceling 驱动 RN 松开取消样式和终态选择。
  const [canceling, setCanceling] = useState(false);
  // cancelingRef 保证同一 pointer 事件批次读取最新取消态。
  const cancelingRef = useRef(false);
  // recording 标记 permission-await 和真实录音期间的 pointer owner。
  const recording = status === 'starting' || status === 'recording';
  // holdDisabled 阻止发送期间重复启动麦克风。
  const holdDisabled = disabled || status === 'sending';
  // progress 复用 RN 60 秒线性进度。
  const progress = Math.max(
    0,
    Math.min(100, Math.round(((seconds || 1) / 60) * 100)),
  );
  // holdLabel 与 RN starting/sending/cancel 文案一致。
  const holdLabel = canceling
    ? '松开 取消'
    : status === 'starting'
      ? '准备中...'
      : status === 'sending'
        ? '发送中...'
        : '按住说话';

  /** pointer down 取得捕获并启动唯一 recorder session。 */
  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (holdDisabled || status !== 'idle') return;
    startYRef.current = event.clientY;
    cancelingRef.current = false;
    setCanceling(false);
    event.currentTarget.setPointerCapture(event.pointerId);
    void onStart();
  }

  /** pointer move 只根据 RN 56px 门槛更新取消态。 */
  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    // startY 固定当前 hold，忽略 hover move。
    const startY = startYRef.current;
    if (startY === null) return;
    // nextCanceling 同步写 ref，避免 move/up 同批次读到旧 React state。
    const nextCanceling = shouldCancelChatVoiceGesture(startY, event.clientY);
    cancelingRef.current = nextCanceling;
    setCanceling(nextCanceling);
  }

  /** release 根据最后取消态发送或丢弃录音。 */
  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (startYRef.current === null) return;
    startYRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    // shouldCancel 固定 setState 前的当前终态。
    const shouldCancel = cancelingRef.current;
    cancelingRef.current = false;
    setCanceling(false);
    void (shouldCancel ? onCancel() : onSend());
  }

  /** pointer cancel/浏览器接管手势时强制丢弃录音。 */
  function handlePointerCancel(event: PointerEvent<HTMLButtonElement>) {
    if (startYRef.current === null) return;
    startYRef.current = null;
    cancelingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setCanceling(false);
    void onCancel();
  }

  return (
    <>
      <button
        className="rn-chat-composer-icon-button"
        type="button"
        aria-label="语音消息"
        aria-pressed={voiceMode}
        disabled={disabled || status !== 'idle'}
        onClick={onToggleMode}
      >
        <RNAssetIcon assetURL={voiceMode ? keyboardIconURL : voiceIconURL} />
      </button>
      {voiceMode ? (
        <button
          className={`rn-chat-voice-hold${canceling ? ' is-canceling' : ''}`}
          type="button"
          aria-label={holdLabel}
          disabled={holdDisabled}
          onContextMenu={event => event.preventDefault()}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          {status === 'recording' && !canceling ? (
            <span
              className="rn-chat-voice-progress"
              style={{ width: `${progress}%` }}
            />
          ) : null}
          <span>{holdLabel}</span>
        </button>
      ) : (
        children
      )}
      {recording ? (
        <div
          className={`rn-chat-voice-overlay${status === 'recording' ? ' is-recording' : ''}${canceling ? ' is-canceling' : ''}`}
          aria-label="语音录制音量"
        >
          <div className="rn-chat-voice-overlay-panel">
            <span className="rn-chat-voice-mic-badge">
              <RNAssetIcon assetURL={microphoneIconURL} />
            </span>
            <span className="rn-chat-voice-signal" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
            <strong>{canceling ? '松开取消' : '上滑取消'}</strong>
          </div>
        </div>
      ) : null}
    </>
  );
}
