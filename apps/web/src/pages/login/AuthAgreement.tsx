/** 登录/注册协议勾选行参数。 */
interface AuthAgreementProps {
  readonly agreed: boolean;
  readonly onToggle: () => void;
  readonly onOpenTerms: () => void;
}

/** 复用 RN 底部协议勾选行，不把勾选状态写入持久化。 */
export function AuthAgreement({
  agreed,
  onToggle,
  onOpenTerms,
}: AuthAgreementProps) {
  return (
    <div className="auth-agreement">
      <button
        className={`auth-radio${agreed ? ' is-checked' : ''}`}
        type="button"
        role="checkbox"
        aria-checked={agreed}
        aria-label="同意用户和隐私条款"
        onClick={onToggle}
      >
        {agreed ? <span aria-hidden="true">✓</span> : null}
      </button>
      <span>我已阅读并同意</span>
      <button className="auth-terms-link" type="button" onClick={onOpenTerms}>
        《用户&amp;隐私条款》
      </button>
    </div>
  );
}
