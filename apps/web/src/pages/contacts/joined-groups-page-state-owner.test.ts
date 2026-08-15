import { describe, expect, it } from 'vitest';

import pageSource from './JoinedGroupsPage.tsx?raw';
import stateSource from './useJoinedGroupsPageState.ts?raw';

/** 我的群聊状态 owner 合同防止页面重新复制 shared 事务。 */
describe('joined groups page state owner contract', () => {
  /** 页面只消费 Hook 状态并保留下拉手势与展示。 */
  it('keeps the page as a presentation and gesture consumer', () => {
    expect(pageSource).toContain('useJoinedGroupsPageState({');
    expect(pageSource).toContain('usePullRefresh({');
    expect(pageSource).not.toMatch(/getSync\(\)|useAppToast|useState|useEffect/);
  });

  /** Hook 保留 cache-first、完整刷新、会话解析和退群 owner。 */
  it('owns the existing shared group state and lifecycle chain', () => {
    expect(stateSource).toContain('facade.listCached()');
    expect(stateSource).toContain('facade.sync({ pageSize: 50 })');
    expect(stateSource).toContain('conversations.openGroup({');
    expect(stateSource).toContain('groupLifecycle.leave({');
    expect(stateSource).toContain("result.cacheState === 'remote-only'");
    expect(stateSource).not.toMatch(/GatewayHTTPClient|GroupRepository|@openim\//);
  });
});
