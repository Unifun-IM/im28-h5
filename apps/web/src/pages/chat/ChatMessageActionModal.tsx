import type { ReactNode } from 'react';

import heartIconURL from '../../assets/rn/assets/icons/imm28/heart.dynamic.svg';
import editIconURL from '../../assets/rn/assets/icons/imm28/edit.dynamic.svg';
import copyIconURL from '../../assets/rn/assets/icons/imm28/copy.regular.svg';
import quoteIconURL from '../../assets/rn/assets/icons/imm28/quote.dynamic.svg';
import multiSelectIconURL from '../../assets/rn/assets/icons/imm28/check-circle.regular.svg';
import forwardIconURL from '../../assets/rn/assets/icons/imm28/share.dynamic.svg';
import trashIconURL from '../../assets/rn/assets/icons/imm28/trash.dynamic.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import type { ChatMessageActionAnchor } from './chat-message-action-layout.js';
import { ChatActionModalSurface } from './ChatActionModalSurface.js';

/** 消息动作 modal 只接收既有动作状态和回调，不拥有业务。 */
interface ChatMessageActionModalProps {
  readonly open: boolean;
  readonly anchor: ChatMessageActionAnchor | null;
  readonly children: ReactNode;
  readonly quoteDisabled: boolean;
  readonly copying: boolean;
  readonly editAllowed: boolean;
  readonly forwardDisabled: boolean;
  readonly emojiID: string;
  readonly addDisabled: boolean;
  readonly adding: boolean;
  readonly added: boolean;
  readonly onClose: () => void;
  readonly onQuote: () => void;
  readonly onCopy: () => void;
  readonly onEdit: () => void;
  readonly onBeginMultiSelect: () => void;
  readonly onForward: () => void;
  readonly onAdd: () => void;
  readonly onDelete: () => void;
}

/** 呈现 RN 全屏遮罩、原消息预览和纵向动作菜单。 */
export function ChatMessageActionModal({
  open,
  anchor,
  children,
  quoteDisabled,
  copying,
  editAllowed,
  forwardDisabled,
  emojiID,
  addDisabled,
  adding,
  added,
  onClose,
  onQuote,
  onCopy,
  onEdit,
  onBeginMultiSelect,
  onForward,
  onAdd,
  onDelete,
}: ChatMessageActionModalProps) {
  return (
    <ChatActionModalSurface
      open={open}
      anchor={anchor}
      ariaLabel="消息操作"
      actionCount={getVisibleActionCount({ editAllowed, emojiID })}
      preview={children}
      onClose={onClose}
    >
      <button type="button" role="menuitem" disabled={quoteDisabled} onClick={onQuote}>
        <RNAssetIcon assetURL={quoteIconURL} />
        <span>引用</span>
      </button>
      <button type="button" role="menuitem" disabled={copying} onClick={onCopy}>
        <RNAssetIcon assetURL={copyIconURL} />
        <span>{copying ? '复制中' : '复制'}</span>
      </button>
      {editAllowed ? (
        <button type="button" role="menuitem" onClick={onEdit}>
          <RNAssetIcon assetURL={editIconURL} />
          <span>编辑</span>
        </button>
      ) : null}
      <button
        type="button"
        role="menuitem"
        disabled={forwardDisabled}
        onClick={onBeginMultiSelect}
      >
        <RNAssetIcon assetURL={multiSelectIconURL} />
        <span>多选</span>
      </button>
      <button type="button" role="menuitem" disabled={forwardDisabled} onClick={onForward}>
        <RNAssetIcon assetURL={forwardIconURL} />
        <span>转发</span>
      </button>
      {emojiID ? (
        <button
          type="button"
          role="menuitem"
          disabled={addDisabled || adding || added}
          onClick={onAdd}
        >
          <RNAssetIcon assetURL={heartIconURL} />
          <span>{added ? '已添加' : adding ? '添加中' : '添加到表情'}</span>
        </button>
      ) : null}
      <button className="is-danger" type="button" role="menuitem" onClick={onDelete}>
        <RNAssetIcon assetURL={trashIconURL} />
        <span>删除</span>
      </button>
    </ChatActionModalSurface>
  );
}

/** 根据可选动作计算 RN 菜单真实条目数。 */
function getVisibleActionCount({
  editAllowed,
  emojiID,
}: {
  readonly editAllowed: boolean;
  readonly emojiID: string;
}): number {
  return 5 + (editAllowed ? 1 : 0) + (emojiID ? 1 : 0);
}
