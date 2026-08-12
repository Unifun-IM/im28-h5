import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Navigate } from 'react-router-dom';

import microphoneIconURL from '../../assets/rn/assets/icons/imm28/microphone.solid.svg';
import microphoneMuteIconURL from '../../assets/rn/assets/icons/imm28/microphone-mute.solid.svg';
import phoneOutIconURL from '../../assets/rn/assets/icons/imm28/phone-out.solid.svg';
import soundIconURL from '../../assets/rn/assets/icons/imm28/sound-high.solid.svg';
import videoIconURL from '../../assets/rn/assets/icons/imm28/video-camera.solid.svg';
import videoOffIconURL from '../../assets/rn/assets/icons/imm28/video-camera-off.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { useWebIMCall, useWebIMRuntime } from '../../runtime/index.js';
import './active-call-page.css';

/** Web LiveKit 媒体和 shared 通话控制的 route-owned 展示页。 */
export default function ActiveCallPage() {
  /** runtimeSnapshot 负责认证 deep-link guard。 */
  const { snapshot: runtimeSnapshot, restoring } = useWebIMRuntime();
  /** call 提供唯一内存通话 owner 和无凭据快照。 */
  const call = useWebIMCall();
  /** setMediaElements 是 Provider 暴露的稳定 DOM 绑定函数。 */
  const setMediaElements = call.setMediaElements;
  /** audioRef 承载 LiveKit 远端音频。 */
  const audioRef = useRef<HTMLAudioElement>(null);
  /** remoteVideoRef 承载远端摄像头。 */
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  /** localVideoRef 承载本地摄像头预览。 */
  const localVideoRef = useRef<HTMLVideoElement>(null);
  /** startedAt 只在远端成员首次进入后开始 UI 计时。 */
  const [startedAt, setStartedAt] = useState<number | null>(null);
  /** now 每秒刷新已接通时长，不参与媒体生命周期。 */
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setMediaElements({
      audioElement: audioRef.current,
      remoteVideoElement: remoteVideoRef.current,
      localVideoElement: localVideoRef.current,
    });
    return () => setMediaElements({
      audioElement: null,
      remoteVideoElement: null,
      localVideoElement: null,
    });
  }, [setMediaElements]);

  useEffect(() => {
    if (!startedAt && call.snapshot?.participantIDs.length) setStartedAt(Date.now());
  }, [call.snapshot?.participantIDs.length, startedAt]);

  useEffect(() => {
    if (!startedAt) return undefined;
    /** timer 仅刷新展示秒数，离开 route 立即释放。 */
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  if (restoring) return <main className="rn-active-call-state"><strong>正在恢复账号</strong></main>;
  if (!runtimeSnapshot.userID) return <Navigate to="/login" replace />;
  if (!call.activeCall || !call.snapshot) return <Navigate to="/calls" replace />;

  /** view 固定本次呼出的非敏感联系人资料。 */
  const view = call.activeCall;
  /** snapshot 不包含 LiveKit token。 */
  const snapshot = call.snapshot;
  /** connected 由真实远端成员进入房间证明。 */
  const connected = snapshot.participantIDs.length > 0;
  /** avatarStyle 复用 RN 稳定头像渐变。 */
  const avatarStyle = {
    '--active-call-avatar-gradient': getRNAvatarGradient(view.conversationID),
  } as CSSProperties;

  return (
    <main className={`rn-active-call-page${view.mediaType === 'video' ? ' is-video' : ''}`}>
      <audio ref={audioRef} autoPlay />
      <video ref={remoteVideoRef} className="rn-active-call-remote-video" autoPlay playsInline />
      <section className="rn-active-call-content" aria-busy={snapshot.state === 'connecting' || snapshot.ending}>
        <div className="rn-active-call-peer">
          <span className="rn-active-call-avatar" style={avatarStyle}>
            <span>{getRNAvatarInitial(view.peerName)}</span>
            {view.peerAvatarURL ? <img src={view.peerAvatarURL} alt="" /> : null}
          </span>
          <h1>{view.peerName}</h1>
          <p>{connected && startedAt ? formatCallDuration(now - startedAt) : getCallStateLabel(snapshot.state)}</p>
        </div>

        {call.error ? (
          <div className="rn-active-call-error" role="status">
            <span>{call.error}</span>
            <button type="button" onClick={() => void call.retryMedia()}>重试</button>
          </div>
        ) : null}
        {snapshot.audioPlaybackBlocked ? (
          <button className="rn-active-call-playback" type="button" onClick={() => void call.resumeAudioPlayback()}>
            <RNAssetIcon assetURL={soundIconURL} />
            <span>恢复声音</span>
          </button>
        ) : null}

        <div className="rn-active-call-controls">
          <CallControl
            label={snapshot.microphoneEnabled ? '静音' : '取消静音'}
            assetURL={snapshot.microphoneEnabled ? microphoneIconURL : microphoneMuteIconURL}
            active={!snapshot.microphoneEnabled}
            onClick={() => void call.setMicrophoneEnabled(!snapshot.microphoneEnabled)}
          />
          <button className="rn-active-call-end" type="button" aria-label="挂断" onClick={() => void call.end()}>
            <RNAssetIcon assetURL={phoneOutIconURL} />
          </button>
          {view.mediaType === 'video' ? (
            <CallControl
              label={snapshot.cameraEnabled ? '关闭摄像头' : '打开摄像头'}
              assetURL={snapshot.cameraEnabled ? videoIconURL : videoOffIconURL}
              active={!snapshot.cameraEnabled}
              onClick={() => void call.setCameraEnabled(!snapshot.cameraEnabled)}
            />
          ) : <span className="rn-active-call-control-placeholder" />}
        </div>

        <video ref={localVideoRef} className="rn-active-call-local-video" autoPlay muted playsInline />
      </section>
    </main>
  );
}

/** 渲染一个 RN 同语义圆形媒体控制。 */
function CallControl({
  label,
  assetURL,
  active,
  onClick,
}: {
  readonly label: string;
  readonly assetURL: string;
  readonly active: boolean;
  readonly onClick: () => void;
}) {
  return (
    <button className={`rn-active-call-control${active ? ' is-active' : ''}`} type="button" aria-label={label} onClick={onClick}>
      <RNAssetIcon assetURL={assetURL} />
      <span>{label}</span>
    </button>
  );
}

/** 映射媒体状态机为 RN 通话短状态。 */
function getCallStateLabel(state: string): string {
  if (state === 'connecting') return '正在连接...';
  if (state === 'reconnecting') return '正在重新连接...';
  if (state === 'connected') return '等待对方接听...';
  if (state === 'failed') return '连接失败';
  return '通话已结束';
}

/** 将已接通毫秒数格式化为 mm:ss 或 hh:mm:ss。 */
function formatCallDuration(durationMs: number): string {
  /** totalSeconds 拒绝负数并向下取整。 */
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  /** hours 只在超过一小时后展示。 */
  const hours = Math.floor(totalSeconds / 3600);
  /** minutes 保留小时内分钟。 */
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  /** seconds 始终补齐两位。 */
  const seconds = totalSeconds % 60;
  return hours
    ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
