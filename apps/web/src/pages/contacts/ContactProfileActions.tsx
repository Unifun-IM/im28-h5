import rightIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';

/** 联系人资料信息行参数。 */
interface ContactProfileRowProps {
  readonly label: string;
  readonly value: string;
  readonly last?: boolean;
  readonly onClick?: () => void;
}

/** 渲染 RN 56px 左右 flex 信息行。 */
export function ContactProfileRow({ label, value, last = false, onClick }: ContactProfileRowProps) {
  /** content 保持可点击和静态行相同的左右布局。 */
  const content = (
    <>
      <span>{label}</span>
      <span className="rn-contact-profile-row-value">
        <strong>{value}</strong>
        {onClick ? <RNAssetIcon assetURL={rightIconURL} /> : null}
      </span>
    </>
  );
  if (onClick) {
    return (
      <button type="button" className={`rn-contact-profile-row${last ? ' is-last' : ''}`} onClick={onClick}>
        {content}
      </button>
    );
  }
  return <div className={`rn-contact-profile-row${last ? ' is-last' : ''}`}>{content}</div>;
}

/** 联系人快捷动作参数。 */
interface ProfileQuickActionProps {
  readonly iconURL: string;
  readonly label: string;
  readonly selected?: boolean;
  readonly disabled: boolean;
  readonly onClick: () => void;
}

/** 渲染 RN 好友资料三等分快捷操作。 */
export function ProfileQuickAction({
  iconURL,
  label,
  selected = false,
  disabled,
  onClick,
}: ProfileQuickActionProps) {
  return (
    <button type="button" className={selected ? 'is-selected' : undefined} disabled={disabled} onClick={onClick}>
      <RNAssetIcon assetURL={iconURL} />
      <span>{label}</span>
    </button>
  );
}

/** 备注编辑层参数。 */
interface ProfileRemarkDialogProps {
  readonly open: boolean;
  readonly value: string;
  readonly pending: boolean;
  readonly onChange: (value: string) => void;
  readonly onClose: () => void;
  readonly onSave: () => void;
}

/** 渲染 RN 备注编辑确认层。 */
export function ProfileRemarkDialog({
  open,
  value,
  pending,
  onChange,
  onClose,
  onSave,
}: ProfileRemarkDialogProps) {
  if (!open) return null;
  return (
    <div className="rn-contact-profile-dialog-backdrop" role="presentation" onClick={onClose}>
      <section role="dialog" aria-modal="true" aria-label="编辑备注" onClick={event => event.stopPropagation()}>
        <h2>备注名</h2>
        <input
          autoFocus
          maxLength={64}
          value={value}
          placeholder="请输入备注名"
          onChange={event => onChange(event.target.value)}
        />
        <footer>
          <button type="button" disabled={pending} onClick={onClose}>取消</button>
          <button type="button" disabled={pending} onClick={onSave}>{pending ? '保存中' : '完成'}</button>
        </footer>
      </section>
    </div>
  );
}

/** 更多动作层参数。 */
interface ProfileMoreSheetProps {
  readonly open: boolean;
  readonly blocked: boolean;
  readonly pending: boolean;
  readonly onClose: () => void;
  readonly onBlacklist: () => void;
  readonly onDelete: () => void;
}

/** 渲染 RN 资料页黑名单和删除好友动作层。 */
export function ProfileMoreSheet({
  open,
  blocked,
  pending,
  onClose,
  onBlacklist,
  onDelete,
}: ProfileMoreSheetProps) {
  if (!open) return null;
  return (
    <div className="rn-contact-sheet-backdrop" role="presentation" onClick={onClose}>
      <section className="rn-contact-sheet" role="dialog" aria-modal="true" aria-label="更多联系人操作" onClick={event => event.stopPropagation()}>
        <div className="rn-contact-sheet-group">
          <button type="button" disabled={pending} onClick={onBlacklist}>{blocked ? '移出黑名单' : '加入黑名单'}</button>
          <button type="button" disabled={pending} onClick={onDelete}>删除朋友</button>
        </div>
        <button type="button" disabled={pending} onClick={onClose}>取消</button>
      </section>
    </div>
  );
}

/** 联系人确认层参数。 */
interface ProfileConfirmDialogProps {
  readonly open: boolean;
  readonly pending: boolean;
  readonly title: string;
  readonly description: string;
  readonly confirmLabel: string;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

/** 渲染黑名单等明确写操作的二次确认。 */
export function ProfileConfirmDialog({
  open,
  pending,
  title,
  description,
  confirmLabel,
  onClose,
  onConfirm,
}: ProfileConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="rn-contact-profile-dialog-backdrop" role="presentation" onClick={onClose}>
      <section role="alertdialog" aria-modal="true" aria-label={title} onClick={event => event.stopPropagation()}>
        <h2>{title}</h2>
        <p>{description}</p>
        <footer>
          <button type="button" disabled={pending} onClick={onClose}>取消</button>
          <button type="button" disabled={pending} onClick={onConfirm}>{pending ? '处理中' : confirmLabel}</button>
        </footer>
      </section>
    </div>
  );
}

/** 联系人资料错误条参数。 */
interface ContactProfileErrorProps {
  readonly error: string;
  readonly onRetry: () => Promise<void>;
}

/** 显示真实失败并提供同一 facade 重试。 */
export function ContactProfileError({ error, onRetry }: ContactProfileErrorProps) {
  return (
    <div className="rn-contact-profile-error" role="alert">
      <span>{error}</span>
      <button type="button" onClick={() => void onRetry()}>重试</button>
    </div>
  );
}

/** 联系人资料启动状态参数。 */
interface ContactProfilePageStateProps {
  readonly label: string;
  readonly detail?: string | null;
}

/** 统一承载资料页启动和配置错误。 */
export function ContactProfilePageState({ label, detail }: ContactProfilePageStateProps) {
  return <main className="rn-contact-profile-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将未知异常收敛为不含凭据的页面文案。 */
export function readContactProfileError(
  cause: unknown,
  fallback = '联系人资料加载失败，请重试',
): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}
