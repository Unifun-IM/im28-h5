import { useCallback, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import arrowIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { useWebThemePreference } from '../../runtime/theme-preference.js';
import './me-page.css';
import './me-settings-page.css';

/** RN 通用设置当前只恢复具备完整 runtime owner 的退出登录操作。 */
export function MeSettingsPage() {
  // runtime context 持有远端 logout 与本地清理闭环。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // navigate 在退出完成后 replace 到认证入口。
  const navigate = useNavigate();
  // confirming 控制 RN 对应的退出确认弹层。
  const [confirming, setConfirming] = useState(false);
  // signingOut 阻止重复退出提交。
  const [signingOut, setSigningOut] = useState(false);
  // error 显示本地数据库关闭等不能吞掉的失败。
  const [error, setError] = useState<string | null>(null);
  // themeSnapshot 显示当前 RN 同源主题偏好。
  const themeSnapshot = useWebThemePreference();

  /** 调用唯一 Web runtime 退出链并替换当前历史记录。 */
  const signOut = useCallback(async () => {
    if (!runtime || signingOut) return;
    setSigningOut(true);
    setError(null);
    try {
      await runtime.signOut();
      navigate('/auth/phone', { replace: true });
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : '退出登录失败');
      setSigningOut(false);
      setConfirming(false);
    }
  }, [navigate, runtime, signingOut]);

  if (restoring) return <SettingsPageState label="正在恢复设置" />;
  if (!runtime) return <SettingsPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main className="rn-me-settings-page">
      <section className="rn-me-settings-surface">
        <header className="rn-me-settings-header">
          <Link to="/me" aria-label="返回个人中心"><RNAssetIcon assetURL={backIconURL} /></Link>
          <h1>通用设置</h1>
          <span />
        </header>
        <div className="rn-me-settings-content">
          {error ? <p className="rn-me-settings-error" role="status">{error}</p> : null}
          <SettingsLinkRow
            label="显示"
            value={themeSnapshot.preference === 'system' ? '跟随系统' : themeSnapshot.mode === 'light' ? '浅色模式' : '深色模式'}
            href="/me/settings/display"
          />
          <div className="rn-me-settings-card is-gap">
            <SettingsLinkRow label="通知" href="/me/settings/notifications" nested />
          </div>
          <div className="rn-me-settings-card is-gap">
            <SettingsLinkRow label="用户协议&条款" value="查看" href="/me/settings/terms" nested />
          </div>
          <button className="rn-me-logout" type="button" onClick={() => setConfirming(true)}>退出登录</button>
        </div>
      </section>
      {confirming ? (
        <div className="rn-me-dialog-backdrop" role="presentation" onClick={() => setConfirming(false)}>
          <section className="rn-me-dialog" role="alertdialog" aria-modal="true" aria-labelledby="logout-title" onClick={event => event.stopPropagation()}>
            <h2 id="logout-title">退出登录</h2>
            <p>确认退出当前账号？</p>
            <div>
              <button type="button" disabled={signingOut} onClick={() => setConfirming(false)}>取消</button>
              <button className="is-danger" type="button" disabled={signingOut} onClick={() => void signOut()}>{signingOut ? '退出中' : '退出'}</button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

/** 通用设置页可进入的真实 route 行参数。 */
interface SettingsLinkRowProps {
  readonly label: string;
  readonly value?: string;
  readonly href: string;
  readonly nested?: boolean;
}

/** 渲染 RN 56px 设置行并交给 React Router 导航。 */
function SettingsLinkRow({ label, value, href, nested = false }: SettingsLinkRowProps) {
  // row 允许首个独立设置项自行形成卡片。
  const row = (
    <Link className="rn-me-settings-row" to={href}>
      <span>{label}</span>
      <strong>{value}</strong>
      <RNAssetIcon assetURL={arrowIconURL} />
    </Link>
  );
  return nested ? row : <div className="rn-me-settings-card">{row}</div>;
}

/** 统一承载设置页启动和配置状态。 */
function SettingsPageState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return (
    <main className="rn-me-page-state">
      <strong>{label}</strong>
      {detail ? <span>{detail}</span> : null}
    </main>
  );
}
