import {
  useCallback,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react';
import {
  createLiveKitCallMediaPort,
  createWebIMCallMediaSession,
  createWebIMOutgoingCall,
  type LiveKitCallMediaPort,
  type WebIMOutgoingCall,
  type WebIMRuntime,
} from '@im28/im-sdk/web';
import type { NavigateFunction } from 'react-router-dom';

import type { WebIMActiveCallOwner } from './useWebIMCallRemoteTerminal.js';
import type {
  WebIMActiveCallSnapshot,
  WebIMActiveCallView,
  WebIMStartOutgoingCallOptions,
} from './WebIMCallContext.js';

/** 呼出启动 owner 所需的活动生命周期依赖。 */
interface WebIMOutgoingCallStartupOptions {
  readonly runtime: WebIMRuntime | null;
  readonly userID: string | null;
  readonly hasPendingIncomingCall: boolean;
  readonly callOwnerRef: RefObject<WebIMActiveCallOwner | null>;
  readonly startingRef: RefObject<boolean>;
  readonly startVersionRef: RefObject<number>;
  readonly mediaPortRef: RefObject<LiveKitCallMediaPort | null>;
  readonly unsubscribeRef: RefObject<(() => void) | null>;
  readonly setActiveCall: Dispatch<SetStateAction<WebIMActiveCallView | null>>;
  readonly setCallSnapshot: Dispatch<SetStateAction<WebIMActiveCallSnapshot | null>>;
  readonly setError: Dispatch<SetStateAction<string | null>>;
  readonly navigate: NavigateFunction;
}

/** 创建唯一 Web 呼出 owner，并在真实启动成功后提交活动页状态。 */
export function useWebIMOutgoingCallStartup(
  options: WebIMOutgoingCallStartupOptions,
): (call: WebIMStartOutgoingCallOptions) => Promise<void> {
  /** 依赖按字段固定，避免 Provider 对象字面量导致公开 callback 每次替换。 */
  const {
    runtime,
    userID,
    hasPendingIncomingCall,
    callOwnerRef,
    startingRef,
    startVersionRef,
    mediaPortRef,
    unsubscribeRef,
    setActiveCall,
    setCallSnapshot,
    setError,
    navigate,
  } = options;
  return useCallback(async (call): Promise<void> => {
    if (!runtime || !userID) throw new Error('请先登录后再发起通话');
    if (hasPendingIncomingCall) throw new Error('当前有等待处理的来电');
    if (startingRef.current || callOwnerRef.current) {
      throw new Error('当前已有通话');
    }
    startingRef.current = true;
    /** startVersion 固定本次用户动作，防止延迟模块串到退出后的账号。 */
    const startVersion = ++startVersionRef.current;
    /** mediaPort/outgoing 只在全部构造成功后写入全局 owner。 */
    let mediaPort: LiveKitCallMediaPort;
    /** outgoing 承接当前用户动作的唯一信令与媒体生命周期。 */
    let outgoing: WebIMOutgoingCall;
    try {
      mediaPort = createLiveKitCallMediaPort();
      /** mediaSession 继续持有跨引擎稳定媒体状态机。 */
      const mediaSession = createWebIMCallMediaSession(mediaPort);
      outgoing = createWebIMOutgoingCall({
        calls: runtime.getSync().calls,
        mediaSession,
      });
    } catch (cause) {
      if (startVersionRef.current === startVersion) startingRef.current = false;
      throw cause;
    }
    if (startVersionRef.current !== startVersion) {
      await outgoing.dispose();
      throw new Error('通话启动已取消');
    }
    try {
      await outgoing.start({
        conversationID: call.conversationID,
        callType: call.mediaType,
      });
    } catch (cause) {
      await outgoing.dispose();
      mediaPortRef.current = null;
      throw cause;
    } finally {
      if (startVersionRef.current === startVersion) startingRef.current = false;
    }
    if (startVersionRef.current !== startVersion || !userID) {
      await outgoing.dispose();
      mediaPortRef.current = null;
      throw new Error('通话启动已取消');
    }
    callOwnerRef.current = outgoing;
    mediaPortRef.current = mediaPort;
    setActiveCall({ ...call, direction: 'outgoing' });
    setCallSnapshot(outgoing.getSnapshot());
    setError(null);
    unsubscribeRef.current = outgoing.subscribe(() => {
      setCallSnapshot(outgoing.getSnapshot());
    });
    navigate('/calls/active');
  }, [callOwnerRef, hasPendingIncomingCall, mediaPortRef, navigate, runtime, setActiveCall, setCallSnapshot, setError, startingRef, startVersionRef, unsubscribeRef, userID]);
}
