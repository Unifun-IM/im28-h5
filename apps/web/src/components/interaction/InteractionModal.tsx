import { useEffect, useRef, type ReactNode } from 'react';

/** 通用模态层只负责浏览器焦点、遮罩和关闭生命周期。 */
interface InteractionModalProps {
  readonly open: boolean;
  readonly ariaLabel: string;
  readonly className?: string;
  readonly closeOnBackdrop?: boolean;
  readonly children: ReactNode;
  readonly onRequestClose: () => void;
}

/** 关闭动画时长与交互 CSS 令牌保持一致。 */
const MODAL_EXIT_DURATION_MS = 160;

/** 动效降级用户关闭模态层时不引入额外等待。 */
function getModalExitDuration() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 0
    : MODAL_EXIT_DURATION_MS;
}

/** 基于原生 dialog 提供焦点圈定、背景 inert、Esc 和遮罩关闭。 */
export function InteractionModal({
  open,
  ariaLabel,
  className = '',
  closeOnBackdrop = true,
  children,
  onRequestClose,
}: InteractionModalProps) {
  // dialogRef 连接受控 open 状态与原生 top-layer API。
  const dialogRef = useRef<HTMLDialogElement>(null);
  // closeTimerRef 在关闭动画完成后再移除原生模态状态。
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // dialog 是当前组件拥有的原生模态节点。
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (open) {
      delete dialog.dataset.closing;
      if (!dialog.open) dialog.showModal();
      return;
    }
    if (!dialog.open) return;
    dialog.dataset.closing = 'true';
    closeTimerRef.current = window.setTimeout(() => {
      dialog.close();
      delete dialog.dataset.closing;
      closeTimerRef.current = null;
    }, getModalExitDuration());
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [open]);

  /** 拦截原生 Esc 默认关闭，让受控状态先完成退出动画。 */
  function handleCancel(event: React.SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    if (open) onRequestClose();
  }

  /** 兼容未稳定派发 dialog cancel 的 WebView，由受控状态统一处理 Escape。 */
  function handleKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Escape' || !open) return;
    event.preventDefault();
    event.stopPropagation();
    onRequestClose();
  }

  /** 仅点击 dialog 自身遮罩区域时请求关闭，内容点击不冒泡关闭。 */
  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (closeOnBackdrop && event.target === event.currentTarget && open) {
      onRequestClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={`im-interaction-modal ${className}`.trim()}
      aria-label={ariaLabel}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </dialog>
  );
}
