import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WebIMSync } from '@im28/im-sdk-web';
import { Outlet, useLocation } from 'react-router-dom';

import {
  PrimaryTabBadgeProvider,
  PrimaryTabBar,
  type PrimaryTabKey,
} from '../components/primary-tabs/index.js';
import { getConversationUnreadTotal } from '../pages/conversations/conversation-list-view.js';
import { useWebIMRuntime } from '../runtime/index.js';

/** 为已迁移主页面提供 React Router Outlet 和唯一全局底栏。 */
export function PrimaryTabsLayout() {
  // runtime snapshot 决定底栏认证可见性并驱动实时角标刷新。
  const { runtime, snapshot, restoring } = useWebIMRuntime();
  // location 将 React Router URL 映射为 RN 主标签选中态。
  const location = useLocation();
  // sync 仅用于从当前账号 cache 读取真实会话未读数。
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  // unread state 同时接收 cache 基线和会话页最新汇总。
  const [unreadTotal, setUnreadTotal] = usePrimaryTabUnreadTotal(
    sync,
    snapshot.userID,
    snapshot.dataVersion,
  );
  // activeTab 只映射当前已经具备真实路由的主页面。
  const activeTab: PrimaryTabKey = location.pathname.startsWith('/contacts')
    ? 'contacts'
    : location.pathname.startsWith('/calls')
      ? 'calls'
      : location.pathname.startsWith('/me')
        ? 'me'
        : 'chats';
  // reportConversationUnreadTotal 约束异常值后更新全局角标。
  const reportConversationUnreadTotal = useCallback((nextUnreadTotal: number) => {
    setUnreadTotal(Math.max(0, Math.trunc(nextUnreadTotal)));
  }, []);

  // showTabBar 阻止匿名、恢复中和配置失败页面短暂显示认证导航。
  const showTabBar = Boolean(runtime && snapshot.userID && !restoring);
  return (
    <PrimaryTabBadgeProvider reportConversationUnreadTotal={reportConversationUnreadTotal}>
      <div className={`rn-primary-tabs-layout${showTabBar ? ' has-tab-bar' : ''}`}>
        <div className="rn-primary-tabs-content"><Outlet /></div>
        {showTabBar ? <PrimaryTabBar activeTab={activeTab} unreadTotal={unreadTotal} /> : null}
      </div>
    </PrimaryTabBadgeProvider>
  );
}

/** 从当前账号 cache 建立全局消息角标基线，并允许页面上报覆盖。 */
function usePrimaryTabUnreadTotal(
  sync: WebIMSync | null,
  userID: string | null,
  dataVersion: number,
) {
  // unreadTotal 保存主导航当前可见的非静音未读总数。
  const [unreadTotal, setUnreadTotal] = useState(0);
  useEffect(() => {
    if (!sync || !userID) {
      setUnreadTotal(0);
      return;
    }
    // active 防止异步 cache 读取在 runtime 切换后覆盖新账号状态。
    let active = true;
    void sync.conversations
      .listCachedItems({ archived: false, limit: 100 })
      .then(items => {
        if (active) setUnreadTotal(getConversationUnreadTotal(items));
      })
      .catch(() => {
        if (active) setUnreadTotal(0);
      });
    return () => {
      active = false;
    };
  }, [dataVersion, sync, userID]);
  return [unreadTotal, setUnreadTotal] as const;
}
