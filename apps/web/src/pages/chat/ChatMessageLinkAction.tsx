import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import copyIconURL from '../../assets/rn/assets/icons/imm28/copy.regular.svg';
import openIconURL from '../../assets/rn/assets/icons/imm28/share.dynamic.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { openChatMessageLink } from './chat-message-link.js';
import './chat-message-link.css';

/** 文本链接动作只接收原文 URL 和页面级复制反馈。 */
interface ChatMessageLinkActionProps {
  readonly text: string;
  readonly url: string;
  readonly onCopy: (url: string) => Promise<boolean>;
}

/** 对齐 RN 的点击打开以及长按“打开/复制”交互。 */
export function ChatMessageLinkAction({
  text,
  url,
  onCopy,
}: ChatMessageLinkActionProps) {
  /** rootRef 用于关闭当前链接菜单且不影响外层消息动作。 */
  const rootRef = useRef<HTMLSpanElement>(null);
  /** holdTimerRef 保存唯一 500ms 长按计时器。 */
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** longPressedRef 阻止长按松手后继续触发点击打开。 */
  const longPressedRef = useRef(false);
  /** open 只控制当前链接动作菜单。 */
  const [open, setOpen] = useState(false);
  /** copying 锁定重复 clipboard 写入。 */
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    /** closeFromOutside 仅关闭当前链接菜单。 */
    function closeFromOutside(event: PointerEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        longPressedRef.current = false;
      }
    }
    document.addEventListener('pointerdown', closeFromOutside);
    return () => {
      clearChatLinkHoldTimer(holdTimerRef);
      document.removeEventListener('pointerdown', closeFromOutside);
    };
  }, []);

  /** pointer down 隔离外层消息长按并启动 RN 长按门槛。 */
  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    if (event.button !== 0) return;
    longPressedRef.current = false;
    clearChatLinkHoldTimer(holdTimerRef);
    holdTimerRef.current = setTimeout(() => {
      longPressedRef.current = true;
      setOpen(true);
    }, 500);
  }

  /** pointer end 清理未达到门槛的长按。 */
  function handlePointerEnd(event: ReactPointerEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    clearChatLinkHoldTimer(holdTimerRef);
  }

  /** 普通点击直接打开；长按完成后的 click 只负责吞掉默认动作。 */
  function handleClick(event: ReactMouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    if (longPressedRef.current) {
      longPressedRef.current = false;
      return;
    }
    openChatMessageLink(url);
  }

  /** 桌面右键仅打开同一链接动作菜单。 */
  function handleContextMenu(event: ReactMouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();
    clearChatLinkHoldTimer(holdTimerRef);
    longPressedRef.current = true;
    setOpen(true);
  }

  /** 键盘 Enter/Space 等价于普通点击且不冒泡到消息菜单。 */
  function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>): void {
    event.stopPropagation();
  }

  /** 菜单打开动作关闭浮层后复用唯一浏览器端口。 */
  function handleOpen(): void {
    setOpen(false);
    longPressedRef.current = false;
    openChatMessageLink(url);
  }

  /** 复制原始 URL，只有成功时才关闭菜单。 */
  async function handleCopy(): Promise<void> {
    if (copying) return;
    setCopying(true);
    try {
      /** succeeded 由页面真实 clipboard 结果决定。 */
      const succeeded = await onCopy(url);
      if (succeeded) {
        setOpen(false);
        longPressedRef.current = false;
      }
    } finally {
      setCopying(false);
    }
  }

  return (
    <span className="rn-chat-text-link-action" ref={rootRef}>
      <button
        className="rn-chat-text-link"
        type="button"
        aria-label={`打开链接 ${url}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onKeyDown={handleKeyDown}
      >
        {text}
      </button>
      {open ? (
        <span className="rn-chat-text-link-menu" role="menu" aria-label="链接操作">
          <button type="button" role="menuitem" onClick={handleOpen}>
            <RNAssetIcon assetURL={openIconURL} />
            <span>打开</span>
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={copying}
            onClick={() => void handleCopy()}
          >
            <RNAssetIcon assetURL={copyIconURL} />
            <span>{copying ? '复制中' : '复制'}</span>
          </button>
        </span>
      ) : null}
    </span>
  );
}

/** 清理链接长按计时器并恢复空引用。 */
function clearChatLinkHoldTimer(
  timerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>,
): void {
  if (timerRef.current !== null) clearTimeout(timerRef.current);
  timerRef.current = null;
}
