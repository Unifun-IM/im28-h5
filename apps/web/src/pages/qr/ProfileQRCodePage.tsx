import { useCallback, useEffect, useState } from 'react';
import { buildIM28UserQRCodePayload, type GatewayUser } from '@im28/im-sdk/web';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import { useWebIMRuntime } from '../../runtime/index.js';
import { QRCodeDisplay } from './QRCodeDisplay.js';
import { readProfileQRCodeBackHref } from './qr-route.js';

/** RN 当前用户二维码页只消费真实资料和 shared payload builder。 */
export default function ProfileQRCodePage() {
  /** runtime 提供认证态和当前资料 facade。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** location 只用于读取已登记的返回入口。 */
  const location = useLocation();
  /** navigate 负责下载以外的 SPA 页面切换。 */
  const navigate = useNavigate();
  /** profile 保存 Gateway current-detail 的真实展示字段。 */
  const [profile, setProfile] = useState<GatewayUser | null>(null);
  /** loading 覆盖真实资料读取过程。 */
  const [loading, setLoading] = useState(false);
  /** error 显示真实资料读取错误。 */
  const [error, setError] = useState<string | null>(null);
  /** backHref 对扫码与个人中心入口进行严格白名单恢复。 */
  const backHref = readProfileQRCodeBackHref(location.state);
  /** userID 以资料返回值为主并以当前认证身份保底。 */
  const userID = profile?.user_id?.trim() || snapshot.userID || '';
  /** displayName 对齐 RN 昵称到用户 ID 的回退。 */
  const displayName = profile?.nickname?.trim() || userID;
  /** 加载真实当前资料，二维码渲染交给唯一展示组件。 */
  const loadProfileQRCode = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID) return;
    setLoading(true);
    setError(null);
    try {
      /** nextProfile 直接来自当前账号 profile facade。 */
      const nextProfile = await runtime.getSync().profile.getCurrent();
      setProfile(nextProfile);
    } catch (cause) {
      setError(readProfileQRCodeError(cause));
    } finally {
      setLoading(false);
    }
  }, [runtime, snapshot.userID]);

  useEffect(() => { void loadProfileQRCode(); }, [loadProfileQRCode]);

  if (restoring) return <ProfileQRCodeState label="正在恢复二维码" />;
  if (!runtime) return <ProfileQRCodeState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  if (loading && !profile) return <ProfileQRCodeState label="正在加载二维码" />;
  if (!userID) return <ProfileQRCodeState label="二维码加载失败" detail={error} />;
  return <QRCodeDisplay kind="user" identity={userID} displayName={displayName} avatarURL={profile?.avatar_url ?? ''} payload={buildIM28UserQRCodePayload(userID)} idLabel="ID" hint="使用28 APP 扫描此二维码，加好友" closeLabel="关闭二维码" sourceError={error} onClose={() => navigate(backHref)} onScan={() => navigate('/scan', { state: { backHref: '/me/qrcode' } })} onShare={() => navigate('/me/qrcode/share')} />;
}

/** 统一承载认证恢复与运行配置错误。 */
function ProfileQRCodeState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-qr-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将未知异常收敛为不包含身份凭据的页面消息。 */
function readProfileQRCodeError(cause: unknown, fallback = '二维码加载失败'): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}
