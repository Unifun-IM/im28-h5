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
  readonly mode: Exclude<JoinedGroupQuitMode, 'owner'> | null;
  readonly submitting: boolean;
  readonly onCancel: () => void;
  readonly onLeave: (clearHistory: boolean) => void;
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

/** 普通成员显示双退出选项，权限缺失时保持 fail-closed。 */
export function JoinedGroupQuitModal({
  groupName,
  mode,
  submitting,
  onCancel,
  onLeave,
}: JoinedGroupQuitModalProps) {
  /** unavailable 标记服务端未授予任何退出路径。 */
  const unavailable = mode === 'unavailable';
  return (
    <InteractionModal
      open={Boolean(mode)}
      ariaLabel="确认退出群聊"
      className="rn-joined-group-quit-backdrop"
      placement="bottom"
      closeOnBackdrop={!submitting}
      onRequestClose={onCancel}
    >
      <section className="rn-joined-group-quit-modal im-modal-sheet" role="alertdialog">
        <div className="rn-joined-group-quit-actions">
          <p>
            {unavailable
              ? '当前群聊未授予退出权限，请刷新群资料后重试。'
              : `确定要退出${groupName || '该群聊'}吗 ?`}
          </p>
          {mode === 'leave' ? (
            <>
              <button className="is-danger" type="button" disabled={submitting} onClick={() => onLeave(false)}>
                {submitting ? '处理中' : '退出群聊'}
              </button>
              <button className="is-danger" type="button" disabled={submitting} onClick={() => onLeave(true)}>
                退出, 并删除我发的群消息
              </button>
            </>
          ) : null}
        </div>
        <button className="rn-joined-group-quit-cancel" type="button" disabled={submitting} onClick={onCancel}>
          {unavailable ? '我知道了' : '取消'}
        </button>
      </section>
    </InteractionModal>
  );
}
