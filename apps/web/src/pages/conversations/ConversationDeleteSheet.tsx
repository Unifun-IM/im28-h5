import { useRef } from 'react';
import { createPortal } from 'react-dom';
import type { WebIMConversationListItem } from '@im28/im-sdk/web';

import { InteractionModal } from '../../components/interaction/index.js';
import { getConversationTitle } from './conversation-list-view.js';

/** 会话删除确认层严格区分本端和服务端范围。 */
interface ConversationDeleteSheetProps {
  readonly target: WebIMConversationListItem | null;
  readonly canDeleteForAll: boolean;
  readonly pending: boolean;
  readonly onClose: () => void;
  readonly onDeleteSelf: () => void;
  readonly onDeleteAll: () => void;
}

/** 渲染 RN 会话列表删除范围确认层。 */
export function ConversationDeleteSheet({
  target,
  canDeleteForAll,
  pending,
  onClose,
  onDeleteSelf,
  onDeleteAll,
}: ConversationDeleteSheetProps) {
  // retainedTargetRef 保留退出动画期间需要呈现的最后一个会话实体。
  const retainedTargetRef = useRef<WebIMConversationListItem | null>(target);
  if (target) retainedTargetRef.current = target;
  // visibleTarget 在关闭过渡完成前维持确认文案稳定。
  const visibleTarget = target ?? retainedTargetRef.current;
  if (!visibleTarget) return null;
  /** conversation 是确认文案和权限范围的共享缓存实体。 */
  const conversation = visibleTarget.conversation;
  /** title 使用列表相同的稳定名称回退。 */
  const title = getConversationTitle(conversation);
  /** isGroup 决定 all 范围文案。 */
  const isGroup = conversation.type === 'group';
  if (typeof document === 'undefined') return null;
  return createPortal(
    <InteractionModal
      open={Boolean(target)}
      ariaLabel="删除聊天记录"
      className="rn-conversation-delete-backdrop"
      placement="bottom"
      onRequestClose={onClose}
    >
      <section
        className="rn-conversation-delete-sheet im-modal-sheet"
      >
        <div className="rn-conversation-delete-group">
          <p>{isGroup
            ? '你确定要清空当前群聊记录 ?'
            : `你确定要删除与 ${title} 的聊天记录 ?`}</p>
          <button type="button" disabled={pending} onClick={onDeleteSelf}>仅在我的设备中删除</button>
          {canDeleteForAll ? (
            <button type="button" disabled={pending} onClick={onDeleteAll}>
              {isGroup ? '为我和所有群成员删除' : `为我和 ${title} 删除`}
            </button>
          ) : null}
        </div>
        <button type="button" disabled={pending} onClick={onClose}>取消</button>
      </section>
    </InteractionModal>,
    document.body,
  );
}
