import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import clearIconURL from '../../assets/rn/screens/auth/assets/clear-icon.svg';
import eyeClosedIconURL from '../../assets/rn/screens/auth/assets/eye-closed-icon.svg';
import eyeIconURL from '../../assets/rn/screens/auth/assets/eye-icon.svg';
import startupLogoURL from '../../assets/rn/screens/auth/assets/startup-logo.png';
import { useWebIMRuntime } from '../../runtime/index.js';
import { LoginAgreementDialog } from './LoginAgreementDialog.js';
import { LoginTermsDialog } from './LoginTermsDialog.js';
import './login-page.css';

/** 账号密码登录页复刻 RN AccountLoginScreen 的核心登录链路。 */
export function LoginPage() {
  // runtime context 不暴露任何 token 字段。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // navigate 只由 React Router 管理登录后的 SPA 页面切换。
  const navigate = useNavigate();
  // account 对应 Gateway account 登录字段。
  const [account, setAccount] = useState('');
  // password 仅保存在当前受控输入状态。
  const [password, setPassword] = useState('');
  // passwordVisible 与 RN 眼睛按钮的显示状态一致。
  const [passwordVisible, setPasswordVisible] = useState(false);
  // agreed 记录当前页面生命周期内的用户条款确认。
  const [agreed, setAgreed] = useState(false);
  // termsVisible 控制真实平台条款全屏查看器。
  const [termsVisible, setTermsVisible] = useState(false);
  // agreementPromptVisible 复刻未勾选时的二次确认。
  const [agreementPromptVisible, setAgreementPromptVisible] = useState(false);
  // submitting 防止重复登录请求。
  const [submitting, setSubmitting] = useState(false);
  // error 展示当前登录失败且不伪装成功。
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (snapshot.userID) {
      navigate('/conversations', { replace: true });
    }
  }, [navigate, snapshot.userID]);

  /** 提交真实 Gateway account login。 */
  async function submitLogin(): Promise<void> {
    if (!runtime || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await runtime.login({ type: 'account', account: account.trim(), password });
      navigate('/conversations', { replace: true });
    } catch (cause) {
      setError(readErrorMessage(cause));
    } finally {
      setSubmitting(false);
    }
  }

  /** 校验协议状态后执行与 RN 相同的登录分支。 */
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!agreed) {
      setAgreementPromptVisible(true);
      return;
    }
    void submitLogin();
  }

  /** 接受二次确认后勾选协议并继续原登录请求。 */
  function handleAgreementAccepted(): void {
    setAgreed(true);
    setAgreementPromptVisible(false);
    void submitLogin();
  }

  // canLogin 保持 RN 账号、密码和请求中三项启用规则。
  const canLogin =
    Boolean(runtime) &&
    account.trim().length > 0 &&
    password.length > 0 &&
    !restoring &&
    !submitting;
  // blockingError 优先显示部署配置错误。
  const blockingError = startupError && !runtime ? startupError : null;

  return (
    <main className="account-login-page">
      <section className="account-login-surface" aria-labelledby="login-title">
        <div className="account-login-navbar" aria-hidden="true" />
        <div className="account-login-content">
          <header className="account-login-hero">
            <img className="account-login-logo" src={startupLogoURL} alt="" />
            <h1 id="login-title">账号密码登录</h1>
            <p>使用账号和密码登录</p>
          </header>

          {blockingError ? (
            <div className="account-login-runtime-error" role="alert">
              <strong>运行配置不可用</strong>
              <span>{blockingError}</span>
            </div>
          ) : (
            <form className="account-login-form" onSubmit={handleSubmit}>
              <div className="account-login-inputs">
                <div className="account-login-input-shell">
                  <label className="sr-only" htmlFor="account-login-account">账号</label>
                  <input
                    id="account-login-account"
                    name="account"
                    autoComplete="username"
                    autoCapitalize="none"
                    placeholder="请输入账号"
                    value={account}
                    onChange={event => setAccount(event.target.value)}
                    disabled={restoring || submitting}
                  />
                  {account ? (
                    <button
                      className="account-login-input-action action-clear"
                      type="button"
                      aria-label="清空账号"
                      onClick={() => setAccount('')}
                    >
                      <img src={clearIconURL} alt="" />
                    </button>
                  ) : null}
                </div>

                <div className="account-login-input-shell">
                  <label className="sr-only" htmlFor="account-login-password">密码</label>
                  <input
                    id="account-login-password"
                    name="password"
                    type={passwordVisible ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    disabled={restoring || submitting}
                  />
                  {password ? (
                    <button
                      className="account-login-input-action action-clear"
                      type="button"
                      aria-label="清空密码"
                      onClick={() => setPassword('')}
                    >
                      <img src={clearIconURL} alt="" />
                    </button>
                  ) : null}
                  <button
                    className="account-login-input-action action-eye"
                    type="button"
                    aria-label={passwordVisible ? '隐藏密码' : '显示密码'}
                    onClick={() => setPasswordVisible(visible => !visible)}
                  >
                    <img
                      src={passwordVisible ? eyeIconURL : eyeClosedIconURL}
                      alt=""
                    />
                  </button>
                </div>
              </div>

              {startupError ? (
                <p className="account-login-error" role="alert">{startupError}</p>
              ) : null}
              {error ? (
                <p className="account-login-error" role="alert">{error}</p>
              ) : null}
              <button
                className="account-login-submit"
                type="submit"
                disabled={!canLogin}
              >
                {restoring ? '恢复会话中' : submitting ? '登录中' : '登录'}
              </button>
            </form>
          )}
        </div>

        <div className="account-login-bottom">
          <div className="account-login-agreement">
            <button
              className={`account-login-radio${agreed ? ' is-checked' : ''}`}
              type="button"
              role="checkbox"
              aria-checked={agreed}
              aria-label="同意用户和隐私条款"
              onClick={() => setAgreed(value => !value)}
            >
              {agreed ? <span aria-hidden="true">✓</span> : null}
            </button>
            <span>我已阅读并同意</span>
            <button
              className="account-login-terms-link"
              type="button"
              onClick={() => setTermsVisible(true)}
            >
              《用户&amp;隐私条款》
            </button>
          </div>
        </div>
      </section>

      <LoginAgreementDialog
        visible={agreementPromptVisible}
        onCancel={() => setAgreementPromptVisible(false)}
        onAccept={handleAgreementAccepted}
        onOpenTerms={() => setTermsVisible(true)}
      />
      <LoginTermsDialog
        runtime={runtime}
        visible={termsVisible}
        onClose={() => setTermsVisible(false)}
      />
    </main>
  );
}

/** 将登录异常转换为不包含凭据的可读文本。 */
function readErrorMessage(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '登录失败';
}
