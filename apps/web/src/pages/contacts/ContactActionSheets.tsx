import type { WebIMContact } from '@im28/im-sdk/web';
import './contact-action-sheets.css';

/** 联系人动作层只依赖稳定身份和公开展示名。 */
type ContactSheetTarget = Pick<WebIMContact, 'userID' | 'displayName'>;

/** 联系人删除范围确认层参数。 */
interface ContactDeleteSheetProps {
  readonly contact: ContactSheetTarget | null;
  readonly pending: boolean;
  readonly onClose: () => void;
  readonly onDelete: (scope: 'self' | 'both') => void;
}

/** 渲染 RN 删除好友关系及聊天清理范围确认层。 */
export function ContactDeleteSheet({
  contact,
  pending,
  onClose,
  onDelete,
}: ContactDeleteSheetProps) {
  if (!contact) return null;
  return (
    <div className="rn-contact-sheet-backdrop" role="presentation" onClick={onClose}>
      <section
        className="rn-contact-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="删除好友"
        onClick={event => event.stopPropagation()}
      >
        <div className="rn-contact-sheet-group">
          <p>{`你确定要删除与 ${contact.displayName} 的好友关系 ? 聊天消息如何处理?`}</p>
          <button type="button" disabled={pending} onClick={() => onDelete('self')}>仅在我的设备中删除消息</button>
          <button type="button" disabled={pending} onClick={() => onDelete('both')}>{`为我和 ${contact.displayName} 删除消息`}</button>
        </div>
        <button type="button" disabled={pending} onClick={onClose}>取消</button>
      </section>
    </div>
  );
}
