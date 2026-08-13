import { createContext, useContext, type ReactNode } from 'react';

/** 主导航只读消费的验证消息计数投影。 */
interface PrimaryTabVerificationUnreadCounts {
  readonly friend: number;
  readonly group: number;
  readonly total: number;
}

/** 页面与全局主导航之间的角标和只读交互契约。 */
interface PrimaryTabBadgeContextValue {
  readonly verificationUnreadCounts: PrimaryTabVerificationUnreadCounts;
  readonly refreshVerificationUnreadCounts: () => Promise<void>;
  readonly reportConversationUnreadTotal: (unreadTotal: number) => void;
  readonly registerConversationTabReselect: (handler: (() => boolean) | null) => void;
}

/** 主导航页面端口 Provider 参数。 */
interface PrimaryTabBadgeProviderProps extends PrimaryTabBadgeContextValue {
  readonly children: ReactNode;
}

/** 缺少主导航壳时保持无副作用，避免页面自行创建第二角标 owner。 */
const DEFAULT_PRIMARY_TAB_BADGE_CONTEXT: PrimaryTabBadgeContextValue = {
  verificationUnreadCounts: { friend: 0, group: 0, total: 0 },
  refreshVerificationUnreadCounts: async () => undefined,
  reportConversationUnreadTotal: () => undefined,
  registerConversationTabReselect: () => undefined,
};

/** 主导航上下文承载页面到路由壳的汇总结果与当前页动作。 */
const PrimaryTabBadgeContext = createContext<PrimaryTabBadgeContextValue>(
  DEFAULT_PRIMARY_TAB_BADGE_CONTEXT,
);

/** 为主标签路由内页面提供未读数上报和只读交互注册端口。 */
export function PrimaryTabBadgeProvider({
  children,
  verificationUnreadCounts,
  refreshVerificationUnreadCounts,
  reportConversationUnreadTotal,
  registerConversationTabReselect,
}: PrimaryTabBadgeProviderProps) {
  return (
    <PrimaryTabBadgeContext.Provider value={{
      verificationUnreadCounts,
      refreshVerificationUnreadCounts,
      reportConversationUnreadTotal,
      registerConversationTabReselect,
    }}>
      {children}
    </PrimaryTabBadgeContext.Provider>
  );
}

/** 读取全局主导航页面端口。 */
export function usePrimaryTabBadges(): PrimaryTabBadgeContextValue {
  return useContext(PrimaryTabBadgeContext);
}
