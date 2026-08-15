import { describe, expect, it } from 'vitest';

import pageSource from './ContactSearchPage.tsx?raw';
import stateOwnerSource from './useContactSearchPageState.ts?raw';

/** 联系人搜索本地群接线不得复制 SDK 业务 owner。 */
describe('contact search local joined groups contract', () => {
  it('loads joined groups and merges them with local contacts', () => {
    expect(pageSource).toContain('runtime?.getSync() ?? null');
    expect(stateOwnerSource).toContain('buildContactSearchLocalResults(');
    expect(stateOwnerSource).toContain('sync.groups.listCached()');
    expect(stateOwnerSource).toContain('sync.groups.sync({ pageSize: 50 })');
    expect(stateOwnerSource).toContain('sync.conversations.listCached()');
  });

  it('opens a local group through the canonical conversation facade', () => {
    expect(stateOwnerSource).toContain('sync.conversations.openGroup({');
    expect(stateOwnerSource).toContain('groupID: group.groupID');
    expect(stateOwnerSource).toContain('conversationID: group.conversationID');
  });

  it('does not add page transport or database access', () => {
    expect(`${pageSource}\n${stateOwnerSource}`).not.toMatch(
      /GatewayHTTPClient|GroupRepository|ContactRepository|@openim\//,
    );
  });
});
