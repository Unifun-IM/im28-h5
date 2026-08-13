import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import countryChevronURL from '../../assets/rn/assets/icons/imm28/country-code-chevron.svg';
import clearIconURL from '../../assets/rn/screens/auth/assets/clear-icon.svg';
import eyeClosedIconURL from '../../assets/rn/screens/auth/assets/eye-closed-icon.svg';
import eyeIconURL from '../../assets/rn/screens/auth/assets/eye-icon.svg';
import startupLogoURL from '../../assets/rn/screens/auth/assets/startup-logo.png';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { AuthAgreement } from './AuthAgreement.js';
import { AuthCountryCodeDialog } from './AuthCountryCodeDialog.js';
import { AuthLoginMethodSection } from './AuthLoginMethodSection.js';
import { useAuthOnboarding } from './AuthOnboardingProvider.js';
import {
  AUTH_COUNTRY_CODES,
  AUTH_LOGIN_COPY,
  SUPPORTED_PHONE_AREA_CODE,
  isValidEmail,
  isValidPhoneNumber,
  readAuthError,
  type AuthCountryCode,
  type AuthLoginMode,
} from './auth-login-config.js';
import {
  createAuthLoginRequest,
  createAuthRegisterRequest,
  submitAuthLogin,
} from './auth-login-submission.js';
import { LoginAgreementDialog } from './LoginAgreementDialog.js';
import { ForgotPasswordMethodsDialog } from './ForgotPasswordMethodsDialog.js';
import { LoginTermsDialog } from './LoginTermsDialog.js';
import './login-page.css';

/** Route 注入的登录方式参数。 */
interface LoginPageProps {
  readonly mode: AuthLoginMode;
}

/** RN 默认国家码始终是中国大陆。 */
const DEFAULT_COUNTRY_CODE = AUTH_COUNTRY_CODES[0] as AuthCountryCode;

/** 手机号、邮箱、账号三种 RN 登录页的 Web 编排 owner。 */
export function LoginPage({ mode }: LoginPageProps) {
  // runtime context 不暴露任何 token 字段。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // navigate 只负责认证成功后的 SPA replace。
  const navigate = useNavigate();
  // onboarding owner 区分普通登录与新注册后的下一 route。
  const { marker, markProfileRequired, setPendingRegistration } = useAuthOnboarding();
  // copy 由当前稳定 route mode 决定。
  const copy = AUTH_LOGIN_COPY[mode];
  // account 保存手机号、邮箱或账号输入。
  const [account, setAccount] = useState('');
  // credential 保存验证码或账号密码。
  const [credential, setCredential] = useState('');
  // credentialVisible 只对账号密码模式生效。
  const [credentialVisible, setCredentialVisible] = useState(false);
  // countryCode 保持 RN 国家码选择状态。
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  // countryPickerVisible 控制手机号国家码 modal。
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  // agreed 只记录当前 route 生命周期内的条款确认。
  const [agreed, setAgreed] = useState(false);
  // termsVisible 控制真实平台条款查看器。
  const [termsVisible, setTermsVisible] = useState(false);
  // agreementPromptVisible 复刻提交前二次确认。
  const [agreementPromptVisible, setAgreementPromptVisible] = useState(false);
  // forgotPasswordVisible 控制 RN 忘记密码替代登录方式 sheet。
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  // submitting 防止重复认证请求。
  const [submitting, setSubmitting] = useState(false);
  // error 显示真实 Gateway 或能力缺口错误。
  const [error, setError] = useState<string | null>(null);
  // notice 只说明当前 Gateway 固定验证码 contract，不声称已发送。
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!submitting && snapshot.userID) {
      navigate(marker?.userID === snapshot.userID ? '/auth/complete-profile' : '/conversations', { replace: true });
    }
  }, [marker?.userID, navigate, snapshot.userID, submitting]);

  useEffect(() => {
    setCredential('');
    setError(null);
    setNotice(null);
    setForgotPasswordVisible(false);
  }, [mode]);

  /** 执行登录；手机号/邮箱仅在 20002 时进入真实自动注册。 */
  async function submitAuthentication(): Promise<void> {
    if (!runtime || submitting) return;
    setSubmitting(true);
    setError(null);
    // result 将 login/register/invite 分支收敛为页面可处理状态。
    // requestInput 保持 login/register 字段来自同一表单快照。
    const requestInput = {
      mode,
      account,
      credential,
      phoneAreaCode: countryCode.dialCode,
    };
    // result 执行共享 Gateway login/register 分支。
    const result = await submitAuthLogin({
      runtime,
      mode,
      loginRequest: createAuthLoginRequest(requestInput),
      registerRequest: createAuthRegisterRequest(requestInput),
    });
    if (result.type === 'authenticated') {
      setSubmitting(false);
      navigate('/conversations', { replace: true });
      return;
    }
    if (result.type === 'registered') {
      markProfileRequired(result.userID, mode);
      setSubmitting(false);
      navigate('/auth/complete-profile', { replace: true });
      return;
    }
    if (result.type === 'invite-required') {
      setPendingRegistration({ sourceMode: result.sourceMode, request: result.request });
      setSubmitting(false);
      navigate(`/auth/invite?from=${result.sourceMode}`, { replace: false });
      return;
    }
    setError(readAuthError(result.cause, '登录失败'));
    setSubmitting(false);
  }

  /** 校验协议状态后提交当前 route 对应认证请求。 */
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!canSubmit) return;
    if (!agreed) {
      setAgreementPromptVisible(true);
      return;
    }
    void submitAuthentication();
  }

  /** 接受二次确认后沿原请求继续。 */
  function handleAgreementAccepted(): void {
    setAgreed(true);
    setAgreementPromptVisible(false);
    void submitAuthentication();
  }

  /** 验证码发送端点缺失时只说明联调 contract，不制造成功态。 */
  function handleVerificationCodeRequest(): void {
    if (!accountValid) {
      setError(mode === 'phone' ? '请输入正确的手机号' : '请输入正确的邮箱');
      return;
    }
    if (mode === 'phone' && countryCode.dialCode !== SUPPORTED_PHONE_AREA_CODE) {
      setError('手机号格式错误');
      return;
    }
    setError(null);
    setNotice('当前联调阶段 Gateway 未提供验证码发送接口，请直接输入 666666。');
  }

  /** 手机号输入只保留数字，其他登录方式保留原始字符。 */
  function handleAccountChange(value: string): void {
    setAccount(mode === 'phone' ? value.replace(/\D/g, '') : value);
    setError(null);
    setNotice(null);
  }

  /** 验证码限制为 6 位数字，密码保持原始输入。 */
  function handleCredentialChange(value: string): void {
    setCredential(mode === 'account' ? value : value.replace(/\D/g, '').slice(0, 6));
    setError(null);
  }

  // accountValid 对齐三种 RN 输入校验。
  const accountValid = mode === 'phone'
    ? isValidPhoneNumber(account, countryCode.dialCode)
    : mode === 'email'
      ? isValidEmail(account)
      : account.trim().length > 0;
  // credentialValid 对齐验证码 6 位或非空密码规则。
  const credentialValid = mode === 'account' ? credential.length > 0 : credential.length === 6;
  // canSubmit 同时受 runtime、恢复状态和重复提交保护。
  const canSubmit = Boolean(runtime) && accountValid && credentialValid && !restoring && !submitting;
  // blockingError 只在 runtime 未创建时替换整个表单。
  const blockingError = startupError && !runtime ? startupError : null;

  return (
    <main className="auth-page">
      <section className="auth-surface" aria-labelledby="auth-login-title">
        <div className="auth-navbar" aria-hidden="true" />
        <div className="auth-content">
          <header className="auth-hero">
            <img className="auth-logo" src={startupLogoURL} alt="" />
            <h1 id="auth-login-title">{copy.title}</h1>
            <p>{copy.subtitle}</p>
          </header>

          {blockingError ? (
            <div className="auth-runtime-error" role="alert">
              <strong>运行配置不可用</strong><span>{blockingError}</span>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-inputs">
                <div className="auth-input-shell">
                  {mode === 'phone' ? (
                    <button className="auth-country-trigger" type="button" onClick={() => setCountryPickerVisible(true)}>
                      <span>{countryCode.dialCode}</span>
                      <RNAssetIcon assetURL={countryChevronURL} />
                    </button>
                  ) : null}
                  {mode === 'phone' ? <span className="auth-input-divider" aria-hidden="true" /> : null}
                  <label className="sr-only" htmlFor={`auth-${mode}-account`}>{copy.accountPlaceholder}</label>
                  <input
                    id={`auth-${mode}-account`}
                    autoCapitalize="none"
                    autoComplete={mode === 'account' ? 'username' : mode === 'email' ? 'email' : 'tel'}
                    inputMode={copy.accountInputMode}
                    maxLength={mode === 'phone' ? (countryCode.dialCode === '+86' ? 11 : 15) : undefined}
                    placeholder={copy.accountPlaceholder}
                    value={account}
                    disabled={restoring || submitting}
                    onChange={event => handleAccountChange(event.target.value)}
                  />
                  {account ? (
                    <button className="auth-input-action is-clear" type="button" aria-label="清空输入" onClick={() => handleAccountChange('')}>
                      <img src={clearIconURL} alt="" />
                    </button>
                  ) : null}
                </div>

                <div className="auth-input-shell">
                  <label className="sr-only" htmlFor={`auth-${mode}-credential`}>
                    {mode === 'account' ? '密码' : '验证码'}
                  </label>
                  <input
                    id={`auth-${mode}-credential`}
                    autoComplete={mode === 'account' ? 'current-password' : 'one-time-code'}
                    inputMode={mode === 'account' ? 'text' : 'numeric'}
                    maxLength={mode === 'account' ? undefined : 6}
                    placeholder={mode === 'account' ? '请输入密码' : '请输入验证码'}
                    type={mode === 'account' && !credentialVisible ? 'password' : 'text'}
                    value={credential}
                    disabled={restoring || submitting}
                    onChange={event => handleCredentialChange(event.target.value)}
                  />
                  {credential ? (
                    <button className="auth-input-action is-clear" type="button" aria-label="清空输入" onClick={() => handleCredentialChange('')}>
                      <img src={clearIconURL} alt="" />
                    </button>
                  ) : null}
                  {mode === 'account' ? (
                    <button className="auth-input-action is-eye" type="button" aria-label={credentialVisible ? '隐藏密码' : '显示密码'} onClick={() => setCredentialVisible(visible => !visible)}>
                      <img src={credentialVisible ? eyeIconURL : eyeClosedIconURL} alt="" />
                    </button>
                  ) : (
                    <>
                      <span className="auth-code-divider" aria-hidden="true" />
                      <button className="auth-code-button" type="button" disabled={!accountValid} onClick={handleVerificationCodeRequest}>
                        发送验证码
                      </button>
                    </>
                  )}
                </div>
              </div>

              {mode === 'account' ? (
                <div className="auth-assist-row">
                  <button type="button" onClick={() => setForgotPasswordVisible(true)}>忘记密码？</button>
                  <Link to="/auth/register">注册账号</Link>
                </div>
              ) : null}
              {notice ? <p className="auth-notice" role="status">{notice}</p> : null}
              {startupError ? <p className="auth-error" role="alert">{startupError}</p> : null}
              {error ? <p className="auth-error" role="alert">{error}</p> : null}
              <button className="auth-submit" type="submit" disabled={!canSubmit}>
                {restoring ? '恢复会话中' : submitting ? '提交中' : mode === 'account' ? '登录' : '验证并登录'}
              </button>
              <AuthLoginMethodSection currentMode={mode} />
            </form>
          )}
        </div>

        <footer className="auth-bottom">
          <AuthAgreement agreed={agreed} onToggle={() => setAgreed(value => !value)} onOpenTerms={() => setTermsVisible(true)} />
        </footer>
      </section>

      <AuthCountryCodeDialog visible={countryPickerVisible} value={countryCode} onClose={() => setCountryPickerVisible(false)} onSelect={setCountryCode} />
      <ForgotPasswordMethodsDialog visible={forgotPasswordVisible} onClose={() => setForgotPasswordVisible(false)} onPhone={() => { setForgotPasswordVisible(false); navigate('/auth/phone'); }} onEmail={() => { setForgotPasswordVisible(false); navigate('/auth/email'); }} />
      <LoginAgreementDialog visible={agreementPromptVisible} onCancel={() => setAgreementPromptVisible(false)} onAccept={handleAgreementAccepted} onOpenTerms={() => setTermsVisible(true)} />
      <LoginTermsDialog runtime={runtime} visible={termsVisible} onClose={() => setTermsVisible(false)} />
    </main>
  );
}
