import { useCallback, useEffect, useState } from 'react';
import type { GatewayUser } from '@im28/im-sdk-web';
import { Link, Navigate } from 'react-router-dom';

import arrowIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { MeProfileHeader } from './MeProfileHeader.js';
import './me-security-page.css';

/** RN 账号安全总览读取真实联系方式与账号绑定状态。 */
export function MeSecurityPage() {
  // runtime context 是 current-detail 的唯一页面入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // profile 保存 Gateway 当前用户详情。
  const [profile, setProfile] = useState<GatewayUser | null>(null);
  // loading 覆盖 current-detail 请求。
  const [loading, setLoading] = useState(false);
  // error 显示真实读取失败。
  const [error, setError] = useState<string | null>(null);

  /** 读取账号安全总览所需真实字段。 */
  const loadProfile = useCallback(async () => {
    if (!runtime || !snapshot.userID) return;
    setLoading(true);
    setError(null);
    try {
      setProfile(await runtime.getSync().profile.getCurrent());
    } catch (cause) {
      setError(readSecurityError(cause, '账号安全信息加载失败'));
    } finally {
      setLoading(false);
    }
  }, [runtime, snapshot.userID]);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  if (restoring) return <SecurityPageState label="正在恢复账号安全信息" />;
  if (!runtime) return <SecurityPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  // phoneDisplay 对齐 RN 区号与手机号组合格式。
  const phone = String(profile?.phone ?? '').trim();
  // areaCode 只在服务端真实返回时显示。
  const areaCode = String(profile?.phone_area_code ?? '').trim();
  // phoneDisplay 不对空字段制造默认号码。
  const phoneDisplay = phone ? `${areaCode ? `${areaCode} ` : ''}${phone}` : '未绑定';
  // email 只展示服务端真实绑定值。
  const email = String(profile?.email ?? '').trim() || '未绑定';
  // account 决定首次设置或旧密码重置 route。
  const account = String(profile?.account ?? '').trim();
  return (
    <main className="rn-me-security-page" aria-busy={loading}>
      <section className="rn-me-security-surface">
        <MeProfileHeader title="账号安全" backHref="/me" />
        <div className="rn-me-security-content">
          {error ? <div className="rn-me-security-error" role="status"><span>{error}</span><button type="button" onClick={() => void loadProfile()}>重试</button></div> : null}
          <div className="rn-me-security-card">
            <SecurityStaticRow label="手机号" value={phoneDisplay} />
            <SecurityStaticRow label="邮箱" value={email} />
            <Link className="rn-me-security-row" to={account ? '/me/security/password' : '/me/security/account'}>
              <span>{account ? '重置密码' : '账号密码'}</span><strong>{account}</strong><RNAssetIcon assetURL={arrowIconURL} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/** 只读联系方式行不渲染尚无完整验证码 owner 的箭头。 */
function SecurityStaticRow({ label, value }: { readonly label: string; readonly value: string }) {
  return <div className="rn-me-security-row is-static"><span>{label}</span><strong>{value}</strong></div>;
}

/** 统一承载账号安全启动状态。 */
function SecurityPageState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-me-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 收敛账号安全异常且不泄漏凭据。 */
function readSecurityError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}
