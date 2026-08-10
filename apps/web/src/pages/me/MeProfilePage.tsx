import { useCallback, useEffect, useState } from 'react';
import type { GatewayUser } from '@im28/im-sdk-web';
import { Link, Navigate } from 'react-router-dom';

import arrowIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { MeProfileHeader } from './MeProfileHeader.js';
import { getProfileGenderLabel, normalizeProfileBio } from './profile-edit-view.js';
import './me-profile-page.css';

/** RN 个人资料总览仅公开已具备真实编辑 owner 的字段。 */
export function MeProfilePage() {
  // runtime context 是资料读取唯一 SDK 入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // profile 保存 current-detail 返回的真实资料。
  const [profile, setProfile] = useState<GatewayUser | null>(null);
  // loading 覆盖资料请求。
  const [loading, setLoading] = useState(false);
  // error 保留真实请求错误。
  const [error, setError] = useState<string | null>(null);

  /** 从 profile facade 重读当前资料。 */
  const loadProfile = useCallback(async () => {
    if (!runtime || !snapshot.userID) return;
    setLoading(true);
    setError(null);
    try {
      setProfile(await runtime.getSync().profile.getCurrent());
    } catch (cause) {
      setError(readProfilePageError(cause));
    } finally {
      setLoading(false);
    }
  }, [runtime, snapshot.userID]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  if (restoring) return <ProfilePageState label="正在恢复个人资料" />;
  if (!runtime) return <ProfilePageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  // userID 以 current-detail 为主并用认证 identity 保底。
  const userID = profile?.user_id?.trim() || snapshot.userID;
  // nickname 对齐 RN 用户 ID 回退。
  const nickname = profile?.nickname?.trim() || userID;
  // bio 对齐 RN trim/截断规则。
  const bio = normalizeProfileBio(profile?.bio);
  return (
    <main className="rn-me-profile-page" aria-busy={loading}>
      <section className="rn-me-profile-surface">
        <MeProfileHeader title="个人资料" backHref="/me" />
        <div className="rn-me-profile-content">
          {error ? <div className="rn-me-profile-error" role="status">
            <span>{error}</span>
            <button type="button" onClick={() => void loadProfile()}>重试</button>
          </div> : null}
          <div className="rn-me-profile-card">
            <ProfileLinkRow label="昵称" value={nickname} href="/me/profile/nickname" />
            <ProfileLinkRow label="性别" value={getProfileGenderLabel(profile?.gender)} href="/me/profile/gender" />
            <div className="rn-me-profile-row is-static"><span>ID</span><strong>{userID}</strong></div>
            <ProfileLinkRow label="个性签名" value={bio || '未设置'} href="/me/profile/bio" last />
          </div>
        </div>
      </section>
    </main>
  );
}

/** 资料总览的可编辑字段行参数。 */
interface ProfileLinkRowProps {
  readonly label: string;
  readonly value: string;
  readonly href: string;
  readonly last?: boolean;
}

/** 渲染 RN 56px 字段行并交给 React Router 导航。 */
function ProfileLinkRow({ label, value, href, last = false }: ProfileLinkRowProps) {
  return (
    <Link className={`rn-me-profile-row${last ? ' is-last' : ''}`} to={href}>
      <span>{label}</span><strong>{value}</strong><RNAssetIcon assetURL={arrowIconURL} />
    </Link>
  );
}

/** 统一承载个人资料启动和配置状态。 */
function ProfilePageState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-me-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将未知异常收敛为不含凭据的页面消息。 */
function readProfilePageError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '个人资料加载失败';
}
