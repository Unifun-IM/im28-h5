import { describe, expect, it } from 'vitest';

import pageSource from './ContactSearchPage.tsx?raw';
import stateOwnerSource from './useContactSearchPageState.ts?raw';

/** 联系人搜索页面不得重新拥有 shared 数据请求和异步竞态状态。 */
describe('contact search state owner', () => {
  it('页面只消费唯一状态 hook 并保留 Router 投影', () => {
    expect(pageSource).toContain('useContactSearchPageState({');
    expect(pageSource).toContain('buildConversationRoute(conversationID, true)');
    expect(pageSource).toContain("navigate(`/groups/${encodeURIComponent(group.groupID)}/apply`, {");
    expect(pageSource).not.toMatch(/\.searchUsers\(|groupApplications\.search|\.listCached\(|\.openGroup\(/);
  });

  it('hook 统一拥有本地快照、服务器搜索代次和群会话打开', () => {
    expect(stateOwnerSource).toContain('sync.contacts.searchUsers(query)');
    expect(stateOwnerSource).toContain('sync.groupApplications.search(query)');
    expect(stateOwnerSource).toContain('serverSearchRequestIDRef');
    expect(stateOwnerSource.match(/sync\.conversations\.openGroup\(\{/g)).toHaveLength(2);
    expect(stateOwnerSource).not.toContain('useNavigate');
  });
});
