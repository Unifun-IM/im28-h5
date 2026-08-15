import { describe, expect, it } from 'vitest';

import joinedGroupsSource from './JoinedGroupsPage.tsx?raw';
import joinedGroupsStateSource from './useJoinedGroupsPageState.ts?raw';

/** 我的群聊刷新契约锁定 RN 手势只进入 shared groups facade。 */
describe('joined groups pull refresh contract', () => {
  /** 页面复用全局触摸适配器并只执行规范群列表同步。 */
  it('reuses pull refresh and the shared group sync owner', () => {
    expect(joinedGroupsSource).toContain('usePullRefresh({');
    expect(joinedGroupsSource).toContain('onTouchStart={pullRefresh.onTouchStart}');
    expect(joinedGroupsStateSource).toContain("runtime.getSync().groups.sync({ pageSize: 50 })");
    expect(joinedGroupsStateSource).not.toMatch(/GatewayHTTPClient|GroupRepository|@openim\//);
  });

  /** 刷新状态独立于搜索词，列表仍由本地纯投影负责过滤。 */
  it('preserves local search and visible refresh feedback', () => {
    expect(joinedGroupsStateSource).toContain('filterJoinedGroups(groups, keyword)');
    expect(joinedGroupsSource).toContain('<PullRefreshIndicator');
    expect(joinedGroupsSource).not.toMatch(/className=.*rn-joined-groups-pull/);
  });
});
