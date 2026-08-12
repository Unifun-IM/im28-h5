import type { Conversation } from '@im28/im-sdk/web';

import {
  buildChatClearHistorySheetView,
  type ChatClearHistoryScope,
} from './chat-clear-history.js';
import './chat-message-delete.css';

/** 会话清空确认层只接收页面状态和显式确认回调。 */
interface ChatClearHistorySheetProps {
  readonly conversation: Conversation;
  readonly canClearForAll: boolean;
  readonly clearing: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: (scope: ChatClearHistoryScope) => void;
}

/** 复刻 RN ConversationDeleteSheet 的提示、scope 和取消结构。 */
export function ChatClearHistorySheet({
  conversation,
  canClearForAll,
  clearing,
  onCancel,
  onConfirm,
}: ChatClearHistorySheetProps) {
  /** view 集中持有单聊/群聊的 scope 与 RN 文案差异。 */
  const view = buildChatClearHistorySheetView(conversation, canClearForAll);
  return (
    <div
      className="rn-chat-delete-backdrop"
      role="presentation"
      onPointerDown={event => {
        if (!clearing && event.target === event.currentTarget) onCancel();
      }}
    >
      <section className="rn-chat-delete-sheet" role="alertdialog" aria-modal="true" aria-label="清空聊天记录">
        <div className="rn-chat-delete-group">
          <p>{view.hint}</p>
          <ClearButton label={view.selfLabel} clearing={clearing} onClick={() => onConfirm('self')} />
          {view.showAll ? (
            <ClearButton label={view.allLabel} clearing={clearing} onClick={() => onConfirm(view.allScope)} />
          ) : null}
        </div>
        <button type="button" disabled={clearing} onClick={onCancel}>取消</button>
      </section>
    </div>
  );
}

/** 呈现确认层中的单个危险操作。 */
function ClearButton({
  label,
  clearing,
  onClick,
}: {
  readonly label: string;
  readonly clearing: boolean;
  readonly onClick: () => void;
}) {
  return (
    <button className="is-danger" type="button" disabled={clearing} onClick={onClick}>
      {clearing ? '清空中' : label}
    </button>
  );
}
