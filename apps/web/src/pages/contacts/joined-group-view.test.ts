import type { Conversation, WebIMJoinedGroup } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import {
  filterJoinedGroups,
  findJoinedGroupConversationID,
  getJoinedGroupBadges,
  getJoinedGroupDescription,
  getJoinedGroupStatusLabel,
} from './joined-group-view.js';

/** 创建纯视图测试使用的标准群记录。 */
function createGroup(
  overrides: Partial<WebIMJoinedGroup> = {},
): WebIMJoinedGroup {
  return {
    groupID: 'g1',
    conversationID: 'sg_g1',
    name: '产品群',
    avatarURL: '',
    introduction: '',
    memberCount: 12,
    ownerUserID: 'owner',
    currentUserRole: 'member',
    isCreatedByCurrentUser: false,
    status: 'active',
    ...overrides,
  };
}

// 群列表 view helper 锁定 RN 搜索、描述、身份和会话导航语义。
describe('joined group view', () => {
  it('按群名或群 ID 搜索并保留 SDK 顺序', () => {
    // groups 提供两条可区分记录。
    const groups = [
      createGroup(),
      createGroup({ groupID: 'dev-2', name: '研发群' }),
    ];
    expect(filterJoinedGroups(groups, '产品')).toEqual([groups[0]]);
    expect(filterJoinedGroups(groups, 'DEV')).toEqual([groups[1]]);
    expect(filterJoinedGroups(groups, ' ')).toBe(groups);
  });

  it('映射群状态并组合 RN 描述', () => {
    expect(getJoinedGroupStatusLabel('banned')).toBe('已封禁');
    expect(getJoinedGroupStatusLabel('dismissed')).toBe('已解散');
    expect(getJoinedGroupStatusLabel('muted')).toBe('禁言中');
    expect(getJoinedGroupDescription(createGroup({ status: 'dismissed' })))
      .toBe('已解散 · 12人 · ID：g1');
  });

  it('零成员和正常状态只展示群 ID', () => {
    expect(getJoinedGroupDescription(createGroup({ memberCount: 0 })))
      .toBe('ID：g1');
  });

  it('按创建者和当前角色生成身份标签', () => {
    expect(getJoinedGroupBadges({
      isCreatedByCurrentUser: true,
      currentUserRole: 'owner',
    })).toEqual(['creator', 'owner']);
    expect(getJoinedGroupBadges({
      isCreatedByCurrentUser: false,
      currentUserRole: 'admin',
    })).toEqual(['admin']);
    expect(getJoinedGroupBadges({
      isCreatedByCurrentUser: false,
      currentUserRole: 'member',
    })).toEqual([]);
  });

  it('优先按 conversation ID，再按群 target ID 解析会话', () => {
    // conversations 覆盖 exact 和 target fallback。
    const conversations = [
      { conversationID: 'sg_g1', type: 'group', targetID: 'other' },
      { conversationID: 'sg_g2', type: 'group', targetID: 'g2' },
    ] as Conversation[];
    expect(findJoinedGroupConversationID(createGroup(), conversations))
      .toBe('sg_g1');
    expect(findJoinedGroupConversationID(
      createGroup({ groupID: 'g2', conversationID: '' }),
      conversations,
    )).toBe('sg_g2');
    expect(findJoinedGroupConversationID(
      createGroup({ groupID: 'missing', conversationID: '' }),
      conversations,
    )).toBe('');
  });
});
