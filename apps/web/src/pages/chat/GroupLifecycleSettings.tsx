import type { CSSProperties } from 'react';
import {
  resolveIMGroupMemberDisplayName,
  type WebIMGroupMember,
} from '@im28/im-sdk/web';

import { InteractionModal } from '../../components/interaction/index.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import './group-owner-quit-modal.css';

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
  readonly onConfirm: (clearHistory?: boolean) => void;
}

/** 群主退出面板接收 shared 已选定的自动继任管理员。 */
interface GroupOwnerQuitModalProps {
  readonly open: boolean;
  readonly admin: WebIMGroupMember | null;
  readonly submitting: boolean;
  readonly onCancel: () => void;
  readonly onOpenAdmins: () => void;
  readonly onConfirm: (clearHistory: boolean) => void;
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
  if (action === 'leave') {
    return (
      <InteractionModal
        open
        ariaLabel="确认退出群聊"
        className="rn-group-owner-quit-modal"
        closeOnBackdrop={!submitting}
        onRequestClose={onCancel}
      >
        <section className="rn-group-owner-quit-sheet im-modal-sheet" role="alertdialog">
          <div className="rn-group-owner-quit-message">
            <p>确定要退出群聊吗 ?</p>
          </div>
          <div className="rn-group-owner-quit-actions">
            <button type="button" disabled={submitting} onClick={() => onConfirm(false)}>
              {submitting ? '处理中' : '退出群聊'}
            </button>
            <button type="button" disabled={submitting} onClick={() => onConfirm(true)}>
              {submitting ? '处理中' : '退出, 并删除我发的群消息'}
            </button>
          </div>
          <button className="rn-group-owner-quit-cancel" type="button" disabled={submitting} onClick={onCancel}>
            取消
          </button>
        </section>
      </InteractionModal>
    );
  }
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
          <button type="button" disabled={submitting} onClick={() => onConfirm(false)}>
            {submitting ? '处理中' : `确认${label}`}
          </button>
        </div>
      </section>
    </InteractionModal>
  );
}

/** 复刻 RN 群主退出的有管理员与无管理员两种底部动作面板。 */
export function GroupOwnerQuitModal({
  open,
  admin,
  submitting,
  onCancel,
  onOpenAdmins,
  onConfirm,
}: GroupOwnerQuitModalProps) {
  return (
    <InteractionModal
      open={open}
      ariaLabel={admin ? '确认退出群聊' : '无法退出群聊'}
      className="rn-group-owner-quit-modal"
      closeOnBackdrop={!submitting}
      onRequestClose={onCancel}
    >
      <section className="rn-group-owner-quit-sheet im-modal-sheet" role="alertdialog">
        <div className="rn-group-owner-quit-message">
          <p>
            {admin
              ? '确定要退出群聊吗 ?\n退出后其权限将自动转移给'
              : '确定要退出群聊吗 ?\n当前群聊无法退出，请选择一个成员成为管理员后再进行退出'}
          </p>
          {admin ? <GroupOwnerQuitAdminCard member={admin} /> : null}
        </div>
        <div className="rn-group-owner-quit-actions">
          {admin ? (
            <>
              <button type="button" disabled={submitting} onClick={() => onConfirm(false)}>
                {submitting ? '处理中' : '退出群聊'}
              </button>
              <button type="button" disabled={submitting} onClick={() => onConfirm(true)}>
                {submitting ? '处理中' : '退出, 并删除我发的群消息'}
              </button>
            </>
          ) : (
            <button type="button" disabled={submitting} onClick={onOpenAdmins}>管理员设置</button>
          )}
        </div>
        <button className="rn-group-owner-quit-cancel" type="button" disabled={submitting} onClick={onCancel}>
          取消
        </button>
      </section>
    </InteractionModal>
  );
}

/** 群主退出继任者卡片只展示 shared 昵称、头像、ID 与管理员角色。 */
function GroupOwnerQuitAdminCard({ member }: { readonly member: WebIMGroupMember }) {
  /** name 复用 SDK 备注、群昵称、公开昵称的统一优先级。 */
  const name = resolveIMGroupMemberDisplayName(member, member.userID);
  /** avatarStyle 复用 RN 文字头像的稳定 userID 配色。 */
  const avatarStyle = {
    '--group-owner-quit-avatar-gradient': getRNAvatarGradient(member.userID),
  } as CSSProperties;
  return (
    <div className="rn-group-owner-quit-admin">
      <span className="rn-group-owner-quit-avatar" style={avatarStyle}>
        <span>{getRNAvatarInitial(name, '群')}</span>
        {member.avatarURL ? <img src={member.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}
      </span>
      <span className="rn-group-owner-quit-admin-copy">
        <strong>{name}</strong>
        <small>ID：{member.userID}</small>
      </span>
      <em>管理员</em>
    </div>
  );
}
