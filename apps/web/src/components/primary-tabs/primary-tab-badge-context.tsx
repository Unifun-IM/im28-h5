import { createContext, useContext, type ReactNode } from 'react';

/** 页面向全局主导航上报真实未读数的最小契约。 */
interface PrimaryTabBadgeContextValue {
  readonly reportConversationUnreadTotal: (unreadTotal: number) => void;
}

/** 主导航角标 Provider 参数。 */
interface PrimaryTabBadgeProviderProps extends PrimaryTabBadgeContextValue {
  readonly children: ReactNode;
}

/** 缺少主导航壳时保持无副作用，避免页面自行创建第二角标 owner。 */
const DEFAULT_PRIMARY_TAB_BADGE_CONTEXT: PrimaryTabBadgeContextValue = {
  reportConversationUnreadTotal: () => undefined,
};

/** 主导航角标上下文只承载页面到路由壳的汇总结果。 */
const PrimaryTabBadgeContext = createContext<PrimaryTabBadgeContextValue>(
  DEFAULT_PRIMARY_TAB_BADGE_CONTEXT,
);

/** 为主标签路由内页面提供未读数上报端口。 */
export function PrimaryTabBadgeProvider({
  children,
  reportConversationUnreadTotal,
}: PrimaryTabBadgeProviderProps) {
  return (
    <PrimaryTabBadgeContext.Provider value={{ reportConversationUnreadTotal }}>
      {children}
    </PrimaryTabBadgeContext.Provider>
  );
}

/** 读取全局主导航角标上报端口。 */
export function usePrimaryTabBadges(): PrimaryTabBadgeContextValue {
  return useContext(PrimaryTabBadgeContext);
}
