import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';

import bellOffIconURL from '../assets/rn/assets/icons/imm28/bell-off.solid.svg';
import phoneOutIconURL from '../assets/rn/assets/icons/imm28/phone-out.solid.svg';
import phoneIconURL from '../assets/rn/assets/icons/imm28/phone.solid.svg';
import { RNAssetIcon } from '../components/RNAssetIcon.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../components/rn-avatar-view.js';
import './incoming-call-overlay.css';

/** H5 来电提示与 RN 对齐的三种展示形态。 */
export type IncomingCallDisplayMode = 'banner' | 'floating' | 'fullscreen';

/** 全局来电提示只接收非敏感展示数据和用户动作。 */
export interface IncomingCallOverlayProps {
  readonly visible: boolean;
  readonly peerName: string;
  readonly peerAvatarURL: string;
  readonly mediaType: 'audio' | 'video';
  readonly displayMode: IncomingCallDisplayMode;
  readonly accepting: boolean;
  readonly rejecting: boolean;
  readonly toneBlocked: boolean;
  readonly error: string | null;
  onAccept(): void;
  onReject(): void;
  onIgnore(): void;
  onOpen(): void;
  onResumeTone(): void;
}

/** 根据当前来电状态渲染横幅、全屏或可拖动悬浮入口。 */
export function IncomingCallOverlay(props: IncomingCallOverlayProps) {
  if (!props.visible) return null;
  if (props.displayMode === 'floating') {
    return <IncomingCallFloating onOpen={props.onOpen} />;
  }

  /** inviteText 与 RN 通话邀请文案保持一致。 */
  const inviteText = props.mediaType === 'video'
    ? '邀请你视频通话...'
    : '邀请你语音通话...';
  /** pending 禁止重复接听或拒绝。 */
  const pending = props.accepting || props.rejecting;

  if (props.displayMode === 'fullscreen') {
    return (
      <section className="rn-incoming-call-fullscreen" role="dialog" aria-modal="true" aria-label="来电通话">
        <header className="rn-incoming-call-fullscreen-header">
          <IgnoreButton onClick={props.onIgnore} />
          {props.toneBlocked ? <ResumeToneButton onClick={props.onResumeTone} /> : null}
        </header>
        <div className="rn-incoming-call-fullscreen-peer">
          <CallerAvatar name={props.peerName} avatarURL={props.peerAvatarURL} size="large" />
          <h1>{props.peerName || '对方'}</h1>
          {props.error ? <p className="rn-incoming-call-error" role="status">{props.error}</p> : null}
          <p className="rn-incoming-call-invite">{inviteText}</p>
        </div>
        <div className="rn-incoming-call-fullscreen-actions">
          <CallAction label="拒绝" assetURL={phoneOutIconURL} tone="reject" disabled={pending} onClick={props.onReject} />
          <CallAction label={props.accepting ? '接听中' : '接听'} assetURL={phoneIconURL} tone="accept" disabled={pending} onClick={props.onAccept} />
        </div>
      </section>
    );
  }

  return (
    <section className="rn-incoming-call-banner" role="dialog" aria-label="来电通话" onClick={props.onOpen}>
      <div className="rn-incoming-call-banner-profile">
        <CallerAvatar name={props.peerName} avatarURL={props.peerAvatarURL} size="small" />
        <span className="rn-incoming-call-banner-copy">
          <strong>{props.peerName || '对方'}</strong>
          <span>{props.error || inviteText}</span>
        </span>
      </div>
      <div className="rn-incoming-call-banner-actions" onClick={event => event.stopPropagation()}>
        <span className="rn-incoming-call-banner-left">
          <IgnoreButton onClick={props.onIgnore} />
          {props.toneBlocked ? <ResumeToneButton onClick={props.onResumeTone} /> : null}
        </span>
        <span className="rn-incoming-call-banner-icons">
          <IconAction label="拒绝通话" assetURL={phoneOutIconURL} tone="reject" disabled={pending} onClick={props.onReject} />
          <IconAction label="接听通话" assetURL={phoneIconURL} tone="accept" disabled={pending} onClick={props.onAccept} />
        </span>
      </div>
    </section>
  );
}

/** 渲染 RN 同语义头像并复用稳定渐变。 */
function CallerAvatar({ name, avatarURL, size }: {
  readonly name: string;
  readonly avatarURL: string;
  readonly size: 'small' | 'large';
}) {
  /** style 将已有头像渐变注入 CSS。 */
  const style = { '--incoming-call-avatar-gradient': getRNAvatarGradient(name) } as CSSProperties;
  return (
    <span className={`rn-incoming-call-avatar is-${size}`} style={style}>
      <span>{getRNAvatarInitial(name || '对方')}</span>
      {avatarURL ? <img src={avatarURL} alt="" /> : null}
    </span>
  );
}

/** 渲染忽略入口并阻止其触发横幅展开。 */
function IgnoreButton({ onClick }: { readonly onClick: () => void }) {
  return (
    <button className="rn-incoming-call-ignore" type="button" onClick={onClick}>
      <RNAssetIcon assetURL={bellOffIconURL} />
      <span>忽略</span>
    </button>
  );
}

/** 自动播放被拦截后提供明确用户手势恢复入口。 */
function ResumeToneButton({ onClick }: { readonly onClick: () => void }) {
  return <button className="rn-incoming-call-resume-tone" type="button" onClick={onClick}>恢复铃声</button>;
}

/** 渲染全屏通话圆形动作。 */
function CallAction({ label, assetURL, tone, disabled, onClick }: {
  readonly label: string;
  readonly assetURL: string;
  readonly tone: 'accept' | 'reject';
  readonly disabled: boolean;
  readonly onClick: () => void;
}) {
  return (
    <span className="rn-incoming-call-action-item">
      <button className={`rn-incoming-call-action is-${tone}`} type="button" aria-label={label} disabled={disabled} onClick={onClick}>
        <RNAssetIcon assetURL={assetURL} />
      </button>
      <span>{label}</span>
    </span>
  );
}

/** 渲染横幅紧凑图标动作。 */
function IconAction({ label, assetURL, tone, disabled, onClick }: {
  readonly label: string;
  readonly assetURL: string;
  readonly tone: 'accept' | 'reject';
  readonly disabled: boolean;
  readonly onClick: () => void;
}) {
  return (
    <button className={`rn-incoming-call-icon-action is-${tone}`} type="button" aria-label={label} disabled={disabled} onClick={onClick}>
      <RNAssetIcon assetURL={assetURL} />
    </button>
  );
}

/** 渲染可拖动并向左右边缘吸附的忽略后悬浮入口。 */
function IncomingCallFloating({ onOpen }: { readonly onOpen: () => void }) {
  /** position 保存 viewport 内当前悬浮位置。 */
  const [position, setPosition] = useState(() => getInitialFloatingPosition());
  /** dragRef 保存一次 pointer 手势的起点与是否移动。 */
  const dragRef = useRef({ pointerID: 0, startX: 0, startY: 0, originX: position.x, originY: position.y, moved: false });

  /** pointer down 捕获后续移动，避免手指滑出按钮丢失事件。 */
  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>): void => {
    dragRef.current = { pointerID: event.pointerId, startX: event.clientX, startY: event.clientY, originX: position.x, originY: position.y, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  /** pointer move 将悬浮入口限制在安全 viewport 内。 */
  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>): void => {
    if (dragRef.current.pointerID !== event.pointerId) return;
    /** dx 表示当前手势水平位移。 */
    const dx = event.clientX - dragRef.current.startX;
    /** dy 表示当前手势垂直位移。 */
    const dy = event.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragRef.current.moved = true;
    setPosition(clampFloatingPosition(dragRef.current.originX + dx, dragRef.current.originY + dy));
  };

  /** pointer up 区分点击展开与拖动吸附。 */
  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>): void => {
    if (dragRef.current.pointerID !== event.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (!dragRef.current.moved) onOpen();
    else setPosition(current => ({ ...current, x: current.x + 40 < window.innerWidth / 2 ? 16 : Math.max(16, window.innerWidth - 96) }));
    dragRef.current.pointerID = 0;
  };

  /** style 使用固定像素位置，动态内容不会改变布局。 */
  const style = { left: position.x, top: position.y };
  return (
    <button
      className="rn-incoming-call-floating"
      type="button"
      aria-label="等待接听通话"
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <RNAssetIcon assetURL={bellOffIconURL} />
      <span>等待接听</span>
    </button>
  );
}

/** 计算悬浮入口首次出现位置。 */
function getInitialFloatingPosition(): { x: number; y: number } {
  return clampFloatingPosition(window.innerWidth - 96, window.innerHeight / 3);
}

/** 将悬浮入口限制在安全区与底部导航之外。 */
function clampFloatingPosition(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.min(Math.max(16, window.innerWidth - 96), Math.max(16, x)),
    y: Math.min(Math.max(100, window.innerHeight - 180), Math.max(100, y)),
  };
}
