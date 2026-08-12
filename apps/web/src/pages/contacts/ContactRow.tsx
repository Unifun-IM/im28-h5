import { useRef, type CSSProperties, type MouseEvent, type PointerEvent } from 'react';
import type { WebIMContact } from '@im28/im-sdk/web';
import { Link } from 'react-router-dom';

import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';
import { buildContactProfileRoute } from './contact-profile-view.js';
import type { ContactActionPoint } from './contact-action-view.js';

/** RN 联系人行参数。 */
interface ContactRowProps {
  readonly contact: WebIMContact;
  readonly onOpenActions: (contact: WebIMContact, point: ContactActionPoint) => void;
}

/** 渲染 RN 56px 联系人行、40px 头像和单行显示名称。 */
export function ContactRow({ contact, onOpenActions }: ContactRowProps) {
  /** longPressTimerRef 保存 300ms RN 长按阈值定时器。 */
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** pointerStartRef 用于移动阈值取消长按。 */
  const pointerStartRef = useRef<ContactActionPoint | null>(null);
  /** didLongPressRef 阻止长按松手后继续进入资料页。 */
  const didLongPressRef = useRef(false);
  // avatarStyle 复用 RN 稳定头像渐变算法。
  const avatarStyle = {
    '--contact-avatar-gradient': getRNAvatarGradient(contact.userID),
  } as CSSProperties;

  /** clearLongPress 清理尚未触发的定时器。 */
  function clearLongPress(): void {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
    pointerStartRef.current = null;
  }

  /** handlePointerDown 启动与 RN 一致的 300ms 长按识别。 */
  function handlePointerDown(event: PointerEvent<HTMLAnchorElement>): void {
    if (event.button !== 0) return;
    clearLongPress();
    didLongPressRef.current = false;
    /** point 固定按下位置，避免延迟期间 React 事件失效。 */
    const point = { x: event.clientX, y: event.clientY };
    pointerStartRef.current = point;
    longPressTimerRef.current = setTimeout(() => {
      didLongPressRef.current = true;
      longPressTimerRef.current = null;
      onOpenActions(contact, point);
    }, 300);
  }

  /** handlePointerMove 超过八像素时视为列表滚动。 */
  function handlePointerMove(event: PointerEvent<HTMLAnchorElement>): void {
    /** start 缺失表示当前没有待识别长按。 */
    const start = pointerStartRef.current;
    if (!start) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) clearLongPress();
  }

  /** handleClick 消费长按后的浏览器合成点击。 */
  function handleClick(event: MouseEvent<HTMLAnchorElement>): void {
    if (!didLongPressRef.current) return;
    event.preventDefault();
    didLongPressRef.current = false;
  }

  return (
    <Link
      className="rn-contact-row"
      to={buildContactProfileRoute(contact.userID)}
      aria-haspopup="menu"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={clearLongPress}
      onPointerCancel={clearLongPress}
      onPointerLeave={clearLongPress}
      onClick={handleClick}
      onContextMenu={event => {
        event.preventDefault();
        clearLongPress();
        onOpenActions(contact, { x: event.clientX, y: event.clientY });
      }}
      onDragStart={event => event.preventDefault()}
    >
      <span className="rn-contact-avatar" style={avatarStyle}>
        <span>{getRNAvatarInitial(contact.displayName)}</span>
        {contact.avatarURL ? (
          <img
            src={contact.avatarURL}
            alt=""
            loading="lazy"
            onError={event => {
              event.currentTarget.hidden = true;
            }}
          />
        ) : null}
      </span>
      <span className="rn-contact-row-content">
        <strong>{contact.displayName}</strong>
      </span>
    </Link>
  );
}
