import {
  useCallback,
  useEffect,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react';
import type {
  LiveKitCallMediaElements,
  LiveKitCallMediaPort,
} from '@im28/im-sdk/web';
import type { NavigateFunction } from 'react-router-dom';

import type { WebIMActiveCallOwner } from './useWebIMCallRemoteTerminal.js';
import type {
  WebIMActiveCallSnapshot,
  WebIMActiveCallView,
} from './WebIMCallContext.js';

/** 活动通话 SDK owner 上执行的单次媒体操作。 */
type WebIMActiveCallOperation = (owner: WebIMActiveCallOwner) => Promise<void>;

/** 活动通话控制 Hook 所需的唯一 Provider 依赖。 */
interface WebIMActiveCallControlsOptions {
  readonly activeCall: WebIMActiveCallView | null;
  readonly userID: string | null;
  readonly callOwnerRef: RefObject<WebIMActiveCallOwner | null>;
  readonly startingRef: RefObject<boolean>;
  readonly startVersionRef: RefObject<number>;
  readonly mediaPortRef: RefObject<LiveKitCallMediaPort | null>;
  readonly unsubscribeRef: RefObject<(() => void) | null>;
  readonly setActiveCall: Dispatch<SetStateAction<WebIMActiveCallView | null>>;
  readonly setCallSnapshot: Dispatch<SetStateAction<WebIMActiveCallSnapshot | null>>;
  readonly setError: Dispatch<SetStateAction<string | null>>;
  readonly stopCallingTone: () => void;
  readonly readError: (cause: unknown) => string;
  readonly navigate: NavigateFunction;
}

/** Provider 消费的稳定活动通话控制面。 */
interface WebIMActiveCallControls {
  readonly disposeCurrent: () => Promise<void>;
  readonly end: () => Promise<void>;
  readonly runActiveCall: (operation: WebIMActiveCallOperation) => Promise<void>;
  readonly setMediaElements: (elements: LiveKitCallMediaElements) => void;
}

/** 独占活动通话清理、媒体操作、结束返回和生命周期释放。 */
export function useWebIMActiveCallControls(
  options: WebIMActiveCallControlsOptions,
): WebIMActiveCallControls {
  /** disposeCurrent 先隔离全局引用，再清状态并释放旧 SDK owner。 */
  const disposeCurrent = useCallback(async (): Promise<void> => {
    /** owner 固定清理开始时的实例，防止覆盖新通话。 */
    const owner = options.callOwnerRef.current;
    options.callOwnerRef.current = null;
    options.mediaPortRef.current = null;
    options.unsubscribeRef.current?.();
    options.unsubscribeRef.current = null;
    options.startVersionRef.current += 1;
    options.startingRef.current = false;
    options.setActiveCall(null);
    options.setCallSnapshot(null);
    if (owner) await owner.dispose();
  }, [options.callOwnerRef, options.mediaPortRef, options.setActiveCall, options.setCallSnapshot, options.startingRef, options.startVersionRef, options.unsubscribeRef]);

  /** end 在清理状态前固定来源会话并使用 replace 返回。 */
  const end = useCallback(async (): Promise<void> => {
    /** returnConversationID 在清理状态前固定。 */
    const returnConversationID = options.activeCall?.conversationID ?? '';
    options.setError(null);
    await disposeCurrent();
    options.navigate(returnConversationID
      ? `/conversations/${encodeURIComponent(returnConversationID)}`
      : '/calls', { replace: true });
  }, [disposeCurrent, options.activeCall?.conversationID, options.navigate, options.setError]);

  /** runActiveCall 将媒体操作委托当前 SDK owner 并统一错误呈现。 */
  const runActiveCall = useCallback(async (
    operation: WebIMActiveCallOperation,
  ): Promise<void> => {
    /** owner 缺失说明刷新或直达后没有内存凭据。 */
    const owner = options.callOwnerRef.current;
    options.startVersionRef.current += 1;
    options.startingRef.current = false;
    if (!owner) throw new Error('当前没有进行中的通话');
    try {
      options.setError(null);
      await operation(owner);
    } catch (cause) {
      options.setError(options.readError(cause));
    }
  }, [options.callOwnerRef, options.readError, options.setError, options.startingRef, options.startVersionRef]);

  /** setMediaElements 将 route DOM 媒体节点绑定到当前 LiveKit port。 */
  const setMediaElements = useCallback((elements: LiveKitCallMediaElements): void => {
    options.mediaPortRef.current?.setMediaElements(elements);
  }, [options.mediaPortRef]);

  useEffect(() => {
    if (options.userID) return;
    options.stopCallingTone();
    void disposeCurrent();
  }, [disposeCurrent, options.stopCallingTone, options.userID]);

  useEffect(() => () => {
    /** owner 固定卸载时的实例，cleanup 不再写 React 状态。 */
    const owner = options.callOwnerRef.current;
    options.callOwnerRef.current = null;
    options.mediaPortRef.current = null;
    options.unsubscribeRef.current?.();
    options.unsubscribeRef.current = null;
    void owner?.dispose();
  }, [options.callOwnerRef, options.mediaPortRef, options.unsubscribeRef]);

  return { disposeCurrent, end, runActiveCall, setMediaElements };
}
