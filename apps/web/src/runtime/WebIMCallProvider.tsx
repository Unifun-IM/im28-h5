import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  createLiveKitCallMediaPort,
  createWebIMCallMediaSession,
  createWebIMIncomingCall,
  type LiveKitCallMediaPort,
} from '@im28/im-sdk/web';
import { useLocation, useNavigate } from 'react-router-dom';

import { IncomingCallOverlay } from './IncomingCallOverlay.js';
import { useWebIMActiveCallControls } from './useWebIMActiveCallControls.js';
import { useWebIMIncomingCallPresentation } from './useWebIMIncomingCallPresentation.js';
import { useWebIMOutgoingCallStartup } from './useWebIMOutgoingCallStartup.js';
import {
  useWebIMCallRemoteTerminal,
  type WebIMActiveCallOwner,
} from './useWebIMCallRemoteTerminal.js';
import {
  WebIMCallContext,
  type WebIMActiveCallSnapshot,
  type WebIMActiveCallView,
  type WebIMCallContextValue,
} from './WebIMCallContext.js';
import { useWebIMRuntime } from './WebIMRuntimeProvider.js';

/** 为所有 React Router 页面持有唯一 Web LiveKit 呼出生命周期。 */
export function WebIMCallProvider({ children }: PropsWithChildren) {
  /** navigate 只在明确用户发起或结束通话时切换 SPA route。 */
  const navigate = useNavigate();
  /** location 用于判断当前是否正在来电对应的聊天页。 */
  const location = useLocation();
  /** runtime 提供 shared call control，凭据不离开 SDK 编排。 */
  const { runtime, snapshot: runtimeSnapshot } = useWebIMRuntime();
  /** activeCall 保存不含 token 的页面资料。 */
  const [activeCall, setActiveCall] = useState<WebIMActiveCallView | null>(null);
  /** callSnapshot 镜像 SDK 的无凭据 external-store 状态。 */
  const [callSnapshot, setCallSnapshot] = useState<WebIMActiveCallSnapshot | null>(null);
  /** error 显示真实信令或媒体失败。 */
  const [error, setError] = useState<string | null>(null);
  /** callOwnerRef 持有当前单次呼入或呼出编排。 */
  const callOwnerRef = useRef<WebIMActiveCallOwner | null>(null);
  /** startingRef 阻止媒体 chunk 加载期间重复创建两次呼出。 */
  const startingRef = useRef(false);
  /** startVersionRef 让退出登录和卸载使延迟完成的动态加载失效。 */
  const startVersionRef = useRef(0);
  /** mediaPortRef 允许 active route 绑定三个 DOM 媒体节点。 */
  const mediaPortRef = useRef<LiveKitCallMediaPort | null>(null);
  /** unsubscribeRef 释放当前呼出快照订阅。 */
  const unsubscribeRef = useRef<(() => void) | null>(null);
  /** acceptingCallID 防止用户重复点击接听。 */
  const [acceptingCallID, setAcceptingCallID] = useState<string | null>(null);
  /** rejectingCallID 防止用户重复点击拒绝。 */
  const [rejectingCallID, setRejectingCallID] = useState<string | null>(null);
  /** incoming 是 SDK 已验证且去重后的唯一来电。 */
  const incoming = runtimeSnapshot.incomingCall.call;
  /** 来电表现字段由唯一 hook owner 提供，Provider 只消费具体状态和动作。 */
  const {
    mode: incomingMode,
    setMode: setIncomingMode,
    profile: incomingProfile,
    error: incomingError,
    setError: setIncomingError,
    toneBlocked,
    suppressTerminalTone,
    releaseTerminalToneSuppression,
    clearToneBlocked,
    stopCallingTone,
    playHangupTone,
    resumeTone: resumeIncomingTone,
  } = useWebIMIncomingCallPresentation({
    runtime,
    userID: runtimeSnapshot.userID,
    incoming,
    hasActiveCall: Boolean(activeCall),
    locationPathname: location.pathname,
    readError: readWebCallError,
  });

  /** 活动控制 Hook 独占清理、媒体操作、结束返回和卸载释放。 */
  const {
    disposeCurrent,
    end,
    runActiveCall,
    setMediaElements,
  } = useWebIMActiveCallControls({
    activeCall,
    userID: runtimeSnapshot.userID,
    callOwnerRef,
    startingRef,
    startVersionRef,
    mediaPortRef,
    unsubscribeRef,
    setActiveCall,
    setCallSnapshot,
    setError,
    stopCallingTone,
    readError: readWebCallError,
    navigate,
  });

  /** startOutgoing 委托唯一 Hook 保持真实启动成功后再提交页面状态。 */
  const startOutgoing = useWebIMOutgoingCallStartup({
    runtime,
    userID: runtimeSnapshot.userID,
    hasPendingIncomingCall: Boolean(runtimeSnapshot.incomingCall.call),
    callOwnerRef,
    startingRef,
    startVersionRef,
    mediaPortRef,
    unsubscribeRef,
    setActiveCall,
    setCallSnapshot,
    setError,
    navigate,
  });

  /** 接听当前 SDK 验证来电，并在 Gateway 成功后进入共享活动通话页。 */
  const answerIncoming = useCallback(async (): Promise<void> => {
    /** incoming 固定用户点击时的来电身份。 */
    const incoming = runtimeSnapshot.incomingCall.call;
    if (!runtime || !runtimeSnapshot.userID || !incoming) return;
    if (startingRef.current || callOwnerRef.current || acceptingCallID || rejectingCallID) return;
    suppressTerminalTone(incoming.callID);
    setAcceptingCallID(incoming.callID);
    setIncomingError(null);
    startingRef.current = true;
    /** startVersion 防止退出登录后接听异步结果串回。 */
    const startVersion = ++startVersionRef.current;
    /** incomingOwner 在 answer 确认前不进入全局 active owner。 */
    const incomingOwner = createWebIMIncomingCall({
      calls: runtime.getSync().calls,
      call: incoming,
      createMediaSession: () => {
        /** mediaPort 仅在 Gateway answer 成功后由 SDK 调用此工厂。 */
        const mediaPort = createLiveKitCallMediaPort();
        mediaPortRef.current = mediaPort;
        return createWebIMCallMediaSession(mediaPort);
      },
    });
    try {
      await incomingOwner.answer();
      if (startVersionRef.current !== startVersion || !runtimeSnapshot.userID) {
        await incomingOwner.dispose();
        return;
      }
      callOwnerRef.current = incomingOwner;
      setActiveCall({
        conversationID: incoming.conversationID,
        peerName: incomingProfile.name || incoming.callerID,
        peerAvatarURL: incomingProfile.avatarURL,
        mediaType: incoming.callType,
        direction: 'incoming',
      });
      /** initialSnapshot 捕获订阅建立前发生的媒体失败。 */
      const initialSnapshot = incomingOwner.getSnapshot();
      setCallSnapshot(initialSnapshot);
      if (initialSnapshot.error) setError(readWebCallError(initialSnapshot.error));
      unsubscribeRef.current = incomingOwner.subscribe(() => {
        /** nextSnapshot 仅公开媒体状态，不包含 LiveKit token。 */
        const nextSnapshot = incomingOwner.getSnapshot();
        setCallSnapshot(nextSnapshot);
        if (nextSnapshot.error) setError(readWebCallError(nextSnapshot.error));
      });
      stopCallingTone();
      clearToneBlocked();
      runtime.dismissIncomingCall(incoming.callID);
      navigate('/calls/active');
    } catch (cause) {
      await incomingOwner.dispose();
      mediaPortRef.current = null;
      if (runtime.getSnapshot().incomingCall.call?.callID === incoming.callID) {
        releaseTerminalToneSuppression(incoming.callID);
      }
      setIncomingError(readWebCallError(cause));
    } finally {
      if (startVersionRef.current === startVersion) startingRef.current = false;
      setAcceptingCallID(current => current === incoming.callID ? null : current);
    }
  }, [acceptingCallID, clearToneBlocked, incomingProfile.avatarURL, incomingProfile.name, navigate, rejectingCallID, releaseTerminalToneSuppression, runtime, runtimeSnapshot.incomingCall.call, runtimeSnapshot.userID, setIncomingError, stopCallingTone, suppressTerminalTone]);

  /** 拒绝当前来电，仅执行 shared reject 且不创建媒体会话。 */
  const rejectIncoming = useCallback(async (): Promise<void> => {
    /** incoming 固定用户点击时的来电身份。 */
    const incoming = runtimeSnapshot.incomingCall.call;
    if (!runtime || !incoming || acceptingCallID || rejectingCallID) return;
    suppressTerminalTone(incoming.callID);
    setRejectingCallID(incoming.callID);
    setIncomingError(null);
    /** rejectOwner 复用 SDK 编排但其媒体工厂在拒绝链永不执行。 */
    const rejectOwner = createWebIMIncomingCall({
      calls: runtime.getSync().calls,
      call: incoming,
      createMediaSession: () => {
        throw new Error('拒绝来电不得创建媒体会话');
      },
    });
    try {
      await rejectOwner.reject();
      runtime.dismissIncomingCall(incoming.callID);
      clearToneBlocked();
      await playHangupTone();
    } catch (cause) {
      if (runtime.getSnapshot().incomingCall.call?.callID === incoming.callID) {
        releaseTerminalToneSuppression(incoming.callID);
      }
      setIncomingError(readWebCallError(cause));
    } finally {
      await rejectOwner.dispose();
      setRejectingCallID(current => current === incoming.callID ? null : current);
    }
  }, [acceptingCallID, clearToneBlocked, playHangupTone, rejectingCallID, releaseTerminalToneSuppression, runtime, runtimeSnapshot.incomingCall.call, setIncomingError, suppressTerminalTone]);

  /** handleRemoteTerminalError 保持远端终态失败的既有可见错误语义。 */
  const handleRemoteTerminalError = useCallback((cause: unknown): void => {
    setError(readWebCallError(cause));
  }, []);

  useWebIMCallRemoteTerminal({
    runtime,
    activeCall,
    callID: callSnapshot?.callID,
    callOwnerRef,
    playHangupTone,
    disposeCurrent,
    navigate,
    onError: handleRemoteTerminalError,
  });

  /** value 只在公开状态或稳定操作变化时替换。 */
  const value = useMemo<WebIMCallContextValue>(() => ({
    activeCall,
    snapshot: callSnapshot,
    error,
    startOutgoing,
    retryMedia: () => runActiveCall(owner => owner.retryMedia()),
    setMicrophoneEnabled: enabled =>
      runActiveCall(owner => owner.setMicrophoneEnabled(enabled)),
    setCameraEnabled: enabled =>
      runActiveCall(owner => owner.setCameraEnabled(enabled)),
    resumeAudioPlayback: () =>
      runActiveCall(owner => owner.resumeAudioPlayback()),
    setMediaElements,
    end,
  }), [activeCall, callSnapshot, end, error, runActiveCall, setMediaElements, startOutgoing]);

  return (
    <WebIMCallContext.Provider value={value}>
      {children}
      <IncomingCallOverlay
        visible={Boolean(incoming && !activeCall)}
        peerName={incomingProfile.name || incoming?.callerID || ''}
        peerAvatarURL={incomingProfile.avatarURL}
        mediaType={incoming?.callType ?? 'audio'}
        displayMode={incomingMode}
        accepting={Boolean(incoming && acceptingCallID === incoming.callID)}
        rejecting={Boolean(incoming && rejectingCallID === incoming.callID)}
        toneBlocked={toneBlocked}
        error={incomingError}
        onAccept={() => void answerIncoming()}
        onReject={() => void rejectIncoming()}
        onIgnore={() => setIncomingMode('floating')}
        onOpen={() => setIncomingMode('fullscreen')}
        onResumeTone={() => void resumeIncomingTone()}
      />
    </WebIMCallContext.Provider>
  );
}

/** 将未知信令/媒体异常转换为不含凭据的可见文案。 */
function readWebCallError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '通话连接失败';
}
