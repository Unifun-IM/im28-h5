import { useSyncExternalStore } from 'react';

/** 与 RN ThemeProvider 一致的三态主题偏好。 */
export type WebThemePreference = 'system' | 'light' | 'dark';

/** 页面消费的主题偏好与当前生效模式。 */
export interface WebThemeSnapshot {
  readonly preference: WebThemePreference;
  readonly mode: 'light' | 'dark';
}

// 存储键与 RN AsyncStorage owner 保持一致。
const THEME_PREFERENCE_STORAGE_KEY = '@im28/theme/preference';
// 系统配色查询在浏览器生命周期内复用。
const SYSTEM_DARK_QUERY = globalThis.matchMedia('(prefers-color-scheme: dark)');
// 订阅者只在偏好或系统模式实际变化时收到通知。
const themeListeners = new Set<() => void>();
// 当前快照在 React 外初始化，避免首屏主题闪烁。
let currentThemeSnapshot = createThemeSnapshot(readStoredPreference());
// 初始化标记避免 StrictMode 或热更新重复绑定系统监听器。
let initialized = false;

/** 解析并拒绝损坏的本地主题值。 */
function parseThemePreference(value: string | null): WebThemePreference | null {
  return value === 'system' || value === 'light' || value === 'dark' ? value : null;
}

/** 读取本地偏好，缺失或损坏时跟随系统。 */
function readStoredPreference(): WebThemePreference {
  return parseThemePreference(globalThis.localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY)) ?? 'system';
}

/** 根据偏好与浏览器媒体查询创建稳定快照。 */
function createThemeSnapshot(preference: WebThemePreference): WebThemeSnapshot {
  return {
    preference,
    mode: preference === 'system' ? (SYSTEM_DARK_QUERY.matches ? 'dark' : 'light') : preference,
  };
}

/** 将偏好投影到根节点，system 交回 CSS media query。 */
function applyThemePreference(preference: WebThemePreference): void {
  if (preference === 'system') {
    document.documentElement.removeAttribute('data-theme');
    return;
  }
  document.documentElement.dataset.theme = preference;
}

/** 发布最新主题快照。 */
function publishThemeSnapshot(preference: WebThemePreference): void {
  currentThemeSnapshot = createThemeSnapshot(preference);
  applyThemePreference(preference);
  for (const listener of themeListeners) listener();
}

/** 在 React 渲染前恢复主题并监听系统配色变化。 */
export function initializeWebThemePreference(): void {
  applyThemePreference(currentThemeSnapshot.preference);
  if (initialized) return;
  initialized = true;
  SYSTEM_DARK_QUERY.addEventListener('change', () => {
    if (currentThemeSnapshot.preference === 'system') publishThemeSnapshot('system');
  });
}

/** 持久化主题偏好并立即更新所有页面。 */
export function setWebThemePreference(preference: WebThemePreference): void {
  globalThis.localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, preference);
  publishThemeSnapshot(preference);
}

/** 订阅主题偏好，供 useSyncExternalStore 使用。 */
function subscribeTheme(listener: () => void): () => void {
  themeListeners.add(listener);
  return () => themeListeners.delete(listener);
}

/** 返回稳定主题快照。 */
function getThemeSnapshot(): WebThemeSnapshot {
  return currentThemeSnapshot;
}

/** 读取可响应系统变化的浏览器主题偏好。 */
export function useWebThemePreference(): WebThemeSnapshot {
  return useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeSnapshot);
}
