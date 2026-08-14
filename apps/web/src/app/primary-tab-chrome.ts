import type { PrimaryTabKey } from '../components/primary-tabs/index.js';

/** 主导航可见性输入只包含应用壳状态，不读取页面业务数据。 */
interface PrimaryTabBarVisibilityInput {
  readonly activeTab: PrimaryTabKey;
  readonly callsChromeHidden: boolean;
  readonly restoring: boolean;
  readonly runtimeReady: boolean;
  readonly userID: string | null;
}

/** 匿名、恢复中、配置失败或通话编辑态隐藏唯一全局底栏。 */
export function getPrimaryTabBarVisible({
  activeTab,
  callsChromeHidden,
  restoring,
  runtimeReady,
  userID,
}: PrimaryTabBarVisibilityInput): boolean {
  if (!runtimeReady || !userID || restoring) return false;
  return activeTab !== 'calls' || !callsChromeHidden;
}
