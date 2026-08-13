import businessCardIconURL from '../../assets/rn/assets/icons/imm28/business-card.svg';
import editIconURL from '../../assets/rn/assets/icons/imm28/edit.regular.svg';
import logoutIconURL from '../../assets/rn/assets/icons/imm28/log-out.svg';
import { InteractionModal } from '../../components/interaction/index.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import type {
  JoinedGroupActionKey,
  JoinedGroupActionMenuState,
  JoinedGroupQuitMode,
} from './joined-group-actions-view.js';

/** 群列表动作菜单只接收页面持有的真实群状态。 */
interface JoinedGroupActionMenuProps {
  readonly menu: JoinedGroupActionMenuState | null;
  readonly pending: boolean;
  readonly onClose: () => void;
  readonly onAction: (action: JoinedGroupActionKey) => void;
}

/** 群列表退出确认层参数不包含 SDK owner。 */
interface JoinedGroupQuitModalProps {
  readonly groupName: string;
  readonly mode: JoinedGroupQuitMode | null;
  readonly submitting: boolean;
  readonly onCancel: () => void;
  readonly onLeave: (clearHistory: boolean) => void;
  readonly onTransferOwner: () => void;
}

/** 群列表动作图标和文案保持 RN 当前顺序。 */
const GROUP_ACTION_LABELS: Readonly<Record<JoinedGroupActionKey, {
  readonly label: string;
  readonly iconURL: string;
}>> = {
  'share-card': { label: '分享群名片', iconURL: businessCardIconURL },
  quit: { label: '退出群聊', iconURL: logoutIconURL },
  'edit-name': { label: '修改群名称', iconURL: editIconURL },
};

/** 渲染与 RN 同序、按 capability 裁剪的群列表长按气泡。 */
export function JoinedGroupActionMenu({
  menu,
  pending,
  onClose,
  onAction,
}: JoinedGroupActionMenuProps) {
  if (!menu) return null;
  return (
    <div className="rn-joined-group-action-backdrop" role="presentation" onClick={onClose}>
      <div
        className={`rn-joined-group-action-menu is-${menu.placement}`}
        role="menu"
        aria-label="群聊快捷操作"
        style={{ top: menu.top, left: menu.left }}
        onClick={event => event.stopPropagation()}
      >
        {menu.actions.map(actionKey => {
          /** action 保存当前动作的稳定图标和文案。 */
          const action = GROUP_ACTION_LABELS[actionKey];
          return (
            <button
              type="button"
              role="menuitem"
              key={actionKey}
              disabled={pending}
              onClick={() => onAction(actionKey)}
            >
              <RNAssetIcon assetURL={action.iconURL} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** 普通成员显示双退出选项，群主明确转入 shared 群主转让流程。 */
export function JoinedGroupQuitModal({
  groupName,
  mode,
  submitting,
  onCancel,
  onLeave,
  onTransferOwner,
}: JoinedGroupQuitModalProps) {
  /** transferFirst 标记当前 capability 只允许先转让群主。 */
  const transferFirst = mode === 'transfer-first';
  /** unavailable 标记服务端未授予任何退出路径。 */
  const unavailable = mode === 'unavailable';
  return (
    <InteractionModal
      open={Boolean(mode)}
      ariaLabel={transferFirst ? '请先转让群主' : '确认退出群聊'}
      className="rn-joined-group-quit-backdrop"
      closeOnBackdrop={!submitting}
      onRequestClose={onCancel}
    >
      <section className="rn-joined-group-quit-modal im-modal-sheet" role="alertdialog">
        <h2>{transferFirst ? '请先转让群主' : '退出群聊'}</h2>
        <p>
          {transferFirst
            ? `退出${groupName || '该群聊'}前，需要先将群主身份转让给其他成员。`
            : unavailable
              ? '当前群聊未授予退出权限，请刷新群资料后重试。'
              : '确定要退出群聊吗 ?'}
        </p>
        {mode === 'leave' ? (
          <div className="rn-joined-group-quit-actions">
            <button className="is-danger" type="button" disabled={submitting} onClick={() => onLeave(false)}>
              {submitting ? '处理中' : '退出群聊'}
            </button>
            <button className="is-danger" type="button" disabled={submitting} onClick={() => onLeave(true)}>
              退出, 并删除我发的群消息
            </button>
            <button type="button" disabled={submitting} onClick={onCancel}>取消</button>
          </div>
        ) : (
          <div className="rn-joined-group-quit-actions">
            {transferFirst ? (
              <button type="button" disabled={submitting} onClick={onTransferOwner}>
                去转让群主
              </button>
            ) : null}
            <button type="button" disabled={submitting} onClick={onCancel}>
              {unavailable ? '我知道了' : '取消'}
            </button>
          </div>
        )}
      </section>
    </InteractionModal>
  );
}
