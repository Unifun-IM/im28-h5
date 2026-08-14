import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  createLiveKitCallMediaPort,
  createWebIMCallMediaSession,
  createWebIMIncomingCall,
  createWebIMOutgoingCall,
  type LiveKitCallMediaElements,
  type LiveKitCallMediaPort,
  type WebIMIncomingCallSession,
  type WebIMIncomingCallSnapshot,
  type WebIMOutgoingCall,
  type WebIMOutgoingCallSnapshot,
} from '@im28/im-sdk/web';
import { useLocation, useNavigate } from 'react-router-dom';

import callingToneURL from '../assets/rn/assets/audio/rtc-calling.mp3';
import hangupToneURL from '../assets/rn/assets/audio/rtc-hangup.mp3';
import {
  IncomingCallOverlay,
  type IncomingCallDisplayMode,
} from './IncomingCallOverlay.js';
import { useWebIMRuntime } from './WebIMRuntimeProvider.js';
import {
  createWebCallToneController,
  type WebCallToneController,
} from './web-call-tone.js';

/** H5 当前单次呼出需要展示的非敏感资料。 */
export interface WebIMActiveCallView {
  readonly conversationID: string;
  readonly peerName: string;
  readonly peerAvatarURL: string;
  readonly mediaType: 'audio' | 'video';
  readonly direction: 'incoming' | 'outgoing';
}

/** 从 RN 已有入口发起 Web 通话所需的展示参数。 */
export interface WebIMStartOutgoingCallOptions extends Omit<WebIMActiveCallView, 'direction'> {}

/** 活动通话页面消费的呼入或呼出无凭据媒体快照。 */
export type WebIMActiveCallSnapshot = WebIMOutgoingCallSnapshot | WebIMIncomingCallSnapshot;

/** Provider 持有的呼入/呼出共同媒体控制面。 */
type WebIMActiveCallOwner = WebIMOutgoingCall | WebIMIncomingCallSession;

/** 页面消费的全局 Web 通话上下文。 */
export interface WebIMCallContextValue {
  readonly activeCall: WebIMActiveCallView | null;
  readonly snapshot: WebIMActiveCallSnapshot | null;
  readonly error: string | null;
  startOutgoing(options: WebIMStartOutgoingCallOptions): Promise<void>;
  retryMedia(): Promise<void>;
  setMicrophoneEnabled(enabled: boolean): Promise<void>;
  setCameraEnabled(enabled: boolean): Promise<void>;
  resumeAudioPlayback(): Promise<void>;
  setMediaElements(elements: LiveKitCallMediaElements): void;
  end(): Promise<void>;
}

/** Context 缺省值只用于识别 Provider 漏装。 */
const WebIMCallContext = createContext<WebIMCallContextValue | null>(null);

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
  /** incomingMode 保存 RN 同语义来电展示形态。 */
  const [incomingMode, setIncomingMode] = useState<IncomingCallDisplayMode>('banner');
  /** incomingProfile 保存不含凭据的来电人资料。 */
  const [incomingProfile, setIncomingProfile] = useState({ name: '', avatarURL: '' });
  /** incomingError 只承载接听、拒绝或资料动作可见错误。 */
  const [incomingError, setIncomingError] = useState<string | null>(null);
  /** acceptingCallID 防止用户重复点击接听。 */
  const [acceptingCallID, setAcceptingCallID] = useState<string | null>(null);
  /** rejectingCallID 防止用户重复点击拒绝。 */
  const [rejectingCallID, setRejectingCallID] = useState<string | null>(null);
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

  /** 清除 UI 引用并异步释放唯一通话 owner。 */
  const disposeCurrent = useCallback(async (): Promise<void> => {
    /** owner 固定清理开始时的实例，防止覆盖新通话。 */
    const owner = callOwnerRef.current;
    callOwnerRef.current = null;
    mediaPortRef.current = null;
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    startVersionRef.current += 1;
    startingRef.current = false;
    setActiveCall(null);
    setCallSnapshot(null);
    if (owner) await owner.dispose();
  }, []);

  /** 从 shared control 完成真实信令和媒体启动后再进入 route-owned UI。 */
  const startOutgoing = useCallback(async (
    options: WebIMStartOutgoingCallOptions,
  ): Promise<void> => {
    if (!runtime || !runtimeSnapshot.userID) throw new Error('请先登录后再发起通话');
    if (runtimeSnapshot.incomingCall.call) throw new Error('当前有等待处理的来电');
    if (startingRef.current || callOwnerRef.current) throw new Error('当前已有通话');
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
        conversationID: options.conversationID,
        callType: options.mediaType,
      });
    } catch (cause) {
      await outgoing.dispose();
      mediaPortRef.current = null;
      throw cause;
    } finally {
      if (startVersionRef.current === startVersion) startingRef.current = false;
    }
    if (startVersionRef.current !== startVersion || !runtimeSnapshot.userID) {
      await outgoing.dispose();
      mediaPortRef.current = null;
      throw new Error('通话启动已取消');
    }
    callOwnerRef.current = outgoing;
    mediaPortRef.current = mediaPort;
    setActiveCall({ ...options, direction: 'outgoing' });
    setCallSnapshot(outgoing.getSnapshot());
    setError(null);
    unsubscribeRef.current = outgoing.subscribe(() => {
      setCallSnapshot(outgoing.getSnapshot());
    });
    navigate('/calls/active');
  }, [navigate, runtime, runtimeSnapshot.incomingCall.call, runtimeSnapshot.userID]);

  /** 结束按钮完成远端收敛后回到来源会话。 */
  const end = useCallback(async (): Promise<void> => {
    /** returnConversationID 在清理状态前固定。 */
    const returnConversationID = activeCall?.conversationID ?? '';
    setError(null);
    await disposeCurrent();
    navigate(returnConversationID
      ? `/conversations/${encodeURIComponent(returnConversationID)}`
      : '/calls', { replace: true });
  }, [activeCall?.conversationID, disposeCurrent, navigate]);

  /** 将媒体操作委托当前 SDK 呼入或呼出实例。 */
  const runActiveCall = useCallback(async (
    operation: (owner: WebIMActiveCallOwner) => Promise<void>,
  ): Promise<void> => {
    /** owner 缺失说明刷新/直达后没有内存凭据。 */
    const owner = callOwnerRef.current;
    startVersionRef.current += 1;
    startingRef.current = false;
    if (!owner) throw new Error('当前没有进行中的通话');
    try {
      setError(null);
      await operation(owner);
    } catch (cause) {
      setError(readWebCallError(cause));
    }
  }, []);

  /** 接听当前 SDK 验证来电，并在 Gateway 成功后进入共享活动通话页。 */
  const answerIncoming = useCallback(async (): Promise<void> => {
    /** incoming 固定用户点击时的来电身份。 */
    const incoming = runtimeSnapshot.incomingCall.call;
    if (!runtime || !runtimeSnapshot.userID || !incoming) return;
    if (startingRef.current || callOwnerRef.current || acceptingCallID || rejectingCallID) return;
    suppressTerminalToneRef.current = incoming.callID;
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
      toneRef.current?.stopCalling();
      setToneBlocked(false);
      runtime.dismissIncomingCall(incoming.callID);
      navigate('/calls/active');
    } catch (cause) {
      await incomingOwner.dispose();
      mediaPortRef.current = null;
      if (runtime.getSnapshot().incomingCall.call?.callID === incoming.callID) {
        suppressTerminalToneRef.current = null;
      }
      setIncomingError(readWebCallError(cause));
    } finally {
      if (startVersionRef.current === startVersion) startingRef.current = false;
      setAcceptingCallID(current => current === incoming.callID ? null : current);
    }
  }, [acceptingCallID, incomingProfile.avatarURL, incomingProfile.name, navigate, rejectingCallID, runtime, runtimeSnapshot.incomingCall.call, runtimeSnapshot.userID]);

  /** 拒绝当前来电，仅执行 shared reject 且不创建媒体会话。 */
  const rejectIncoming = useCallback(async (): Promise<void> => {
    /** incoming 固定用户点击时的来电身份。 */
    const incoming = runtimeSnapshot.incomingCall.call;
    if (!runtime || !incoming || acceptingCallID || rejectingCallID) return;
    suppressTerminalToneRef.current = incoming.callID;
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
      setToneBlocked(false);
      await toneRef.current?.playHangup();
    } catch (cause) {
      if (runtime.getSnapshot().incomingCall.call?.callID === incoming.callID) {
        suppressTerminalToneRef.current = null;
      }
      setIncomingError(readWebCallError(cause));
    } finally {
      await rejectOwner.dispose();
      setRejectingCallID(current => current === incoming.callID ? null : current);
    }
  }, [acceptingCallID, rejectingCallID, runtime, runtimeSnapshot.incomingCall.call]);

  /** 用户手势恢复被 autoplay policy 拦截的来电循环音。 */
  const resumeIncomingTone = useCallback(async (): Promise<void> => {
    /** resumed 直接反映浏览器是否接受本次用户手势播放。 */
    const resumed = await toneRef.current?.resumeCalling();
    setToneBlocked(resumed === false);
  }, []);

  /** 将 route DOM 媒体元素绑定到当前 LiveKit port。 */
  const setMediaElements = useCallback((elements: LiveKitCallMediaElements): void => {
    mediaPortRef.current?.setMediaElements(elements);
  }, []);

  useEffect(() => {
    if (runtimeSnapshot.userID) return;
    toneRef.current?.stopCalling();
    void disposeCurrent();
  }, [disposeCurrent, runtimeSnapshot.userID]);

  useEffect(() => {
    /** incoming 是 SDK 已验证且去重后的唯一来电。 */
    const incoming = runtimeSnapshot.incomingCall.call;
    if (!incoming || activeCall) {
      toneRef.current?.stopCalling();
      setToneBlocked(false);
      return;
    }
    /** expectedPath 只用于 RN 同语义初始全屏判断。 */
    const expectedPath = `/conversations/${encodeURIComponent(incoming.conversationID)}`;
    setIncomingMode(location.pathname === expectedPath ? 'fullscreen' : 'banner');
    setIncomingProfile({ name: incoming.callerID, avatarURL: '' });
    setIncomingError(null);
    /** active 防止旧来电资料覆盖后续来电。 */
    let active = true;
    void runtime?.getSync().peerProfile.get(incoming.callerID)
      .then(profile => {
        if (active) setIncomingProfile({ name: profile.displayName, avatarURL: profile.avatarURL });
      })
      .catch(() => undefined);
    void toneRef.current?.startCalling().then(played => {
      if (active) setToneBlocked(!played);
    });
    return () => {
      active = false;
      toneRef.current?.stopCalling();
    };
  }, [activeCall, location.pathname, runtime, runtimeSnapshot.incomingCall.call]);

  useEffect(() => {
    /** currentID 是本轮 runtime 可见来电。 */
    const currentID = runtimeSnapshot.incomingCall.call?.callID ?? null;
    /** previousID 是上一轮尚未结束的来电。 */
    const previousID = previousIncomingIDRef.current;
    previousIncomingIDRef.current = currentID;
    if (previousID && !currentID && !activeCall) {
      if (suppressTerminalToneRef.current === previousID) {
        suppressTerminalToneRef.current = null;
      } else {
        void toneRef.current?.playHangup();
      }
    }
  }, [activeCall, runtimeSnapshot.incomingCall.call?.callID]);

  useEffect(() => {
    /** handleVisibilityChange 在 tab 回到前台时恢复可能错过的来电。 */
    const handleVisibilityChange = (): void => {
      if (document.visibilityState !== 'visible' || !runtimeSnapshot.userID) return;
      void runtime?.refreshIncomingCall().catch(cause => setIncomingError(readWebCallError(cause)));
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [runtime, runtimeSnapshot.userID]);

  useEffect(() => {
    if (!runtime) return undefined;
    /** terminalKeys 只包含会终止当前媒体 owner 的远端状态。 */
    const terminalKeys = new Set([
      'rtc.call.reject',
      'rtc.call.cancel',
      'rtc.call.hangup',
      'rtc.call.ended',
      'rtc.call.missed',
      'rtc.call.failed',
    ]);
    return runtime.subscribeCallSignals(signals => {
      /** currentCallID 固定当前活动通话，不处理仅响铃来电。 */
      const currentCallID = callSnapshot?.callID;
      if (!currentCallID || !activeCall) return;
      /** terminal 必须同时匹配当前 call ID 和终态白名单。 */
      const terminal = signals.find(signal =>
        signal.callID === currentCallID && terminalKeys.has(signal.key));
      if (!terminal) return;
      /** owner 固定回调触发时的通话实例。 */
      const owner = callOwnerRef.current;
      if (!owner) return;
      /** returnConversationID 在异步清理前固定。 */
      const returnConversationID = activeCall.conversationID;
      void owner.handleRemoteTerminal()
        .then(() => toneRef.current?.playHangup())
        .then(() => disposeCurrent())
        .then(() => navigate(
          returnConversationID
            ? `/conversations/${encodeURIComponent(returnConversationID)}`
            : '/calls',
          { replace: true },
        ))
        .catch(cause => setError(readWebCallError(cause)));
    });
  }, [activeCall, callSnapshot?.callID, disposeCurrent, navigate, runtime]);

  useEffect(() => () => {
    /** owner 固定卸载时的实例，cleanup 不再写 React 状态。 */
    const owner = callOwnerRef.current;
    callOwnerRef.current = null;
    mediaPortRef.current = null;
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    toneRef.current?.dispose();
    void owner?.dispose();
  }, []);

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

  /** incoming 是渲染全局提示所需的当前 SDK 来电。 */
  const incoming = runtimeSnapshot.incomingCall.call;
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

/** 读取全局 Web 通话 owner。 */
export function useWebIMCall(): WebIMCallContextValue {
  /** context 缺失表示 App composition 错误。 */
  const context = useContext(WebIMCallContext);
  if (!context) throw new Error('useWebIMCall must be used inside WebIMCallProvider.');
  return context;
}

/** 将未知信令/媒体异常转换为不含凭据的可见文案。 */
function readWebCallError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '通话连接失败';
}
