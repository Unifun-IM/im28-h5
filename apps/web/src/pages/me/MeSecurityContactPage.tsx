import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type {
  GatewayUser,
  WebIMProfileContactKind,
} from '@im28/im-sdk/web';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAppToast } from '../../components/interaction/index.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { AuthOnboardingRouteGuard } from '../login/AuthOnboardingRouteGuard.js';
import { useAuthOnboarding } from '../login/AuthOnboardingProvider.js';
import { MeProfileHeader } from './MeProfileHeader.js';
import './me-security-page.css';

/** 联系方式页面区分账号安全换绑和完善资料首次绑定。 */
interface MeSecurityContactPageProps {
  readonly kind: WebIMProfileContactKind;
  readonly source: 'security' | 'onboarding';
}

/** 页面阶段显式区分验证当前值和提交新值。 */
type ContactPagePhase = 'loading' | 'verify-current' | 'edit';

/** 复用 RN 联系方式首次绑定与换绑页面状态机。 */
export function MeSecurityContactPage(props: MeSecurityContactPageProps) {
  // content 在 onboarding route guard 内复用同一实现。
  const content = <MeSecurityContactPageContent {...props} />;
  return props.source === 'onboarding'
    ? <AuthOnboardingRouteGuard stage="complete-profile">{content}</AuthOnboardingRouteGuard>
    : content;
}

/** 承载联系方式页面的真实读取、验证阶段和 SDK mutation。 */
function MeSecurityContactPageContent({ kind, source }: MeSecurityContactPageProps) {
  // runtime/snapshot 是认证账号和 profile facade 的唯一来源。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // onboarding owner 只在远端成功后更新联系方式草稿。
  const { profileDraft, updateProfileDraft } = useAuthOnboarding();
  // toast 统一显示真实操作结果和验证码接口缺口。
  const { toast } = useAppToast();
  // navigate 只在验证推进或真实保存成功后切换页面。
  const navigate = useNavigate();
  // securityProfile 保存账号安全入口实时读取的 current-detail。
  const [securityProfile, setSecurityProfile] = useState<GatewayUser | null>(null);
  // phase 防止绑定状态未加载时误进提交页。
  const [phase, setPhase] = useState<ContactPagePhase>(source === 'onboarding' ? 'edit' : 'loading');
  // account 保存待绑定或换绑的新联系方式。
  const [account, setAccount] = useState('');
  // verificationCode 保存当前页面六位验证码。
  const [verificationCode, setVerificationCode] = useState('');
  // saving 阻止重复联系方式 mutation。
  const [saving, setSaving] = useState(false);
  // error 只显示当前页面真实失败，不伪造成功状态。
  const [error, setError] = useState<string | null>(null);

  /** 账号安全入口读取当前联系方式以决定首次绑定或换绑。 */
  const loadSecurityProfile = useCallback(async (): Promise<void> => {
    if (source !== 'security' || !runtime || !snapshot.userID) return;
    setPhase('loading');
    setError(null);
    try {
      // nextProfile 是联系方式绑定状态的唯一远端基线。
      const nextProfile = await runtime.getSync().profile.getCurrent();
      setSecurityProfile(nextProfile);
      setPhase(readBoundContact(nextProfile, kind) ? 'verify-current' : 'edit');
    } catch (cause) {
      setError(readContactError(cause, '账号安全信息加载失败'));
    }
  }, [kind, runtime, snapshot.userID, source]);

  useEffect(() => { void loadSecurityProfile(); }, [loadSecurityProfile]);

  // activeProfile 在两个入口分别使用远端详情或 onboarding 草稿。
  const activeProfile = source === 'security' ? securityProfile : profileDraft;
  // boundContact 是当前手机号或邮箱的真实绑定值。
  const boundContact = readBoundContact(activeProfile, kind);
  // backHref 保持两个流程返回各自入口。
  const backHref = source === 'security' ? '/me/security' : '/auth/complete-profile';
  // isUpdate 只有账号安全入口已有联系方式时成立。
  const isUpdate = source === 'security' && Boolean(boundContact);
  // accountValid 对齐 RN 手机号和邮箱格式约束。
  const accountValid = kind === 'phone'
    ? /^1\d{10}$/.test(account.trim())
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.trim());
  // codeValid 对齐 RN 六位验证码约束。
  const codeValid = verificationCode.trim().length === 6;
  // canSubmit 根据阶段、输入和请求状态启用主按钮。
  const canSubmit = phase === 'verify-current'
    ? codeValid && !saving
    : phase === 'edit' && accountValid && codeValid && !saving;

  /** 验证当前联系方式后进入新值输入阶段。 */
  function continueToNewContact(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!canSubmit) return;
    setVerificationCode('');
    setAccount('');
    setError(null);
    setPhase('edit');
  }

  /** 通过 SDK 唯一分流提交首次绑定或换绑。 */
  async function saveContact(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!runtime || !canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      // result 只有 Gateway 明确成功且响应账号匹配后返回。
      const result = await runtime.getSync().profile.saveContact({
        kind,
        account: account.trim(),
        verificationCode: verificationCode.trim(),
        ...(kind === 'phone' ? { phoneAreaCode: '+86' as const } : {}),
      });
      // savedContact 优先使用服务端回显，兼容只回显账号身份的成功响应。
      const savedContact = readBoundContact(result.profile, kind) || account.trim();
      if (source === 'onboarding') {
        updateProfileDraft(kind === 'phone' ? { phone: savedContact } : { email: savedContact });
      }
      toast.success(result.mode === 'bind' ? '绑定成功' : '换绑成功');
      navigate(backHref, { replace: true });
    } catch (cause) {
      toast.error(readContactError(cause, isUpdate ? '换绑失败' : '绑定失败'));
      setSaving(false);
    }
  }

  /** 明确提示验证码接口尚未开放，不制造已发送假状态。 */
  function showVerificationCodeGap(): void {
    toast.show('验证码发送接口暂未开放，开发环境请使用 666666');
  }

  if (restoring) return <ContactPageState label="正在恢复账号安全信息" />;
  if (!runtime) return <ContactPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (source === 'onboarding' && !profileDraft) return <Navigate to={backHref} replace />;
  if (source === 'onboarding' && boundContact) return <Navigate to={backHref} replace />;
  if (phase === 'loading') return <ContactPageState label="正在加载账号安全信息" detail={error} />;

  // label 是当前联系方式的中文名称。
  const label = kind === 'phone' ? '手机号' : '邮箱';
  // title 对齐 RN 验证、首次绑定与更换三个页面标题。
  const title = phase === 'verify-current'
    ? `验证${label}`
    : `${isUpdate ? '更换' : '绑定'}${label}`;
  return (
    <main className="rn-me-security-page is-form" aria-busy={saving}>
      <section className="rn-me-security-surface">
        <MeProfileHeader title="" backHref={backHref} />
        <form className="rn-me-security-form rn-me-security-contact-form" onSubmit={phase === 'verify-current' ? continueToNewContact : event => void saveContact(event)}>
          <h1>{title}</h1>
          <div className="rn-me-security-fields">
            <label className="rn-me-security-contact-field">
              <span>{label}</span>
              <span className="rn-me-security-contact-input">
                {kind === 'phone' ? <em>+86</em> : null}
                <input type={kind === 'email' ? 'email' : 'tel'} inputMode={kind === 'email' ? 'email' : 'numeric'} autoComplete={kind === 'email' ? 'email' : 'tel'} value={phase === 'verify-current' ? boundContact : account} disabled={phase !== 'edit' || saving} placeholder={kind === 'phone' ? '请输入手机号' : '请输入邮箱'} onChange={event => setAccount(event.target.value)} />
              </span>
            </label>
            <label className="rn-me-security-contact-field">
              <span>验证码</span>
              <span className="rn-me-security-contact-input">
                <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={verificationCode} disabled={saving} placeholder="请输入验证码" onChange={event => setVerificationCode(event.target.value.replace(/\s/g, '').slice(0, 6))} />
                <button type="button" disabled={saving} onClick={showVerificationCodeGap}>获取验证码</button>
              </span>
            </label>
            {error ? <p className="rn-me-security-submit-error" role="alert">{error}</p> : null}
            <button className="rn-me-security-submit" type="submit" disabled={!canSubmit}>{saving ? '提交中' : phase === 'verify-current' ? '下一步' : isUpdate ? '完成修改' : `绑定${label}`}</button>
          </div>
        </form>
      </section>
    </main>
  );
}

/** 从 GatewayUser 或 onboarding 草稿读取指定联系方式。 */
function readBoundContact(profile: { readonly phone?: string; readonly email?: string } | null, kind: WebIMProfileContactKind): string {
  return String(profile?.[kind] ?? '').trim();
}

/** 统一承载联系方式页面启动状态。 */
function ContactPageState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-me-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将共享错误码收敛为账号安全可理解的中文提示。 */
function readContactError(cause: unknown, fallback: string): string {
  // code 只读取 SDK 标准错误对象，不泄漏请求凭据。
  const code = typeof cause === 'object' && cause !== null && 'code' in cause
    ? String((cause as { readonly code?: unknown }).code ?? '')
    : '';
  if (code === 'PROFILE_CONTACT_UNCHANGED') return '新联系方式不能与当前联系方式相同';
  if (code === 'PROFILE_PHONE_INVALID') return '请输入正确的手机号';
  if (code === 'PROFILE_EMAIL_INVALID') return '请输入正确的邮箱';
  if (code === 'PROFILE_CONTACT_CODE_INVALID') return '请输入六位验证码';
  return cause instanceof Error && cause.message ? cause.message : fallback;
}
