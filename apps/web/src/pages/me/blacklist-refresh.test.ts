import { describe, expect, it } from 'vitest';

import blacklistSource from './MeBlacklistPage.tsx?raw';

/** 黑名单刷新契约锁定 RN 手势与既有 shared owner。 */
describe('blacklist pull refresh', () => {
  /** 页面只重读既有 blacklist facade 并复用全局刷新提示。 */
  it('refreshes through the existing blacklist facade', () => {
    expect(blacklistSource).toContain('usePullRefresh({');
    expect(blacklistSource).toContain('runtime.getSync().blacklist.list({ pageSize: 100 })');
    expect(blacklistSource).toContain('<PullRefreshIndicator');
    expect(blacklistSource).not.toMatch(/GatewayHTTPClient|BlacklistRepository|@openim\//);
  });

  /** 首次加载、刷新和解除处理中均阻止并发下拉。 */
  it('blocks pull gestures while loading or removing a user', () => {
    expect(blacklistSource).toContain('refreshing: loading || refreshing || Boolean(removingUserID)');
    expect(blacklistSource).toContain('refreshing || removingUserID');
  });
});
