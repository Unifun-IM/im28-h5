import type { WebIMConversationListItem } from '@im28/im-sdk/web';

import archiveIconURL from '../../assets/rn/assets/icons/imm28/conversation-action-archive.svg';
import unarchiveIconURL from '../../assets/rn/assets/icons/imm28/conversation-action-unarchive.svg';
import bellOffIconURL from '../../assets/rn/assets/icons/imm28/bell-off.solid.svg';
import markReadIconURL from '../../assets/rn/assets/icons/imm28/chat-bubble-check.solid.svg';
import markUnreadIconURL from '../../assets/rn/assets/icons/imm28/chat-bubble-empty.solid.svg';
import pinIconURL from '../../assets/rn/assets/icons/imm28/pin.solid.svg';
import pinSlashIconURL from '../../assets/rn/assets/icons/imm28/pin-slash.solid.svg';
import trashIconURL from '../../assets/rn/assets/icons/imm28/trash.solid.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';

/** 会话长按菜单支持的 RN 动作集合。 */
export type ConversationAction = 'read' | 'pin' | 'mute' | 'archive' | 'delete';

/** 会话操作气泡的稳定视口锚点。 */
export interface ConversationActionAnchor {
  readonly top: number;
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
}

/** 会话操作气泡只接收页面已有共享缓存项。 */
interface ConversationActionMenuProps {
  readonly target: WebIMConversationListItem | null;
  readonly anchor: ConversationActionAnchor | null;
  readonly pending: boolean;
  readonly onClose: () => void;
  readonly onAction: (action: ConversationAction) => void;
  readonly archiveLabel?: '归档' | '取消归档';
}

/** 渲染 RN 同款五项会话长按操作气泡。 */
export function ConversationActionMenu({
  target,
  anchor,
  pending,
  onClose,
  onAction,
  archiveLabel = '归档',
}: ConversationActionMenuProps) {
  if (!target || !anchor) return null;
  /** conversation 缩短菜单状态字段访问。 */
  const conversation = target.conversation;
  /** hasUnread 同时识别真实未读数和手动未读标记。 */
  const hasUnread = conversation.unreadCount > 0 || conversation.manualUnread === true;
  /** menuHeight 是五个固定动作和边框的稳定高度。 */
  const menuHeight = 242;
  /** preferredTop 在锚点下方不足时翻转到行上方。 */
  const preferredTop = anchor.bottom + 4 + menuHeight <= globalThis.innerHeight - 8
    ? anchor.bottom + 4
    : anchor.top - menuHeight - 4;
  /** menuTop 把翻转结果限制在当前视口安全范围。 */
  const menuTop = Math.max(8, Math.min(preferredTop, globalThis.innerHeight - menuHeight - 8));
  /** menuLeft 将 184px 气泡限制在当前视口。 */
  const menuLeft = Math.max(8, Math.min(anchor.left + 72, globalThis.innerWidth - 192));
  /** actions 固定 RN 菜单顺序和动态图标文案。 */
  const actions: readonly {
    readonly key: ConversationAction;
    readonly label: string;
    readonly iconURL: string;
    readonly danger?: boolean;
  }[] = [
    { key: 'read', label: hasUnread ? '标记已读' : '标记未读', iconURL: hasUnread ? markReadIconURL : markUnreadIconURL },
    { key: 'pin', label: conversation.isPinned ? '取消置顶' : '置顶', iconURL: conversation.isPinned ? pinSlashIconURL : pinIconURL },
    { key: 'mute', label: conversation.isMuted ? '取消免打扰' : '免打扰', iconURL: bellOffIconURL },
    {
      key: 'archive',
      label: archiveLabel,
      iconURL: archiveLabel === '取消归档' ? unarchiveIconURL : archiveIconURL,
    },
    { key: 'delete', label: '删除', iconURL: trashIconURL, danger: true },
  ];
  return (
    <div className="rn-conversation-action-backdrop" role="presentation" onClick={onClose}>
      <div
        className="rn-conversation-action-menu"
        role="menu"
        aria-label="会话操作"
        style={{ top: menuTop, left: menuLeft }}
        onClick={event => event.stopPropagation()}
      >
        {actions.map(action => (
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
