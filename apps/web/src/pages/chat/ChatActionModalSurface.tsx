import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { InteractionModal } from '../../components/interaction/index.js';
import {
  getChatMessageActionStackLayout,
  type ChatMessageActionAnchor,
} from './chat-message-action-layout.js';

/** 通用动作层只接收定位、预览与菜单内容，不持有消息业务。 */
interface ChatActionModalSurfaceProps {
  readonly open: boolean;
  readonly anchor: ChatMessageActionAnchor | null;
  readonly ariaLabel: string;
  readonly actionCount: number;
  readonly preview: ReactNode;
  readonly children: ReactNode;
  readonly onClose: () => void;
}

/** 统一呈现聊天消息与链接动作的全屏 top-layer。 */
export function ChatActionModalSurface({
  open,
  anchor,
  ariaLabel,
  actionCount,
  preview,
  children,
  onClose,
}: ChatActionModalSurfaceProps) {
  if (!open || !anchor || typeof document === 'undefined') return null;
  return createPortal(
    <InteractionModal
      open
      ariaLabel={ariaLabel}
      className="rn-chat-message-action-modal"
      onRequestClose={onClose}
    >
      <span
        className={`rn-chat-message-action-stack${anchor.mine ? ' is-mine' : ' is-other'}`}
        style={getChatActionStackStyle(anchor, actionCount)}
        onPointerDown={event => event.stopPropagation()}
        onPointerMove={event => event.stopPropagation()}
        onClick={event => event.stopPropagation()}
        onContextMenu={event => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <span className="rn-chat-message-action-preview" aria-hidden="true" inert>
          {preview}
        </span>
        <span className="rn-chat-message-action-menu" role="menu" aria-label={ariaLabel}>
          {children}
        </span>
      </span>
    </InteractionModal>,
    document.body,
  );
}

/** 从被操作节点冻结视口矩形与消息方向。 */
export function captureChatActionAnchor(element: HTMLElement): ChatMessageActionAnchor {
  /** rect 保存相对视口的位置，避免滚动后重新猜测。 */
  const rect = element.getBoundingClientRect();
  /** mine 只从聊天行方向 class 翻译为定位输入。 */
  const mine = Boolean(element.closest('.rn-chat-message-row.is-outgoing'));
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    mine,
  };
}

/** 把纯布局结果转换成当前视口的固定定位样式。 */
function getChatActionStackStyle(
  anchor: ChatMessageActionAnchor,
  actionCount: number,
): CSSProperties {
  /** layout 只在打开时读取浏览器视口，不参与业务状态。 */
  const layout = getChatMessageActionStackLayout(
    anchor,
    actionCount,
    window.innerWidth,
    window.innerHeight,
  );
  return {
    top: layout.top,
    left: layout.left,
    width: layout.width,
    '--chat-action-preview-width': `${layout.previewWidth}px`,
    '--chat-action-preview-max-height': `${layout.previewMaxHeight}px`,
  } as CSSProperties;
}
