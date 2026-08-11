import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

import heartIconURL from '../../assets/rn/assets/icons/imm28/heart.dynamic.svg';
import editIconURL from '../../assets/rn/assets/icons/imm28/edit.dynamic.svg';
import copyIconURL from '../../assets/rn/assets/icons/imm28/copy.regular.svg';
import quoteIconURL from '../../assets/rn/assets/icons/imm28/quote.dynamic.svg';
import multiSelectIconURL from '../../assets/rn/assets/icons/imm28/check-circle.regular.svg';
import forwardIconURL from '../../assets/rn/assets/icons/imm28/share.dynamic.svg';
import trashIconURL from '../../assets/rn/assets/icons/imm28/trash.dynamic.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
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
  // rootRef 用于识别菜单外 pointer 事件。
  const rootRef = useRef<HTMLSpanElement>(null);
  // holdTimerRef 保存唯一 500ms 长按计时器。
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // open 只控制菜单可见性，不隐式触发 mutation。
  const [open, setOpen] = useState(false);
  // copying 锁定同一消息的重复 clipboard 写入。
  const [copying, setCopying] = useState(false);
  // adding 锁定重复收藏请求。
  const [adding, setAdding] = useState(false);
  // added 只在 shared mutation 成功后成立。
  const [added, setAdded] = useState(false);

  useEffect(() => {
    /** 点击动作容器外时关闭菜单。 */
    function closeFromOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', closeFromOutside);
    return () => {
      clearHoldTimer(holdTimerRef);
      document.removeEventListener('pointerdown', closeFromOutside);
    };
  }, []);

  /** 启动 RN 对应的长按门槛。 */
  function handlePointerDown(event: ReactPointerEvent<HTMLSpanElement>) {
    if (event.button !== 0) return;
    clearHoldTimer(holdTimerRef);
    holdTimerRef.current = setTimeout(() => setOpen(true), 500);
  }

  /** 结束未达到门槛的长按。 */
  function handlePointerEnd() {
    clearHoldTimer(holdTimerRef);
  }

  /** 右键只打开动作菜单，不执行动作。 */
  function handleContextMenu(event: ReactMouseEvent<HTMLSpanElement>) {
    event.preventDefault();
    setOpen(true);
  }

  /** 选择引用后关闭菜单并把消息交给页面 composer。 */
  function handleQuote() {
    if (quoteDisabled) return;
    setOpen(false);
    onQuote();
  }

  /** 复制成功后关闭菜单，失败反馈由页面统一呈现。 */
  async function handleCopy() {
    if (copying) return;
    setCopying(true);
    try {
      // succeeded 阻止 clipboard 拒绝时制造成功状态。
      const succeeded = await onCopy();
      if (succeeded) setOpen(false);
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
        setOpen(false);
      }
    } finally {
      setAdding(false);
    }
  }

  /** 选择单条转发后关闭菜单并进入 React Router 目标页。 */
  function handleForward() {
    if (forwardDisabled) return;
    setOpen(false);
    onForward();
  }

  /** 选择编辑后关闭菜单并交给页面 composer。 */
  function handleEdit() {
    if (!editAllowed) return;
    setOpen(false);
    onEdit();
  }

  /** 选择多选后关闭菜单并由聊天页持有选择身份。 */
  function handleBeginMultiSelect() {
    if (forwardDisabled) return;
    setOpen(false);
    onBeginMultiSelect();
  }

  /** 选择删除后关闭动作菜单并交给页面确认层。 */
  function handleDelete() {
    setOpen(false);
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
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
      onContextMenu={handleContextMenu}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') setOpen(true);
      }}
    >
      {children}
      {open ? (
        <span className="rn-chat-message-action-menu" role="menu" aria-label="消息操作">
          <button type="button" role="menuitem" disabled={quoteDisabled} onClick={handleQuote}>
            <RNAssetIcon assetURL={quoteIconURL} />
            <span>引用</span>
          </button>
          <button type="button" role="menuitem" disabled={copying} onClick={() => void handleCopy()}>
            <RNAssetIcon assetURL={copyIconURL} />
            <span>{copying ? '复制中' : '复制'}</span>
          </button>
          {editAllowed ? (
            <button type="button" role="menuitem" onClick={handleEdit}>
              <RNAssetIcon assetURL={editIconURL} />
              <span>编辑</span>
            </button>
          ) : null}
          <button type="button" role="menuitem" disabled={forwardDisabled} onClick={handleBeginMultiSelect}>
            <RNAssetIcon assetURL={multiSelectIconURL} />
            <span>多选</span>
          </button>
          <button type="button" role="menuitem" disabled={forwardDisabled} onClick={handleForward}>
            <RNAssetIcon assetURL={forwardIconURL} />
            <span>转发</span>
          </button>
          {emojiID ? (
            <button type="button" role="menuitem" disabled={addDisabled || adding || added} onClick={() => void handleAdd()}>
              <RNAssetIcon assetURL={heartIconURL} />
              <span>{added ? '已添加' : adding ? '添加中' : '添加到表情'}</span>
            </button>
          ) : null}
          <button type="button" role="menuitem" onClick={handleDelete}>
            <RNAssetIcon assetURL={trashIconURL} />
            <span>删除</span>
          </button>
        </span>
      ) : null}
    </span>
  );
}

/** 清理长按计时器并恢复空引用。 */
function clearHoldTimer(timerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>) {
  if (timerRef.current !== null) clearTimeout(timerRef.current);
  timerRef.current = null;
}
