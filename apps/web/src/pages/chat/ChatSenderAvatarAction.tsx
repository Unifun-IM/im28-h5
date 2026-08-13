import {
  useEffect,
  useRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';

import type { ChatGroupMemberProfileLocation } from './chat-group-message-view.js';

/** 群消息头像的点击资料与长按提及输入。 */
interface ChatSenderAvatarActionProps {
  readonly location: ChatGroupMemberProfileLocation;
  readonly displayName: string;
  readonly style: CSSProperties;
  readonly children: ReactNode;
  readonly onMention?: () => void;
}

/** 用 500ms/8px 门槛隔离头像点击导航与长按提及。 */
export function ChatSenderAvatarAction({
  location,
  displayName,
  style,
  children,
  onMention,
}: ChatSenderAvatarActionProps) {
  // holdTimerRef 保存当前头像唯一长按计时器。
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // pointerStartRef 用于滚动超过 RN 8px 门槛时取消长按。
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  // longPressedRef 阻止长按松手后继续执行资料导航。
  const longPressedRef = useRef(false);

  useEffect(() => () => clearAvatarHoldTimer(holdTimerRef), []);

  /** 启动可用成员头像的 RN 长按门槛。 */
  function handlePointerDown(event: ReactPointerEvent<HTMLAnchorElement>): void {
    if (event.button !== 0 || !onMention) return;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    longPressedRef.current = false;
    clearAvatarHoldTimer(holdTimerRef);
    holdTimerRef.current = setTimeout(() => {
      longPressedRef.current = true;
      pointerStartRef.current = null;
      onMention();
    }, 500);
  }

  /** 列表滚动超过门槛时取消提及动作。 */
  function handlePointerMove(event: ReactPointerEvent<HTMLAnchorElement>): void {
    /** start 是本次 pointer 序列的初始坐标。 */
    const start = pointerStartRef.current;
    if (!start) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) {
      clearAvatarHoldTimer(holdTimerRef);
      pointerStartRef.current = null;
    }
  }

  /** 结束未达到长按门槛的 pointer 序列。 */
  function handlePointerEnd(): void {
    clearAvatarHoldTimer(holdTimerRef);
    pointerStartRef.current = null;
  }

  /** 桌面右键复用长按提及语义且不打开浏览器菜单。 */
  function handleContextMenu(event: ReactMouseEvent<HTMLAnchorElement>): void {
    if (!onMention) return;
    event.preventDefault();
    longPressedRef.current = true;
    onMention();
  }

  return (
    <Link
      className="rn-chat-sender-avatar"
      style={style}
      to={location.pathname}
      state={location.state}
      aria-label={onMention
        ? `查看${displayName}的资料，长按提及`
        : `查看${displayName}的资料`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
      onContextMenu={handleContextMenu}
      onClick={event => {
        if (!longPressedRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        longPressedRef.current = false;
      }}
    >
      {children}
    </Link>
  );
}

/** 清理头像长按计时器并恢复空引用。 */
function clearAvatarHoldTimer(
  timerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>,
): void {
  if (timerRef.current !== null) clearTimeout(timerRef.current);
  timerRef.current = null;
}
