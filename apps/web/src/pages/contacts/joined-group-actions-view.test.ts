import type { WebIMJoinedGroup } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';
import { createGroupPermissionsFixture } from '../../test-fixtures/group-permissions.js';

import {
  buildJoinedGroupProfileRoute,
  getJoinedGroupActionMenuState,
  getJoinedGroupActions,
  getJoinedGroupQuitMode,
} from './joined-group-actions-view.js';

/** 创建群列表动作测试使用的标准 shared DTO。 */
function createGroup(
  role: WebIMJoinedGroup['currentUserRole'],
): WebIMJoinedGroup {
  return {
    groupID: 'group/a',
    conversationID: 'sg_group/a',
    name: '产品群',
    avatarURL: '',
    introduction: '',
    announcement: '',
    announcementVersion: '',
    memberCount: 3,
    ownerUserID: role === 'owner' ? 'me' : 'owner',
    currentUserRole: role,
    permissions: createGroupPermissionsFixture(role),
    canEditAnnouncement: role === 'owner',
    canMentionAll: role !== 'member',
    isCreatedByCurrentUser: role === 'owner',
    status: 'active',
  };
}

// 群列表动作 view 锁定 RN 顺序、shared capability 和稳定 SPA 路由。
describe('joined group actions view', () => {
  it('普通成员展示分享与退出，管理角色额外展示修改群名称', () => {
    expect(getJoinedGroupActions(createGroup('member'))).toEqual(['share-card', 'quit']);
    expect(getJoinedGroupActions(createGroup('admin'))).toEqual(['share-card', 'quit', 'edit-name']);
    expect(getJoinedGroupActions(createGroup('owner'))).toEqual(['share-card', 'quit', 'edit-name']);
  });

  it('退出模式只读取 shared lifecycle capability', () => {
    expect(getJoinedGroupQuitMode(createGroup('member'))).toBe('leave');
    expect(getJoinedGroupQuitMode(createGroup('admin'))).toBe('leave');
    expect(getJoinedGroupQuitMode(createGroup('owner'))).toBe('owner');
  });

  it('按动作数量计算气泡翻转并限制在视口内', () => {
    /** below 是顶部空间不足时的成员菜单。 */
    const below = getJoinedGroupActionMenuState({
      group: createGroup('member'), point: { x: 4, y: 10 }, viewportWidth: 320, viewportHeight: 640,
    });
    /** above 是底部长按时的管理菜单。 */
    const above = getJoinedGroupActionMenuState({
      group: createGroup('owner'), point: { x: 300, y: 600 }, viewportWidth: 320, viewportHeight: 640,
    });
    expect(below).toMatchObject({ placement: 'below', left: 8, top: 22 });
    expect(above.placement).toBe('above');
    expect(above.left).toBe(144);
    expect(above.top).toBe(420);
  });

  it('资料路由始终编码 canonical Conversation 身份', () => {
    expect(buildJoinedGroupProfileRoute('sg/a', true))
      .toBe('/conversations/sg%2Fa/settings/profile?edit=name');
  });
});
