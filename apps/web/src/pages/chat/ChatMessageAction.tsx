import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

import type { ChatMessageActionAnchor } from './chat-message-action-layout.js';
import { captureChatActionAnchor } from './ChatActionModalSurface.js';
import { ChatMessageActionModal } from './ChatMessageActionModal.js';
import './chat-custom-emoji-message-action.css';

/** 普通消息动作统一承载引用及 type115 收藏入口。 */
interface ChatMessageActionProps {
  readonly children: ReactNode;
  readonly quoteDisabled: boolean;
  readonly addDisabled: boolean;
  readonly forwardDisabled: boolean;
  readonly editAllowed: boolean;
  readonly emojiID?: string;
  readonly onQuote: () => void;
  readonly onCopy: () => Promise<boolean>;
  readonly onAddCustomEmoji: (emojiID: string) => Promise<boolean>;
  readonly onForward: () => void;
  readonly onEdit: () => void;
  readonly onBeginMultiSelect: () => void;
  readonly onDelete: () => void;
}

/** 为消息提供 RN 长按和桌面右键动作菜单。 */
export function ChatMessageAction({
  children,
  quoteDisabled,
  addDisabled,
  forwardDisabled,
  editAllowed,
  emojiID = '',
  onQuote,
  onCopy,
  onAddCustomEmoji,
  onForward,
  onEdit,
  onBeginMultiSelect,
  onDelete,
}: ChatMessageActionProps) {
  // rootRef 用于冻结长按消息在视口内的真实位置。
  const rootRef = useRef<HTMLSpanElement>(null);
  // holdTimerRef 保存唯一 500ms 长按计时器。
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // pointerStartRef 用于滚动时按 RN 8px 门槛取消长按。
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  // longPressedRef 阻止长按松手后触发气泡原动作。
  const longPressedRef = useRef(false);
  // open 只控制菜单可见性，不隐式触发 mutation。
  const [open, setOpen] = useState(false);
  // anchor 冻结长按瞬间的消息矩形和收发方向。
  const [anchor, setAnchor] = useState<ChatMessageActionAnchor | null>(null);
  // copying 锁定同一消息的重复 clipboard 写入。
  const [copying, setCopying] = useState(false);
  // adding 锁定重复收藏请求。
  const [adding, setAdding] = useState(false);
  // added 只在 shared mutation 成功后成立。
  const [added, setAdded] = useState(false);

  useEffect(() => () => clearHoldTimer(holdTimerRef), []);

  /** 冻结消息位置并打开 RN 全屏动作层。 */
  function openActionModal(): void {
    /** root 是当前被操作消息的稳定 DOM 根。 */
    const root = rootRef.current;
    if (!root) return;
    setAnchor(captureChatActionAnchor(root));
    setOpen(true);
  }

  /** 关闭 modal 并清理长按手势状态。 */
  function closeActionModal(): void {
    setOpen(false);
    longPressedRef.current = false;
    pointerStartRef.current = null;
  }

  /** 启动 RN 对应的长按门槛。 */
  function handlePointerDown(event: ReactPointerEvent<HTMLSpanElement>) {
    if (event.button !== 0) return;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    longPressedRef.current = false;
    clearHoldTimer(holdTimerRef);
    holdTimerRef.current = setTimeout(() => {
      longPressedRef.current = true;
      openActionModal();
    }, 500);
  }

  /** pointer 移动超过 RN 手势门槛时判定为列表滚动。 */
  function handlePointerMove(event: ReactPointerEvent<HTMLSpanElement>): void {
    /** start 是本次 pointer 序列的初始位置。 */
    const start = pointerStartRef.current;
    if (!start) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) {
      clearHoldTimer(holdTimerRef);
      pointerStartRef.current = null;
    }
  }

  /** 结束未达到门槛的长按。 */
  function handlePointerEnd() {
    clearHoldTimer(holdTimerRef);
    pointerStartRef.current = null;
  }

  /** 右键只打开动作菜单，不执行动作。 */
  function handleContextMenu(event: ReactMouseEvent<HTMLSpanElement>) {
    event.preventDefault();
    longPressedRef.current = true;
    openActionModal();
  }

  /** 选择引用后关闭菜单并把消息交给页面 composer。 */
  function handleQuote() {
    if (quoteDisabled) return;
    closeActionModal();
    onQuote();
  }

  /** 复制成功后关闭菜单，失败反馈由页面统一呈现。 */
  async function handleCopy() {
    if (copying) return;
    setCopying(true);
    try {
      // succeeded 阻止 clipboard 拒绝时制造成功状态。
      const succeeded = await onCopy();
      if (succeeded) closeActionModal();
    } finally {
      setCopying(false);
    }
  }

  /** 显式收藏 type115，成功状态完全取决于 shared mutation。 */
  async function handleAdd() {
    if (addDisabled || adding || added || !emojiID) return;
    setAdding(true);
    try {
      // succeeded 是唯一允许展示成功反馈的依据。
      const succeeded = await onAddCustomEmoji(emojiID);
      if (succeeded) {
        setAdded(true);
        closeActionModal();
      }
    } finally {
      setAdding(false);
    }
  }

  /** 选择单条转发后关闭菜单并进入 React Router 目标页。 */
  function handleForward() {
    if (forwardDisabled) return;
    closeActionModal();
    onForward();
  }

  /** 选择编辑后关闭菜单并交给页面 composer。 */
  function handleEdit() {
    if (!editAllowed) return;
    closeActionModal();
    onEdit();
  }

  /** 选择多选后关闭菜单并由聊天页持有选择身份。 */
  function handleBeginMultiSelect() {
    if (forwardDisabled) return;
    closeActionModal();
    onBeginMultiSelect();
  }

  /** 选择删除后关闭动作菜单并交给页面确认层。 */
  function handleDelete() {
    closeActionModal();
    onDelete();
  }

  return (
    <span
      className="rn-chat-message-action"
      ref={rootRef}
      tabIndex={0}
      aria-label="消息，长按打开操作"
      aria-haspopup="menu"
      aria-expanded={open}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
      onContextMenu={handleContextMenu}
      onClickCapture={event => {
        if (!event.currentTarget.contains(event.target as Node)) return;
        if (!longPressedRef.current) return;
        event.preventDefault();
        event.stopPropagation();
      }}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openActionModal();
        }
      }}
    >
      {children}
      <ChatMessageActionModal
        open={open}
        anchor={anchor}
        quoteDisabled={quoteDisabled}
        copying={copying}
        editAllowed={editAllowed}
        forwardDisabled={forwardDisabled}
        emojiID={emojiID}
        addDisabled={addDisabled}
        adding={adding}
        added={added}
        onClose={closeActionModal}
        onQuote={handleQuote}
        onCopy={() => void handleCopy()}
        onEdit={handleEdit}
        onBeginMultiSelect={handleBeginMultiSelect}
        onForward={handleForward}
        onAdd={() => void handleAdd()}
        onDelete={handleDelete}
      >
        {children}
      </ChatMessageActionModal>
    </span>
  );
}

/** 清理长按计时器并恢复空引用。 */
function clearHoldTimer(timerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>) {
  if (timerRef.current !== null) clearTimeout(timerRef.current);
  timerRef.current = null;
}
