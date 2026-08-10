import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { GatewayUser } from '@im28/im-sdk-web';
import { Navigate, useNavigate } from 'react-router-dom';

import { useWebIMRuntime } from '../../runtime/index.js';
import {
  ACCOUNT_CREDENTIAL_ERROR,
  CONFIRM_PASSWORD_MISMATCH_ERROR,
  PASSWORD_CREDENTIAL_ERROR,
  isValidRegistrationAccount,
  isValidRegistrationPassword,
  readAuthError,
} from '../login/auth-login-config.js';
import { MeProfileHeader } from './MeProfileHeader.js';
import { MeSecurityField } from './MeSecurityField.js';
import './me-security-page.css';

/** 账号凭据页只支持首次设置和旧密码重置。 */
interface MeSecurityCredentialPageProps {
  readonly mode: 'account' | 'password';
}

/** 复刻 RN 账号凭据表单并调用 Web runtime 真实 mutation。 */
export function MeSecurityCredentialPage({ mode }: MeSecurityCredentialPageProps) {
  // runtime 同时拥有 Gateway mutation 与 reset 后本地 session cleanup。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // navigate 只在真实成功后切换 route。
  const navigate = useNavigate();
  // profile 决定当前账号是否已设置。
  const [profile, setProfile] = useState<GatewayUser | null>(null);
  // accountDraft 只用于首次设置账号。
  const [accountDraft, setAccountDraft] = useState('');
  // oldPassword 仅供重置接口校验。
  const [oldPassword, setOldPassword] = useState('');
  // password 保存新密码。
  const [password, setPassword] = useState('');
  // confirmPassword 承担一致性校验。
  const [confirmPassword, setConfirmPassword] = useState('');
  // touched 控制 RN 字段错误展示时机。
  const [touched, setTouched] = useState<ReadonlySet<string>>(new Set());
  // loading 表示 current-detail 尚未完成。
  const [loading, setLoading] = useState(false);
  // saving 阻止重复 mutation。
  const [saving, setSaving] = useState(false);
  // error 显示真实 Gateway/runtime 失败。
  const [error, setError] = useState<string | null>(null);

  /** 读取账号绑定状态，阻止错误 route 执行 mutation。 */
  const loadProfile = useCallback(async () => {
    if (!runtime || !snapshot.userID) return;
    setLoading(true);
    try {
      setProfile(await runtime.getSync().profile.getCurrent());
    } catch (cause) {
      setError(readAuthError(cause, '账号安全信息加载失败'));
    } finally {
      setLoading(false);
    }
  }, [runtime, snapshot.userID]);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  // boundAccount 决定 route 是否与当前账号状态匹配。
  const boundAccount = String(profile?.account ?? '').trim();
  // accountValid 对齐 RN 8-24 可见 ASCII 规则。
  const accountValid = mode === 'password' || isValidRegistrationAccount(accountDraft.trim());
  // passwordValid 对齐 RN 字母与数字组合规则。
  const passwordValid = isValidRegistrationPassword(password);
  // confirmValid 同时要求格式正确且两次一致。
  const confirmValid = isValidRegistrationPassword(confirmPassword) && password === confirmPassword;
  // oldPasswordValid 对齐 RN 仅要求原密码非空。
  const oldPasswordValid = mode === 'account' || oldPassword.trim().length > 0;
  // canSubmit 聚合 route、字段和请求状态。
  const canSubmit = Boolean(runtime && profile) && accountValid && passwordValid && confirmValid && oldPasswordValid && !loading && !saving;

  /** 标记字段已离焦或经历提交。 */
  const markTouched = useCallback((field: string) => {
    setTouched(current => new Set([...current, field]));
  }, []);

  /** 提交真实 set/reset operation，并按 session 语义导航。 */
  async function submitCredential(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setTouched(new Set(['account', 'oldPassword', 'password', 'confirmPassword']));
    if (!runtime || !canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      if (mode === 'account') {
        await runtime.setAccountPassword({ account: accountDraft.trim(), password });
        navigate('/me/security', { replace: true });
      } else {
        await runtime.resetPassword({ old_password: oldPassword, password });
        navigate('/auth/account', { replace: true });
      }
    } catch (cause) {
      setError(readAuthError(cause, '设置失败'));
      setSaving(false);
    }
  }

  if (restoring) return <CredentialPageState label="正在恢复账号安全信息" />;
  if (!runtime) return <CredentialPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to={mode === 'password' ? '/auth/account' : '/login'} replace />;
  if (profile && mode === 'account' && boundAccount) return <Navigate to="/me/security" replace />;
  if (profile && mode === 'password' && !boundAccount) return <Navigate to="/me/security/account" replace />;

  // title 对齐 RN 表单主标题。
  const title = mode === 'account' ? '设置账号密码' : `账号：${boundAccount || snapshot.userID}`;
  // accountError 只在触达后展示。
  const accountError = touched.has('account') && accountDraft && !accountValid ? ACCOUNT_CREDENTIAL_ERROR : '';
  // passwordError 只在触达后展示。
  const passwordError = touched.has('password') && password && !passwordValid ? PASSWORD_CREDENTIAL_ERROR : '';
  // confirmError 先提示格式，再提示不一致。
  const confirmError = touched.has('confirmPassword') && confirmPassword
    ? !isValidRegistrationPassword(confirmPassword) ? PASSWORD_CREDENTIAL_ERROR
      : password !== confirmPassword ? CONFIRM_PASSWORD_MISMATCH_ERROR : ''
    : '';
  return (
    <main className="rn-me-security-page is-form">
      <section className="rn-me-security-surface">
        <MeProfileHeader title="" backHref="/me/security" />
        <form className="rn-me-security-form" onSubmit={event => void submitCredential(event)}>
          <h1>{title}</h1>
          <div className="rn-me-security-fields">
            {mode === 'account' ? <MeSecurityField id="security-account" value={accountDraft} placeholder="请输入账号" disabled={saving} error={accountError} onBlur={() => markTouched('account')} onChange={setAccountDraft} /> : null}
            {mode === 'password' ? <MeSecurityField id="security-old-password" value={oldPassword} placeholder="请输入原密码" secure disabled={saving} onBlur={() => markTouched('oldPassword')} onChange={setOldPassword} /> : null}
            <MeSecurityField id="security-password" value={password} placeholder={mode === 'account' ? '请输入密码' : '请输入新密码'} secure disabled={saving} error={passwordError} onBlur={() => markTouched('password')} onChange={setPassword} />
            <MeSecurityField id="security-confirm-password" value={confirmPassword} placeholder={mode === 'account' ? '请再次输入密码' : '请再次输入新密码'} secure disabled={saving} error={confirmError} onBlur={() => markTouched('confirmPassword')} onChange={setConfirmPassword} />
            {error ? <p className="rn-me-security-submit-error" role="alert">{error}</p> : null}
            <button className="rn-me-security-submit" type="submit" disabled={!canSubmit}>{saving ? '设置中' : '设置'}</button>
          </div>
        </form>
      </section>
    </main>
  );
}

/** 统一承载账号凭据页启动状态。 */
function CredentialPageState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-me-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}
