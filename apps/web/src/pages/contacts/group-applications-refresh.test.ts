import { describe, expect, it } from 'vitest';

import groupApplicationsSource from './GroupApplicationsPage.tsx?raw';

/** 指定群申请列表刷新契约锁定 RN 手势与既有 shared owner。 */
describe('group applications pull refresh', () => {
  /** 页面复用同一群申请 facade 和验证中心提示，不创建 transport 分支。 */
  it('refreshes through the existing group applications facade', () => {
    expect(groupApplicationsSource).toContain('usePullRefresh({');
    expect(groupApplicationsSource).toContain('runtime.getSync().groupApplications.list({ pageSize: 100 })');
    expect(groupApplicationsSource).toContain('<PullRefreshIndicator');
    expect(groupApplicationsSource).not.toMatch(/GatewayHTTPClient|GroupRepository|@openim\//);
  });

  /** 首次加载、刷新和申请处理均阻止并发下拉。 */
  it('blocks pull gestures while loading or handling an application', () => {
    expect(groupApplicationsSource).toContain('refreshing: loading || refreshing || Boolean(pendingAction)');
    expect(groupApplicationsSource).toContain('refreshing || pendingAction');
  });
});
