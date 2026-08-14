import { describe, expect, it } from 'vitest';

import pageSource from './ContactSearchPage.tsx?raw';

/** 联系人搜索本地群接线不得复制 SDK 业务 owner。 */
describe('contact search local joined groups contract', () => {
  it('loads joined groups and merges them with local contacts', () => {
    expect(pageSource).toContain('runtime?.getSync().groups');
    expect(pageSource).toContain('runtime?.getSync().conversations');
    expect(pageSource).toContain('buildContactSearchLocalResults(');
    expect(pageSource).toContain('groupsFacade.listCached()');
    expect(pageSource).toContain('groupsFacade.sync({ pageSize: 50 })');
    expect(pageSource).toContain('conversationsFacade.listCached()');
  });

  it('opens a local group through the canonical conversation facade', () => {
    expect(pageSource).toContain('runtime.getSync().conversations.openGroup({');
    expect(pageSource).toContain('groupID: group.groupID');
    expect(pageSource).toContain('conversationID: group.conversationID');
  });

  it('does not add page transport or database access', () => {
    expect(pageSource).not.toMatch(/GatewayHTTPClient|GroupRepository|ContactRepository|@openim\//);
  });
});
