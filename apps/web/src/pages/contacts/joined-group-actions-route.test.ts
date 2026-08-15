import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import joinedGroupsSource from './useJoinedGroupsPageState.ts?raw';
import joinedGroupActionMenuSource from './JoinedGroupActionMenu.tsx?raw';
import groupProfileSource from '../chat/GroupProfilePage.tsx?raw';
import ownerTransferSource from '../chat/GroupOwnerTransferPage.tsx?raw';

/** 群列表样式源码用于锁定退出 ActionSheet 的全宽与分组约束。 */
const joinedGroupsStyleSource = readFileSync(new URL('./joined-groups-page.css', import.meta.url), 'utf8');

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

  it('群主退出复用 shared 最早管理员选择与同一退群 facade', () => {
    expect(joinedGroupsSource).toContain('selectIMEarliestGroupAdmin(members)');
    expect(joinedGroupsSource).toContain('groupMembers.sync(group.groupID, { pageSize: 100 })');
    expect(joinedGroupsSource).toContain('settings/manage/admins');
    expect(joinedGroupsSource).not.toContain('buildJoinedGroupOwnerTransferRoute');
    expect(ownerTransferSource).not.toContain('groupLifecycle.leave');
  });

  it('普通成员退出弹窗保持 RN 全宽底部 ActionSheet 结构', () => {
    expect(joinedGroupActionMenuSource).not.toContain('<h2>退出群聊</h2>');
    expect(joinedGroupActionMenuSource).toContain('rn-joined-group-quit-cancel');
    expect(joinedGroupsStyleSource).toMatch(/\.rn-joined-group-quit-modal\s*\{[^}]*width:\s*100%/s);
    expect(joinedGroupsStyleSource).toMatch(/\.rn-joined-group-quit-modal\s*\{[^}]*gap:\s*8px/s);
  });
});
