import { useEffect, type RefObject } from 'react';
import type {
  WebIMIncomingCallSession,
  WebIMOutgoingCall,
  WebIMRuntime,
} from '@im28/im-sdk/web';
import type { NavigateFunction } from 'react-router-dom';

import type { WebIMActiveCallView } from './WebIMCallContext.js';

/** Provider 持有的呼入/呼出共同媒体控制面。 */
export type WebIMActiveCallOwner = WebIMOutgoingCall | WebIMIncomingCallSession;

/** 会终止当前活动媒体 owner 的远端信令白名单。 */
const TERMINAL_CALL_SIGNAL_KEYS: ReadonlySet<string> = new Set([
  'rtc.call.reject',
  'rtc.call.cancel',
  'rtc.call.hangup',
  'rtc.call.ended',
  'rtc.call.missed',
  'rtc.call.failed',
]);

/** 远端终态 Hook 所需的唯一活动通话依赖。 */
interface UseWebIMCallRemoteTerminalOptions {
  readonly runtime: WebIMRuntime | null;
  readonly activeCall: WebIMActiveCallView | null;
  readonly callID: string | null | undefined;
  readonly callOwnerRef: RefObject<WebIMActiveCallOwner | null>;
  readonly playHangupTone: () => Promise<void>;
  readonly disposeCurrent: () => Promise<void>;
  readonly navigate: NavigateFunction;
  readonly onError: (cause: unknown) => void;
}

/** 订阅当前活动通话的远端终态，并按原顺序释放媒体和返回会话。 */
export function useWebIMCallRemoteTerminal({
  runtime,
  activeCall,
  callID,
  callOwnerRef,
  playHangupTone,
  disposeCurrent,
  navigate,
  onError,
}: UseWebIMCallRemoteTerminalOptions): void {
  useEffect(() => {
    if (!runtime) return undefined;
    return runtime.subscribeCallSignals(signals => {
      if (!callID || !activeCall) return;
      /** terminal 必须同时匹配当前 call ID 和终态白名单。 */
      const terminal = signals.find(signal =>
        signal.callID === callID && TERMINAL_CALL_SIGNAL_KEYS.has(signal.key));
      if (!terminal) return;
      /** owner 固定回调触发时的通话实例。 */
      const owner = callOwnerRef.current;
      if (!owner) return;
      /** returnConversationID 在异步清理前固定。 */
      const returnConversationID = activeCall.conversationID;
      void owner.handleRemoteTerminal()
        .then(() => playHangupTone())
        .then(() => disposeCurrent())
        .then(() => navigate(
          returnConversationID
            ? `/conversations/${encodeURIComponent(returnConversationID)}`
            : '/calls',
          { replace: true },
        ))
        .catch(onError);
    });
  }, [activeCall, callID, callOwnerRef, disposeCurrent, navigate, onError, playHangupTone, runtime]);
}
