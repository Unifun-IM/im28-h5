import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { GatewayUser } from '@im28/im-sdk-web';
import { Link, Navigate } from 'react-router-dom';

import backgroundImageURL from '../../assets/rn/assets/my/bg.jpg';
import arrowIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import copyIconURL from '../../assets/rn/assets/icons/imm28/copy.dynamic.svg';
import settingsIconURL from '../../assets/rn/assets/icons/imm28/set.svg';
import profileIconURL from '../../assets/rn/assets/icons/imm28/user.svg';
import securityIconURL from '../../assets/rn/assets/icons/imm28/lock.svg';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import './me-page.css';

/** RN 个人中心首页只呈现已有真实 owner 的资料和设置入口。 */
export function MePage() {
  // runtime context 是页面唯一 SDK 入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // profile 保存 Gateway 当前用户详情，不使用本地假数据回退。
  const [profile, setProfile] = useState<GatewayUser | null>(null);
  // loading 覆盖 current-detail 请求。
  const [loading, setLoading] = useState(false);
  // error 保留真实 Gateway 错误并支持重试。
  const [error, setError] = useState<string | null>(null);
  // copied 短暂反馈 ID 已复制。
  const [copied, setCopied] = useState(false);

  /** 通过 Web runtime facade 读取当前账号资料。 */
  const loadProfile = useCallback(async () => {
    if (!runtime || !snapshot.userID) return;
    setLoading(true);
    setError(null);
    try {
      // nextProfile 直接来自共享 Gateway current-detail contract。
      const nextProfile = await runtime.getSync().profile.getCurrent();
      setProfile(nextProfile);
    } catch (cause) {
      setError(readProfileError(cause));
    } finally {
      setLoading(false);
    }
  }, [runtime, snapshot.userID]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  /** 使用浏览器剪贴板复制真实用户 ID。 */
  const copyUserID = useCallback(async () => {
    // userID 优先使用详情字段，并以认证 snapshot 保底。
    const userID = profile?.user_id?.trim() || snapshot.userID || '';
    if (!userID) return;
    try {
      await navigator.clipboard.writeText(userID);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (cause) {
      setError(readProfileError(cause));
    }
  }, [profile?.user_id, snapshot.userID]);

  // displayName 对齐 RN nickname -> user ID 的回退顺序。
  const displayName = profile?.nickname?.trim() || profile?.user_id?.trim() || snapshot.userID || '';
  // userID 仅显示服务端或认证 runtime 的真实身份。
  const userID = profile?.user_id?.trim() || snapshot.userID || '';
  // avatarStyle 复用 RN 稳定头像渐变。
  const avatarStyle = useMemo(() => ({
    '--me-avatar-gradient': getRNAvatarGradient(userID),
  }) as CSSProperties, [userID]);
  // heroStyle 使用 RN 字节镜像背景图。
  const heroStyle = useMemo(() => ({ backgroundImage: `url("${backgroundImageURL}")` }), []);

  if (restoring) return <MePageState label="正在恢复个人资料" />;
  if (!runtime) return <MePageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main className="rn-me-page">
      <section className="rn-me-surface" aria-busy={loading}>
        <header className="rn-me-hero" style={heroStyle}>
          <span className="rn-me-avatar" style={avatarStyle}>
            <span>{getRNAvatarInitial(displayName)}</span>
            {profile?.avatar_url?.trim() ? (
              <img src={profile.avatar_url} alt="" onError={event => { event.currentTarget.hidden = true; }} />
            ) : null}
          </span>
          <div className="rn-me-identity">
            <strong>{displayName || '加载中'}</strong>
            <button type="button" disabled={!userID} onClick={() => void copyUserID()}>
              <span>ID：{userID || '--'}</span>
              <RNAssetIcon assetURL={copyIconURL} />
            </button>
          </div>
          {loading ? <span className="rn-me-spinner" aria-label="正在加载" /> : null}
        </header>
        <section className="rn-me-panel">
          {error ? (
            <div className="rn-me-error" role="status">
              <span>{error}</span>
              <button type="button" onClick={() => void loadProfile()}>重试</button>
            </div>
          ) : null}
          {copied ? <p className="rn-me-copy-state" role="status">已复制</p> : null}
          <div className="rn-me-menu-card">
            <Link className="rn-me-menu-row" to="/me/profile">
              <RNAssetIcon assetURL={profileIconURL} />
              <span>个人资料</span>
              <RNAssetIcon assetURL={arrowIconURL} />
            </Link>
            <Link className="rn-me-menu-row" to="/me/security">
              <RNAssetIcon assetURL={securityIconURL} />
              <span>账号安全</span>
              <RNAssetIcon assetURL={arrowIconURL} />
            </Link>
            <Link className="rn-me-menu-row" to="/me/settings">
              <RNAssetIcon assetURL={settingsIconURL} />
              <span>通用设置</span>
              <RNAssetIcon assetURL={arrowIconURL} />
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

/** 统一承载个人中心启动和配置状态。 */
function MePageState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return (
    <main className="rn-me-page-state">
      <strong>{label}</strong>
      {detail ? <span>{detail}</span> : null}
    </main>
  );
}

/** 将未知异常收敛为不包含凭据的页面消息。 */
function readProfileError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '个人资料加载失败';
}
