import chatIconURL from '../../assets/rn/assets/icons/imm28/chat-bubble-empty.solid.svg';
import videoIconURL from '../../assets/rn/assets/icons/imm28/video-camera.weight4.svg';
import cardIconURL from '../../assets/rn/assets/icons/imm28/business-card.svg';
import trashIconURL from '../../assets/rn/assets/icons/imm28/trash.solid.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import type { ContactActionKey, ContactActionMenuState } from './contact-action-view.js';

/** 联系人动作菜单参数由通讯录页面持有，组件不接触 facade。 */
interface ContactActionMenuProps {
  readonly menu: ContactActionMenuState | null;
  readonly pending: boolean;
  readonly onClose: () => void;
  readonly onAction: (action: ContactActionKey) => void;
}

/** 联系人动作配置保持 RN 的顺序、文案和危险态。 */
const CONTACT_ACTIONS: readonly {
  readonly key: ContactActionKey;
  readonly label: string;
  readonly iconURL: string;
  readonly danger?: boolean;
}[] = [
  { key: 'message', label: '发消息', iconURL: chatIconURL },
  { key: 'call', label: '音视频通话', iconURL: videoIconURL },
  { key: 'share-card', label: '分享好友名片', iconURL: cardIconURL },
  { key: 'delete-friend', label: '删除好友', iconURL: trashIconURL, danger: true },
];

/** 渲染 RN 同款四项联系人长按气泡。 */
export function ContactActionMenu({
  menu,
  pending,
  onClose,
  onAction,
}: ContactActionMenuProps) {
  if (!menu) return null;
  return (
    <div className="rn-contact-action-backdrop" role="presentation" onClick={onClose}>
      <div
        className={`rn-contact-action-menu is-${menu.placement}`}
        role="menu"
        aria-label="联系人快捷操作"
        style={{ top: menu.top, left: menu.left }}
        onClick={event => event.stopPropagation()}
      >
        {CONTACT_ACTIONS.map(action => (
          <button
            type="button"
            role="menuitem"
            key={action.key}
            disabled={pending}
            className={action.danger ? 'is-danger' : undefined}
            onClick={() => onAction(action.key)}
          >
            <RNAssetIcon assetURL={action.iconURL} />
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
