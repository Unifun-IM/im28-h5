import { InteractionModal } from '../../components/interaction/index.js';

/** 退出登录确认层参数只包含页面状态和显式回调。 */
interface MeLogoutDialogProps {
  readonly open: boolean;
  readonly signingOut: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

/** 通过全局 modal 生命周期呈现 RN 退出登录确认层。 */
export function MeLogoutDialog({
  open,
  signingOut,
  onCancel,
  onConfirm,
}: MeLogoutDialogProps) {
  /** requestClose 在提交期间拒绝 Esc、遮罩和取消关闭。 */
  const requestClose = (): void => {
    if (!signingOut) onCancel();
  };

  return (
    <InteractionModal
      open={open}
      ariaLabel="退出登录"
      className="rn-me-logout-dialog-backdrop"
      closeOnBackdrop={!signingOut}
      onRequestClose={requestClose}
    >
      <section className="rn-me-dialog im-modal-sheet" role="alertdialog">
        <h2>退出登录</h2>
        <p>确认退出当前账号？</p>
        <div>
          <button type="button" disabled={signingOut} onClick={requestClose}>取消</button>
          <button className="is-danger" type="button" disabled={signingOut} onClick={onConfirm}>
            {signingOut ? '退出中' : '退出'}
          </button>
        </div>
      </section>
    </InteractionModal>
  );
}
