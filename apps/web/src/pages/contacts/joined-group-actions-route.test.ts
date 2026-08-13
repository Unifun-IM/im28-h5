import { describe, expect, it } from 'vitest';

import joinedGroupsSource from './JoinedGroupsPage.tsx?raw';
import groupProfileSource from '../chat/GroupProfilePage.tsx?raw';
import ownerTransferSource from '../chat/GroupOwnerTransferPage.tsx?raw';

/** 群列表长按动作必须复用既有 SPA route 和 shared lifecycle owner。 */
describe('joined group actions route contract', () => {
  it('分享与改名先解析 canonical Conversation 再进入既有路由', () => {
    expect(joinedGroupsSource).toContain('conversations.openGroup');
    expect(joinedGroupsSource).toContain('buildGroupCardShareRoute(conversation.conversationID)');
    expect(joinedGroupsSource).toContain('buildJoinedGroupProfileRoute(conversation.conversationID, true)');
    expect(groupProfileSource).toContain("searchParams.get('edit') === 'name'");
  });

  it('普通退群只调用 shared facade 且不复制解散或角色规则', () => {
    expect(joinedGroupsSource).toContain('groupLifecycle.leave({');
    expect(joinedGroupsSource).toContain('clearHistory,');
    expect(joinedGroupsSource).not.toContain('groupLifecycle.dismiss');
    expect(joinedGroupsSource).not.toMatch(/roleLevel|myRoleLevel|GatewayHTTPClient|GroupRepository|@openim\//);
  });

  it('群主转让保持显式两步流程并返回群列表', () => {
    expect(joinedGroupsSource).toContain('buildJoinedGroupOwnerTransferRoute');
    expect(ownerTransferSource).toContain("fromJoinedGroups ? '/contacts/groups' : settingsURL");
    expect(ownerTransferSource).not.toContain('groupLifecycle.leave');
  });
});
