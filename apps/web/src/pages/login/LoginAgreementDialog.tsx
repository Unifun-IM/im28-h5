import { useEffect, useRef } from 'react';

/** 未勾选条款时二次确认弹窗的事件 contract。 */
interface LoginAgreementDialogProps {
  readonly visible: boolean;
  readonly onCancel: () => void;
  readonly onAccept: () => void;
  readonly onOpenTerms: () => void;
}

/** 复刻 RN 登录前用户条款确认，不改变真实提交语义。 */
export function LoginAgreementDialog({
  visible,
  onCancel,
  onAccept,
  onOpenTerms,
}: LoginAgreementDialogProps) {
  // dialogRef 负责把 React 可见状态同步到原生 modal surface。
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    // dialog 由父组件状态唯一控制，避免浏览器自行残留 open 状态。
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (visible && !dialog.open) dialog.showModal();
    if (!visible && dialog.open) dialog.close();
  }, [visible]);

  return (
    <dialog
      ref={dialogRef}
      className="account-login-confirm"
      aria-labelledby="agreement-dialog-title"
      onCancel={event => {
        event.preventDefault();
        onCancel();
      }}
    >
      <h2 id="agreement-dialog-title">请阅读并同意以下条款</h2>
      <button
        className="account-login-confirm-link"
        type="button"
        onClick={onOpenTerms}
      >
        《用户&amp;隐私条款》
      </button>
      <div className="account-login-confirm-actions">
        <button type="button" onClick={onCancel}>不同意</button>
        <button className="is-primary" type="button" onClick={onAccept}>
          同意并继续
        </button>
      </div>
    </dialog>
  );
}
