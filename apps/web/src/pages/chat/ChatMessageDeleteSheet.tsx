import type { useChatMessageDeleteFlow } from './useChatMessageDeleteFlow.js';
import './chat-message-delete.css';

/** 删除确认层直接消费页面 flow，禁止自行调用 SDK。 */
interface ChatMessageDeleteSheetProps {
  readonly flow: ReturnType<typeof useChatMessageDeleteFlow>;
}

/** 复刻 RN ConversationDeleteSheet 的提示、双 scope 和取消结构。 */
export function ChatMessageDeleteSheet({ flow }: ChatMessageDeleteSheetProps) {
  if (!flow.pendingMessages.length) return null;
  // hintText 区分单条与批量确认文案。
  const hintText = flow.pendingMessages.length === 1
    ? '你确定要删除该记录 ?'
    : `你确定要删除这${flow.pendingMessages.length}条记录 ?`;
  return (
    <div
      className="rn-chat-delete-backdrop"
      role="presentation"
      onPointerDown={event => {
        if (event.target === event.currentTarget) flow.cancelDelete();
      }}
    >
      <section className="rn-chat-delete-sheet" role="dialog" aria-modal="true" aria-label="删除消息">
        <div className="rn-chat-delete-group">
          <p>{hintText}</p>
          <DeleteButton
            label="仅在我的设备中删除"
            disabled={flow.confirming}
            onClick={() => void flow.confirmDelete('self')}
          />
          {flow.canDeleteForAll ? (
            <DeleteButton
              label={flow.deleteForAllLabel}
              disabled={flow.confirming}
              onClick={() => void flow.confirmDelete('all')}
            />
          ) : null}
        </div>
        <button type="button" disabled={flow.confirming} onClick={flow.cancelDelete}>
          取消
        </button>
      </section>
    </div>
  );
}

/** 呈现确认层中的危险操作按钮。 */
function DeleteButton({
  label,
  disabled,
  onClick,
}: {
  readonly label: string;
  readonly disabled: boolean;
  readonly onClick: () => void;
}) {
  return (
    <button className="is-danger" type="button" disabled={disabled} onClick={onClick}>
      {disabled ? '处理中' : label}
    </button>
  );
}
