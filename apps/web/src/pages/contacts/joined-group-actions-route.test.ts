import { describe, expect, it } from 'vitest';

import joinedGroupsSource from './useJoinedGroupsPageState.ts?raw';
import joinedGroupActionMenuSource from './JoinedGroupActionMenu.tsx?raw';
import groupProfileSource from '../chat/GroupProfilePage.tsx?raw';
import ownerTransferSource from '../chat/GroupOwnerTransferPage.tsx?raw';

/** 群列表长按动作必须复用既有 SPA route 和 shared lifecycle owner。 */
describe('joined group actions route contract', () => {
  it('分享直接打开全局弹窗，改名先解析 canonical Conversation 再进入既有路由', () => {
    expect(joinedGroupsSource).toContain('conversations.openGroup');
    expect(joinedGroupsSource).toContain('shareModal.openShare({');
    expect(joinedGroupsSource).toContain("kind: 'group-card'");
    expect(joinedGroupsSource).toContain('buildJoinedGroupProfileRoute(conversation.conversationID, true)');
    expect(groupProfileSource).toContain("searchParams.get('edit') === 'name'");
  });

  it('普通退群只调用 shared facade 且不复制解散或角色规则', () => {
    expect(joinedGroupsSource).toContain('groupLifecycle.leave({');
    expect(joinedGroupsSource).toContain('clearHistory,');
    expect(joinedGroupsSource).not.toContain('groupLifecycle.dismiss');
    expect(joinedGroupsSource).not.toMatch(/roleLevel|myRoleLevel|GatewayHTTPClient|GroupRepository|@openim\//);
  });

  it('群主退出复用 shared 最早管理员选择与同一退群 facade', () => {
    expect(joinedGroupsSource).toContain('selectIMEarliestGroupAdmin(members)');
    expect(joinedGroupsSource).toContain('groupMembers.sync(group.groupID, { pageSize: 100 })');
    expect(joinedGroupsSource).toContain('settings/manage/admins');
    expect(joinedGroupsSource).not.toContain('buildJoinedGroupOwnerTransferRoute');
    expect(ownerTransferSource).not.toContain('groupLifecycle.leave');
  });

  it('普通成员退出弹窗保持 RN ActionSheet 分组结构', () => {
    expect(joinedGroupActionMenuSource).not.toContain('<h2>退出群聊</h2>');
    expect(joinedGroupActionMenuSource).toContain('rn-joined-group-quit-cancel');
  });
});
