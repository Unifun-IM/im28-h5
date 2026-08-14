import { useCallback, useEffect, useState } from 'react';
import type {
  GatewayPermissionType,
  GatewayUserPermissionSetting,
} from '@im28/im-sdk/web';
import { Link, Navigate } from 'react-router-dom';

import arrowIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import { useAppToast } from '../../components/interaction/index.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { MeProfileHeader } from './MeProfileHeader.js';
import { MeSettingsSwitchRow } from './MeSettingsSwitchRow.js';
import './me-page.css';
import './me-profile-page.css';
import './me-settings-page.css';

/** 权限页允许编辑的五个稳定 Gateway 字段。 */
type PermissionSettingKey =
  | 'friend_apply_verify'
  | 'allow_search'
  | 'allow_group_invite'
  | 'show_bio'
  | 'show_gender';

/** RN 权限开关顺序与 Gateway type 映射。 */
const PERMISSION_ROWS: ReadonlyArray<{
  readonly key: PermissionSettingKey;
  readonly label: string;
}> = [
  { key: 'friend_apply_verify', label: '加我时需要验证' },
  { key: 'allow_search', label: '允许别人搜索到我' },
  { key: 'allow_group_invite', label: '允许别人直接拉我进群' },
  { key: 'show_bio', label: '展示个性签名' },
  { key: 'show_gender', label: '展示性别' },
];

/** RN 权限管理页读取和写入真实 Gateway 配置。 */
export function MePermissionSettingsPage() {
  /** toast 承载权限写入的瞬时成功与失败。 */
  const { toast } = useAppToast();
  // runtime context 是权限设置唯一 SDK 入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // settings 保存服务端返回的完整权限配置。
  const [settings, setSettings] = useState<GatewayUserPermissionSetting | null>(null);
  // loading 覆盖首次读取。
  const [loading, setLoading] = useState(false);
  // savingKey 阻止并发写入覆盖服务器结果。
  const [savingKey, setSavingKey] = useState<PermissionSettingKey | null>(null);
  // error 显示真实请求失败。
  const [error, setError] = useState<string | null>(null);

  /** 通过认证 settings facade 读取服务端权限。 */
  const loadSettings = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID) return;
    setLoading(true);
    setError(null);
    try {
      setSettings(await runtime.getSettings().getPermission());
    } catch (cause) {
      setError(readPermissionError(cause, '权限设置加载失败'));
    } finally {
      setLoading(false);
    }
  }, [runtime, snapshot.userID]);

  useEffect(() => { void loadSettings(); }, [loadSettings]);

  /** 乐观切换失败时恢复提交前完整配置。 */
  const updateSetting = useCallback(async (key: PermissionSettingKey): Promise<void> => {
    if (!runtime || !settings || savingKey) return;
    // nextValue 对齐 RN 缺失字段默认开启语义。
    const nextValue = settings[key] === false;
    // previousSettings 用于失败时无损回滚。
    const previousSettings = settings;
    setSettings({ ...settings, [key]: nextValue });
    setSavingKey(key);
    setError(null);
    try {
      setSettings(await runtime.getSettings().updatePermission({
        type: key as GatewayPermissionType,
        enabled: nextValue,
      }));
      toast.success('设置成功');
    } catch (cause) {
      setSettings(previousSettings);
      toast.error(readPermissionError(cause, '权限设置失败'));
    } finally {
      setSavingKey(null);
    }
  }, [runtime, savingKey, settings, toast]);

  if (restoring) return <PermissionPageState label="正在恢复权限设置" />;
  if (!runtime) return <PermissionPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  // controlsDisabled 在读取或任一写入期间锁定全部开关。
  const controlsDisabled = loading || Boolean(savingKey) || !settings;
  return (
    <main className="rn-me-settings-page" aria-busy={loading}>
      <section className="rn-me-settings-surface">
        <MeProfileHeader title="权限管理" backHref="/me/settings" />
        <div className="rn-me-settings-content is-permission">
          {error ? <div className="rn-me-settings-error is-action" role="status"><span>{error}</span><button type="button" onClick={() => void loadSettings()}>重试</button></div> : null}
          {PERMISSION_ROWS.map(row => (
            <div className="rn-me-settings-card" key={row.key}>
              <MeSettingsSwitchRow
                label={row.label}
                checked={settings?.[row.key] !== false}
                disabled={controlsDisabled}
                onChange={() => void updateSetting(row.key)}
              />
            </div>
          ))}
          <Link className="rn-me-settings-card rn-me-settings-row" to="/me/settings/blacklist">
            <span className="rn-me-settings-label">黑名单</span>
            <RNAssetIcon assetURL={arrowIconURL} />
          </Link>
        </div>
      </section>
    </main>
  );
}

/** 收敛权限 API 异常且不泄漏凭据。 */
function readPermissionError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

/** 统一承载权限设置启动状态。 */
function PermissionPageState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-me-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}
