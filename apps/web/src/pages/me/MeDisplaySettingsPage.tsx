import { Navigate } from 'react-router-dom';

import { useWebIMRuntime } from '../../runtime/index.js';
import {
  setWebThemePreference,
  useWebThemePreference,
  type WebThemePreference,
} from '../../runtime/theme-preference.js';
import { MeProfileHeader } from './MeProfileHeader.js';
import { MeSettingsSwitchRow } from './MeSettingsSwitchRow.js';
import './me-page.css';
import './me-profile-page.css';
import './me-settings-page.css';

/** RN 显示设置在浏览器中持久化同一三态主题偏好。 */
export function MeDisplaySettingsPage() {
  // runtime context 只用于全屏设置页认证守卫。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // themeSnapshot 实时反映偏好和当前系统模式。
  const themeSnapshot = useWebThemePreference();

  if (restoring) return <DisplayPageState label="正在恢复显示设置" />;
  if (!runtime) return <DisplayPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  /** 切换跟随系统时保留当前实际颜色作为手动模式。 */
  const toggleFollowSystem = (): void => {
    setWebThemePreference(
      themeSnapshot.preference === 'system' ? themeSnapshot.mode : 'system',
    );
  };

  return (
    <main className="rn-me-settings-page">
      <section className="rn-me-settings-surface">
        <MeProfileHeader title="显示" backHref="/me/settings" />
        <div className="rn-me-settings-content">
          <div className="rn-me-settings-card">
            <MeSettingsSwitchRow
              label="跟随系统"
              checked={themeSnapshot.preference === 'system'}
              onChange={toggleFollowSystem}
            />
          </div>
          {themeSnapshot.preference !== 'system' ? (
            <div className="rn-me-settings-card is-gap">
              <ThemeChoiceRow
                label="浅色模式"
                preference="light"
                selected={themeSnapshot.preference === 'light'}
              />
              <ThemeChoiceRow
                label="深色模式"
                preference="dark"
                selected={themeSnapshot.preference === 'dark'}
                last
              />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

/** 主题选项行参数。 */
interface ThemeChoiceRowProps {
  readonly label: string;
  readonly preference: Exclude<WebThemePreference, 'system'>;
  readonly selected: boolean;
  readonly last?: boolean;
}

/** 渲染 RN 文本勾选主题行。 */
function ThemeChoiceRow({ label, preference, selected, last = false }: ThemeChoiceRowProps) {
  return (
    <button
      className={`rn-me-settings-choice${last ? ' is-last' : ''}`}
      type="button"
      aria-pressed={selected}
      onClick={() => setWebThemePreference(preference)}
    >
      <span>{label}</span>
      {selected ? <strong aria-hidden="true">✓</strong> : null}
    </button>
  );
}

/** 统一承载显示设置启动状态。 */
function DisplayPageState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-me-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}
