import { useCallback, useEffect, useState } from 'react';
import type {
  GatewayNotificationType,
  GatewayUserNotificationSetting,
} from '@im28/im-sdk/web';
import { Navigate } from 'react-router-dom';

import { useWebIMRuntime } from '../../runtime/index.js';
import { MeProfileHeader } from './MeProfileHeader.js';
import { MeSettingsSwitchRow } from './MeSettingsSwitchRow.js';
import './me-page.css';
import './me-profile-page.css';
import './me-settings-page.css';

/** 通知页允许编辑的稳定字段。 */
type NotificationSettingKey =
  | 'notification'
  | 'private_chat'
  | 'group_chat'
  | 'mention'
  | 'application'
  | 'system_notice'
  | 'call';

/** RN 通知子开关的顺序与 Gateway type 映射。 */
const NOTIFICATION_ROWS: ReadonlyArray<{
  readonly key: NotificationSettingKey;
  readonly label: string;
}> = [
  { key: 'private_chat', label: '私聊消息' },
  { key: 'group_chat', label: '群聊消息' },
  { key: 'mention', label: '@我' },
  { key: 'application', label: '好友/群申请' },
  { key: 'system_notice', label: '系统通知' },
  { key: 'call', label: '语音视频通话消息' },
];

/** RN 通知设置页读取和写入真实 Gateway 偏好。 */
export function MeNotificationSettingsPage() {
  // runtime context 是通知设置唯一 SDK 入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // settings 保存服务端返回的完整通知状态。
  const [settings, setSettings] = useState<GatewayUserNotificationSetting | null>(null);
  // loading 覆盖首次读取。
  const [loading, setLoading] = useState(false);
  // savingKey 阻止并发开关写入覆盖服务器结果。
  const [savingKey, setSavingKey] = useState<NotificationSettingKey | null>(null);
  // error 显示真实请求失败。
  const [error, setError] = useState<string | null>(null);

  /** 通过认证 settings facade 读取服务端偏好。 */
  const loadSettings = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID) return;
    setLoading(true);
    setError(null);
    try {
      setSettings(await runtime.getSettings().getNotification());
    } catch (cause) {
      setError(readNotificationError(cause));
    } finally {
      setLoading(false);
    }
  }, [runtime, snapshot.userID]);

  useEffect(() => { void loadSettings(); }, [loadSettings]);

  /** 乐观切换失败时恢复旧值，成功后使用服务端完整状态。 */
  const updateSetting = useCallback(async (key: NotificationSettingKey): Promise<void> => {
    if (!runtime || !settings || savingKey) return;
    // nextValue 对齐 RN 缺失字段默认开启语义。
    const nextValue = settings[key] === false;
    // previousSettings 用于失败回滚。
    const previousSettings = settings;
    setSettings({ ...settings, [key]: nextValue });
    setSavingKey(key);
    setError(null);
    try {
      setSettings(await runtime.getSettings().updateNotification({
        type: key as GatewayNotificationType,
        enabled: nextValue,
      }));
    } catch (cause) {
      setSettings(previousSettings);
      setError(readNotificationError(cause));
    } finally {
      setSavingKey(null);
    }
  }, [runtime, savingKey, settings]);

  if (restoring) return <NotificationPageState label="正在恢复通知设置" />;
  if (!runtime) return <NotificationPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  // notificationEnabled 对齐 RN 总开关缺失时默认开启。
  const notificationEnabled = settings?.notification !== false;
  // controlsDisabled 在读取或任一写入期间锁定全部开关。
  const controlsDisabled = loading || Boolean(savingKey) || !settings;
  return (
    <main className="rn-me-settings-page" aria-busy={loading}>
      <section className="rn-me-settings-surface">
        <MeProfileHeader title="通知" backHref="/me/settings" />
        <div className="rn-me-settings-content">
          {error ? <div className="rn-me-settings-error is-action" role="status"><span>{error}</span><button type="button" onClick={() => void loadSettings()}>重试</button></div> : null}
          <div className="rn-me-settings-card">
            <MeSettingsSwitchRow
              label="全局消息免打扰"
              checked={notificationEnabled}
              disabled={controlsDisabled}
              onChange={() => void updateSetting('notification')}
            />
          </div>
          {notificationEnabled ? (
            <div className="rn-me-settings-card is-gap">
              {NOTIFICATION_ROWS.map(row => (
                <MeSettingsSwitchRow
                  key={row.key}
                  label={row.label}
                  checked={settings?.[row.key] !== false}
                  disabled={controlsDisabled}
                  onChange={() => void updateSetting(row.key)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

/** 收敛通知 API 异常且不泄漏凭据。 */
function readNotificationError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '通知设置加载失败';
}

/** 统一承载通知设置启动状态。 */
function NotificationPageState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-me-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}
