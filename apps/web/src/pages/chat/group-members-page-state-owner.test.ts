import { describe, expect, it } from 'vitest';

import pageSource from './GroupMembersPage.tsx?raw';
import stateSource from './useGroupMembersPageState.ts?raw';

/** 群成员状态 owner 合同防止页面重新复制 cache 和 presence 主链。 */
describe('group members page state owner', () => {
  /** 页面只消费状态 Hook 并保留下拉与索引 DOM 交互。 */
  it('keeps the page as a route, gesture and presentation consumer', () => {
    expect(pageSource).toContain('useGroupMembersPageState({');
    expect(pageSource).toContain('usePullRefresh({');
    expect(pageSource).toContain('scrollToIndex');
    expect(pageSource).not.toMatch(/getSync\(\)|groupMembers\.sync|useObservedUserPresence/);
  });

  /** Hook 保留既有会话解析、cache-first、完整同步与 presence owner。 */
  it('owns the existing shared member state chain', () => {
    expect(stateSource).toContain('sync.conversations.listCached({ limit: 500 })');
    expect(stateSource).toContain('sync.groupMembers.listCached(groupID)');
    expect(stateSource).toContain('sync.groupMembers.sync(groupID, { pageSize: 100 })');
    expect(stateSource).toContain('useObservedUserPresence({');
    expect(stateSource).not.toMatch(/GatewayHTTPClient|GroupRepository|@openim\//);
  });
});
