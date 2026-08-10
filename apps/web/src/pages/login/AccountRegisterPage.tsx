import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import backIconURL from '../../assets/rn/components/navbar/nav-arrow-left.svg';
import clearIconURL from '../../assets/rn/screens/auth/assets/clear-icon.svg';
import eyeClosedIconURL from '../../assets/rn/screens/auth/assets/eye-closed-icon.svg';
import eyeIconURL from '../../assets/rn/screens/auth/assets/eye-icon.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { AuthAgreement } from './AuthAgreement.js';
import {
  ACCOUNT_CREDENTIAL_ERROR,
  CONFIRM_PASSWORD_MISMATCH_ERROR,
  PASSWORD_CREDENTIAL_ERROR,
  isValidRegistrationAccount,
  isValidRegistrationPassword,
  readAuthError,
} from './auth-login-config.js';
import { LoginAgreementDialog } from './LoginAgreementDialog.js';
import { LoginTermsDialog } from './LoginTermsDialog.js';

/** 复刻 RN AccountRegisterScreen 并调用真实 Gateway register。 */
export function AccountRegisterPage() {
  // runtime 提供注册后的统一 session、SQLite 与 realtime 收敛。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // navigate 管理返回账号登录与注册成功 replace。
  const navigate = useNavigate();
  // account 保存待注册账号。
  const [account, setAccount] = useState('');
  // password 保存首个密码输入。
  const [password, setPassword] = useState('');
  // confirmPassword 保存二次确认输入。
  const [confirmPassword, setConfirmPassword] = useState('');
  // passwordVisible 控制密码可见性。
  const [passwordVisible, setPasswordVisible] = useState(false);
  // confirmVisible 控制确认密码可见性。
  const [confirmVisible, setConfirmVisible] = useState(false);
  // accountBlurred 控制账号错误提示时机。
  const [accountBlurred, setAccountBlurred] = useState(false);
  // passwordBlurred 控制密码错误提示时机。
  const [passwordBlurred, setPasswordBlurred] = useState(false);
  // confirmBlurred 控制确认密码错误提示时机。
  const [confirmBlurred, setConfirmBlurred] = useState(false);
  // agreed 记录本页面条款确认。
  const [agreed, setAgreed] = useState(false);
  // termsVisible 控制公开条款 modal。
  const [termsVisible, setTermsVisible] = useState(false);
  // agreementPromptVisible 控制提交前二次确认。
  const [agreementPromptVisible, setAgreementPromptVisible] = useState(false);
  // submitting 防止重复注册。
  const [submitting, setSubmitting] = useState(false);
  // error 显示真实注册失败。
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (snapshot.userID) navigate('/conversations', { replace: true });
  }, [navigate, snapshot.userID]);

  /** 执行真实账号注册并进入会话列表。 */
  async function submitRegistration(): Promise<void> {
    if (!runtime || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await runtime.register({ type: 'account', account, password });
      navigate('/conversations', { replace: true });
    } catch (cause) {
      setError(readAuthError(cause, '注册失败'));
    } finally {
      setSubmitting(false);
    }
  }

  /** 校验字段与协议后提交账号注册。 */
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setAccountBlurred(true);
    setPasswordBlurred(true);
    setConfirmBlurred(true);
    if (!canSubmit) return;
    if (!agreed) {
      setAgreementPromptVisible(true);
      return;
    }
    void submitRegistration();
  }

  /** 接受协议确认后继续原注册请求。 */
  function handleAgreementAccepted(): void {
    setAgreed(true);
    setAgreementPromptVisible(false);
    void submitRegistration();
  }

  // accountValid 复用 RN 8-24 位可见字符规则。
  const accountValid = isValidRegistrationAccount(account);
  // passwordValid 复用 RN 英文数字组合规则。
  const passwordValid = isValidRegistrationPassword(password);
  // confirmValid 同时要求格式有效与两次一致。
  const confirmValid = isValidRegistrationPassword(confirmPassword) && password === confirmPassword;
  // canSubmit 聚合真实 runtime、字段与请求状态。
  const canSubmit = Boolean(runtime) && accountValid && passwordValid && confirmValid && !restoring && !submitting;
  // accountError 仅在离焦或提交后展示。
  const accountError = accountBlurred && account && !accountValid ? ACCOUNT_CREDENTIAL_ERROR : '';
  // passwordError 仅在离焦或提交后展示。
  const passwordError = passwordBlurred && password && !passwordValid ? PASSWORD_CREDENTIAL_ERROR : '';
  // confirmError 按 RN 顺序优先提示格式，再提示不一致。
  const confirmError = confirmBlurred && confirmPassword
    ? !isValidRegistrationPassword(confirmPassword)
      ? PASSWORD_CREDENTIAL_ERROR
      : password !== confirmPassword
        ? CONFIRM_PASSWORD_MISMATCH_ERROR
        : ''
    : '';

  return (
    <main className="auth-page auth-register-page">
      <section className="auth-surface" aria-labelledby="account-register-title">
        <header className="auth-register-navbar">
          <button type="button" aria-label="返回账号登录" onClick={() => navigate('/auth/account')}>
            <RNAssetIcon assetURL={backIconURL} />
          </button>
        </header>
        <div className="auth-register-content">
          <h1 id="account-register-title">账号密码注册</h1>
          <form className="auth-register-form" onSubmit={handleSubmit}>
            <div className="auth-register-field">
              <div className="auth-register-input">
                <label className="sr-only" htmlFor="register-account">账号</label>
                <input id="register-account" autoComplete="username" autoCapitalize="none" placeholder="请输入账号" value={account} disabled={submitting} onBlur={() => setAccountBlurred(true)} onChange={event => { setAccount(event.target.value); setAccountBlurred(false); }} />
                {account ? <button type="button" aria-label="清空账号" onClick={() => setAccount('')}><img src={clearIconURL} alt="" /></button> : null}
              </div>
              {accountError ? <p role="alert">{accountError}</p> : null}
            </div>

            <div className="auth-register-field">
              <div className="auth-register-input">
                <label className="sr-only" htmlFor="register-password">密码</label>
                <input id="register-password" autoComplete="new-password" placeholder="请输入密码" type={passwordVisible ? 'text' : 'password'} value={password} disabled={submitting} onBlur={() => setPasswordBlurred(true)} onChange={event => { setPassword(event.target.value); setPasswordBlurred(false); }} />
                <button type="button" aria-label={passwordVisible ? '隐藏密码' : '显示密码'} onClick={() => setPasswordVisible(visible => !visible)}><img src={passwordVisible ? eyeIconURL : eyeClosedIconURL} alt="" /></button>
              </div>
              {passwordError ? <p role="alert">{passwordError}</p> : null}
            </div>

            <div className="auth-register-field">
              <div className="auth-register-input">
                <label className="sr-only" htmlFor="register-confirm-password">确认密码</label>
                <input id="register-confirm-password" autoComplete="new-password" placeholder="再次输入密码" type={confirmVisible ? 'text' : 'password'} value={confirmPassword} disabled={submitting} onBlur={() => setConfirmBlurred(true)} onChange={event => { setConfirmPassword(event.target.value); setConfirmBlurred(false); }} />
                <button type="button" aria-label={confirmVisible ? '隐藏确认密码' : '显示确认密码'} onClick={() => setConfirmVisible(visible => !visible)}><img src={confirmVisible ? eyeIconURL : eyeClosedIconURL} alt="" /></button>
              </div>
              {confirmError ? <p role="alert">{confirmError}</p> : null}
            </div>

            {startupError ? <p className="auth-error" role="alert">{startupError}</p> : null}
            {error ? <p className="auth-error" role="alert">{error}</p> : null}
            <button className="auth-submit auth-register-submit" type="submit" disabled={!canSubmit}>
              {restoring ? '恢复会话中' : submitting ? '注册中' : '注册并登录'}
            </button>
          </form>
        </div>

        <footer className="auth-bottom">
          <AuthAgreement agreed={agreed} onToggle={() => setAgreed(value => !value)} onOpenTerms={() => setTermsVisible(true)} />
        </footer>
      </section>

      <LoginAgreementDialog visible={agreementPromptVisible} onCancel={() => setAgreementPromptVisible(false)} onAccept={handleAgreementAccepted} onOpenTerms={() => setTermsVisible(true)} />
      <LoginTermsDialog runtime={runtime} visible={termsVisible} onClose={() => setTermsVisible(false)} />
    </main>
  );
}
