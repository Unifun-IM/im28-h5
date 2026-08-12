import type { WebIMConversationListItem } from '@im28/im-sdk/web';

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
  if (!target) return null;
  /** conversation 是确认文案和权限范围的共享缓存实体。 */
  const conversation = target.conversation;
  /** title 使用列表相同的稳定名称回退。 */
  const title = getConversationTitle(conversation);
  /** isGroup 决定 all 范围文案。 */
  const isGroup = conversation.type === 'group';
  return (
    <div className="rn-conversation-delete-backdrop" role="presentation" onClick={onClose}>
      <section
        className="rn-conversation-delete-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="删除聊天记录"
        onClick={event => event.stopPropagation()}
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
    </div>
  );
}
