import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useWebIMRuntime } from '../../runtime/index.js';
import { AuthOnboardingRouteGuard } from './AuthOnboardingRouteGuard.js';
import { useAuthOnboarding } from './AuthOnboardingProvider.js';
import { readAuthError } from './auth-login-config.js';
import './auth-invite-page.css';

// RN 邀请码固定为四位大写字母或数字。
const INVITE_CODE_LENGTH = 4;

/** RN 邀请码页面只重试内存中的真实 register request。 */
export function AuthInvitePage() {
  // runtime 仍是 register/session 的唯一 owner。
  const { runtime } = useWebIMRuntime();
  // onboarding context 提供刷新即失效的 pending request。
  const { pendingRegistration, markProfileRequired } = useAuthOnboarding();
  // navigate 只在真实注册成功后进入资料完善。
  const navigate = useNavigate();
  // code 保存本页四位邀请码。
  const [code, setCode] = useState('');
  // submitting 阻止重复 register。
  const [submitting, setSubmitting] = useState(false);
  // error 显示真实 register retry 失败。
  const [error, setError] = useState<string | null>(null);

  /** 规范邀请码输入但不声明其本地有效。 */
  function updateCode(value: string): void {
    setCode(value.replace(/[^0-9a-zA-Z]/g, '').slice(0, INVITE_CODE_LENGTH).toUpperCase());
    setError(null);
  }

  /** 使用原注册请求和可选 invite_code 重试 Gateway register。 */
  async function submitInvite(inviteCode: string): Promise<void> {
    if (!runtime || !pendingRegistration || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      // registeredSnapshot 只在后端确认注册成功后返回。
      const registeredSnapshot = await runtime.register({
        ...pendingRegistration.request,
        ...(inviteCode ? { invite_code: inviteCode } : {}),
      });
      if (!registeredSnapshot.userID) throw new Error('注册成功但未返回用户 ID。');
      markProfileRequired(registeredSnapshot.userID, pendingRegistration.sourceMode);
      navigate('/auth/complete-profile', { replace: true });
    } catch (cause) {
      setError(readAuthError(cause, '注册失败'));
      setSubmitting(false);
    }
  }

  /** 提交四位邀请码。 */
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (code.length === INVITE_CODE_LENGTH) void submitInvite(code);
  }

  // canConfirm 只表示输入长度满足请求条件。
  const canConfirm = code.length === INVITE_CODE_LENGTH && !submitting;
  return (
    <AuthOnboardingRouteGuard stage="invite">
      <main className="auth-onboarding-overlay">
        <form className="auth-invite-card" onSubmit={handleSubmit}>
          <div className="auth-invite-content">
            <header><h1>邀请码</h1><p>你可以找你的朋友索要邀请码.</p></header>
            <label className="auth-invite-code">
              <span className="sr-only">四位邀请码</span>
              <input autoFocus autoCapitalize="characters" autoComplete="off" maxLength={INVITE_CODE_LENGTH} value={code} disabled={submitting} onChange={event => updateCode(event.target.value)} />
              <span aria-hidden="true">{Array.from({ length: INVITE_CODE_LENGTH }, (_, index) => <b key={index}>{code[index] ?? ''}</b>)}</span>
            </label>
            {error ? <p className="auth-onboarding-error" role="alert">{error}</p> : null}
          </div>
          <footer>
            <button type="button" disabled={submitting} onClick={() => void submitInvite('')}>暂无邀请码</button>
            <button className="is-primary" type="submit" disabled={!canConfirm}>{submitting ? '提交中' : '确认'}</button>
          </footer>
        </form>
      </main>
    </AuthOnboardingRouteGuard>
  );
}
