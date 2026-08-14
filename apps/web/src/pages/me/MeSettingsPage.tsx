import { useCallback, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import type { WebIMClientVersionCheckResult } from '@im28/im-sdk/web';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import arrowIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { OperationToastFeedback } from '../../components/interaction/index.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { useWebThemePreference } from '../../runtime/theme-preference.js';
import { MeLogoutDialog } from './MeLogoutDialog.js';
import { MeVersionUpdateDialog } from './MeVersionUpdateDialog.js';
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
  // versionStatus 承载最新版本等非错误检查结果。
  const [versionStatus, setVersionStatus] = useState<string | null>(null);
  // checkingVersion 防止重复触发公开版本检查 operation。
  const [checkingVersion, setCheckingVersion] = useState(false);
  // updateInfo 只保存 SDK 已规范化且需要更新的结果。
  const [updateInfo, setUpdateInfo] =
    useState<WebIMClientVersionCheckResult | null>(null);
  // themeSnapshot 显示当前 RN 同源主题偏好。
  const themeSnapshot = useWebThemePreference();

  /** 通过 runtime 的公开 facade 检查当前 Web 部署版本。 */
  const checkVersion = useCallback(async (): Promise<void> => {
    if (!runtime || checkingVersion) return;
    setCheckingVersion(true);
    setError(null);
    setVersionStatus(null);
    try {
      // result 来自共享 Gateway operation，不依赖认证 token 或页面 mock。
      const result = await runtime.getClientVersion().check();
      if (result.needUpdate) {
        setUpdateInfo(result);
      } else {
        setVersionStatus('已是最新版本');
      }
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : '版本检查失败');
    } finally {
      setCheckingVersion(false);
    }
  }, [checkingVersion, runtime]);

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
        <PageNavbar className="rn-me-settings-header">
          <Link to="/me" aria-label="返回个人中心"><RNAssetIcon assetURL={backIconURL} /></Link>
          <h1>通用设置</h1>
          <span />
        </PageNavbar>
        <div className="rn-me-settings-content">
          <OperationToastFeedback notice={versionStatus} />
          {error ? <p className="rn-me-settings-error" role="status">{error}</p> : null}
          <SettingsLinkRow
            label="显示"
            value={themeSnapshot.preference === 'system' ? '跟随系统' : themeSnapshot.mode === 'light' ? '浅色模式' : '深色模式'}
            href="/me/settings/display"
          />
          <div className="rn-me-settings-card is-gap">
            <SettingsLinkRow label="通知" href="/me/settings/notifications" nested />
            <SettingsLinkRow label="权限管理" href="/me/settings/permissions" nested />
          </div>
          <div className="rn-me-settings-card is-gap">
            <SettingsLinkRow label="用户协议&条款" value="查看" href="/me/settings/terms" nested />
            <SettingsActionRow
              label="版本"
              value={checkingVersion ? '检查中' : `版本号${runtime.getClientVersion().currentVersion}`}
              disabled={checkingVersion}
              onClick={() => void checkVersion()}
            />
          </div>
          <button className="rn-me-logout" type="button" onClick={() => setConfirming(true)}>退出登录</button>
        </div>
      </section>
      <MeLogoutDialog
        open={confirming}
        signingOut={signingOut}
        onCancel={() => setConfirming(false)}
        onConfirm={() => void signOut()}
      />
      {updateInfo ? (
        <MeVersionUpdateDialog
          update={updateInfo}
          onDismiss={() => setUpdateInfo(null)}
        />
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
      <span className="rn-me-settings-label">{label}</span>
      <span className="rn-me-settings-trailing">
        {value ? <strong>{value}</strong> : null}
        <RNAssetIcon assetURL={arrowIconURL} />
      </span>
    </Link>
  );
  return nested ? row : <div className="rn-me-settings-card">{row}</div>;
}

/** 版本等不切换 route 的设置操作行参数。 */
interface SettingsActionRowProps {
  readonly label: string;
  readonly value: string;
  readonly disabled: boolean;
  readonly onClick: () => void;
}

/** 渲染无箭头的 RN 设置操作行。 */
function SettingsActionRow({
  label,
  value,
  disabled,
  onClick,
}: SettingsActionRowProps) {
  return (
    <button
      className="rn-me-settings-row rn-me-settings-action-row"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      <span className="rn-me-settings-label">{label}</span>
      <span className="rn-me-settings-trailing">
        <strong>{value}</strong>
      </span>
    </button>
  );
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
