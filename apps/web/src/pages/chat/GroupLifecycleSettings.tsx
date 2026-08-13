import { InteractionModal } from '../../components/interaction/index.js';

/** 群生命周期危险操作仅包含普通退群和群主解散。 */
export type GroupLifecycleAction = 'leave' | 'dismiss';

/** 群生命周期入口只接收 shared capability 已选定的动作。 */
interface GroupLifecycleSettingsCardProps {
  readonly action: GroupLifecycleAction;
  readonly submitting: boolean;
  readonly onOpen: (action: GroupLifecycleAction) => void;
}

/** 群生命周期确认层持有展示状态，不持有业务调用。 */
interface GroupLifecycleConfirmModalProps {
  readonly action: GroupLifecycleAction | null;
  readonly groupName: string;
  readonly submitting: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

/** 群生命周期危险入口只消费 shared capability 投影。 */
export function GroupLifecycleSettingsCard({
  action,
  submitting,
  onOpen,
}: GroupLifecycleSettingsCardProps) {
  /** label 保持 RN 群设置危险操作语义。 */
  const label = action === 'dismiss' ? '解散群聊' : '退出群聊';
  return (
    <div className="rn-chat-settings-card">
      <button
        className="rn-chat-settings-row rn-chat-settings-lifecycle-row"
        type="button"
        disabled={submitting}
        onClick={() => onOpen(action)}
      >
        <span>{label}</span>
      </button>
    </div>
  );
}

/** 原生 dialog 二次确认阻止误触退出或解散群聊。 */
export function GroupLifecycleConfirmModal({
  action,
  groupName,
  submitting,
  onCancel,
  onConfirm,
}: GroupLifecycleConfirmModalProps) {
  /** label 区分普通成员退出和群主不可恢复的解散动作。 */
  const label = action === 'dismiss' ? '解散群聊' : '退出群聊';
  /** detail 明确成功后的本地清理后果。 */
  const detail = action === 'dismiss'
    ? `解散后，${groupName || '该群聊'}及本地聊天记录将被移除，此操作不可撤销。`
    : `退出后，${groupName || '该群聊'}及本地聊天记录将从当前账号移除。`;
  return (
    <InteractionModal
      open={Boolean(action)}
      ariaLabel={`确认${label}`}
      closeOnBackdrop={!submitting}
      onRequestClose={onCancel}
    >
      <section className="rn-chat-settings-lifecycle-confirm im-modal-sheet" role="alertdialog">
        <h2>{label}</h2>
        <p>{detail}</p>
        <div>
          <button type="button" disabled={submitting} onClick={onCancel}>取消</button>
          <button type="button" disabled={submitting} onClick={onConfirm}>
            {submitting ? '处理中' : `确认${label}`}
          </button>
        </div>
      </section>
    </InteractionModal>
  );
}
