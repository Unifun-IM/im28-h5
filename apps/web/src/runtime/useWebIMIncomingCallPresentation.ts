import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { IMIncomingCall, WebIMRuntime } from '@im28/im-sdk/web';

import callingToneURL from '../assets/rn/assets/audio/rtc-calling.mp3';
import hangupToneURL from '../assets/rn/assets/audio/rtc-hangup.mp3';
import type { IncomingCallDisplayMode } from './IncomingCallOverlay.js';
import {
  createWebCallToneController,
  type WebCallToneController,
} from './web-call-tone.js';

/** 来电提示 owner 所需的只读运行参数。 */
export interface WebIMIncomingCallPresentationOptions {
  readonly runtime: WebIMRuntime | null;
  readonly userID: string | null;
  readonly incoming: IMIncomingCall | null;
  readonly hasActiveCall: boolean;
  readonly locationPathname: string;
  readonly readError: (cause: unknown) => string;
}

/** 来电提示层公开的资料、状态和铃声动作。 */
export interface WebIMIncomingCallPresentation {
  readonly mode: IncomingCallDisplayMode;
  readonly setMode: Dispatch<SetStateAction<IncomingCallDisplayMode>>;
  readonly profile: { readonly name: string; readonly avatarURL: string };
  readonly error: string | null;
  readonly setError: Dispatch<SetStateAction<string | null>>;
  readonly toneBlocked: boolean;
  suppressTerminalTone(callID: string): void;
  releaseTerminalToneSuppression(callID: string): void;
  clearToneBlocked(): void;
  stopCallingTone(): void;
  playHangupTone(): Promise<void>;
  resumeTone(): Promise<void>;
}

/** 独占来电资料恢复、展示形态和浏览器提示音生命周期。 */
export function useWebIMIncomingCallPresentation(
  options: WebIMIncomingCallPresentationOptions,
): WebIMIncomingCallPresentation {
  /** mode 保存与 RN 同语义的来电展示形态。 */
  const [mode, setMode] = useState<IncomingCallDisplayMode>('banner');
  /** profile 保存不含凭据的来电人资料。 */
  const [profile, setProfile] = useState({ name: '', avatarURL: '' });
  /** error 承载接听、拒绝或资料恢复的可见错误。 */
  const [error, setError] = useState<string | null>(null);
  /** toneBlocked 表示浏览器要求用户手势恢复来电音。 */
  const [toneBlocked, setToneBlocked] = useState(false);
  /** toneRef 持有全局唯一浏览器提示音 owner。 */
  const toneRef = useRef<WebCallToneController | null>(null);
  /** previousIncomingIDRef 用于识别远端结束来电。 */
  const previousIncomingIDRef = useRef<string | null>(null);
  /** suppressTerminalToneRef 避免本地接听或拒绝被当作远端结束。 */
  const suppressTerminalToneRef = useRef<string | null>(null);
  if (!toneRef.current) {
    toneRef.current = createWebCallToneController(callingToneURL, hangupToneURL);
  }

  /** 标记本地动作将消费指定来电的终态提示音。 */
  const suppressTerminalTone = useCallback((callID: string): void => {
    suppressTerminalToneRef.current = callID;
  }, []);

  /** 本地动作失败时恢复指定来电的远端终态提示。 */
  const releaseTerminalToneSuppression = useCallback((callID: string): void => {
    if (suppressTerminalToneRef.current === callID) {
      suppressTerminalToneRef.current = null;
    }
  }, []);

  /** 清除已经通过用户动作处理的自动播放阻塞。 */
  const clearToneBlocked = useCallback((): void => {
    setToneBlocked(false);
  }, []);

  /** 停止当前循环来电音。 */
  const stopCallingTone = useCallback((): void => {
    toneRef.current?.stopCalling();
  }, []);

  /** 播放一次挂断提示音。 */
  const playHangupTone = useCallback(async (): Promise<void> => {
    await toneRef.current?.playHangup();
  }, []);

  /** 用户手势恢复被 autoplay policy 拦截的来电循环音。 */
  const resumeTone = useCallback(async (): Promise<void> => {
    /** resumed 直接反映浏览器是否接受本次用户手势播放。 */
    const resumed = await toneRef.current?.resumeCalling();
    setToneBlocked(resumed === false);
  }, []);

  useEffect(() => {
    if (!options.incoming || options.hasActiveCall) {
      toneRef.current?.stopCalling();
      setToneBlocked(false);
      return;
    }
    /** expectedPath 只用于 RN 同语义初始全屏判断。 */
    const expectedPath = `/conversations/${encodeURIComponent(options.incoming.conversationID)}`;
    setMode(options.locationPathname === expectedPath ? 'fullscreen' : 'banner');
    setProfile({ name: options.incoming.callerID, avatarURL: '' });
    setError(null);
    /** active 防止旧来电资料覆盖后续来电。 */
    let active = true;
    void options.runtime?.getSync().peerProfile.get(options.incoming.callerID)
      .then(nextProfile => {
        if (active) {
          setProfile({ name: nextProfile.displayName, avatarURL: nextProfile.avatarURL });
        }
      })
      .catch(() => undefined);
    void toneRef.current?.startCalling().then(played => {
      if (active) setToneBlocked(!played);
    });
    return () => {
      active = false;
      toneRef.current?.stopCalling();
    };
  }, [
    options.hasActiveCall,
    options.incoming,
    options.locationPathname,
    options.runtime,
  ]);

  useEffect(() => {
    /** currentID 是本轮 runtime 可见来电。 */
    const currentID = options.incoming?.callID ?? null;
    /** previousID 是上一轮尚未结束的来电。 */
    const previousID = previousIncomingIDRef.current;
    previousIncomingIDRef.current = currentID;
    if (previousID && !currentID && !options.hasActiveCall) {
      if (suppressTerminalToneRef.current === previousID) {
        suppressTerminalToneRef.current = null;
      } else {
        void toneRef.current?.playHangup();
      }
    }
  }, [options.hasActiveCall, options.incoming?.callID]);

  useEffect(() => {
    /** handleVisibilityChange 在 tab 回到前台时恢复可能错过的来电。 */
    const handleVisibilityChange = (): void => {
      if (document.visibilityState !== 'visible' || !options.userID) return;
      void options.runtime?.refreshIncomingCall()
        .catch(cause => setError(options.readError(cause)));
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [options.readError, options.runtime, options.userID]);

  useEffect(() => () => {
    toneRef.current?.dispose();
  }, []);

  return {
    mode,
    setMode,
    profile,
    error,
    setError,
    toneBlocked,
    suppressTerminalTone,
    releaseTerminalToneSuppression,
    clearToneBlocked,
    stopCallingTone,
    playHangupTone,
    resumeTone,
  };
}
