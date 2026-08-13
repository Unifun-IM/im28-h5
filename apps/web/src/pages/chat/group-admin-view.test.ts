import { describe, expect, it } from 'vitest';
import type { WebIMGroupMember } from '@im28/im-sdk/web';

import {
  filterGroupAdminCandidates,
  getGroupAdminMembers,
  IM_GROUP_ADMIN_LIMIT,
  retainGroupAdminCandidateSelection,
  toggleGroupAdminSelection,
} from './group-admin-view.js';

/** 构造管理员视图 helper 所需最小 shared 成员快照。 */
function createMember(
  userID: string,
  role: WebIMGroupMember['role'],
  nickname: string,
  overrides: Partial<WebIMGroupMember> = {},
): WebIMGroupMember {
  return {
    groupID: 'group-1',
    userID,
    nickname,
    avatarURL: '',
    role,
    roleLevel: role === 'owner' ? 100 : role === 'admin' ? 60 : 20,
    ...overrides,
  };
}

describe('group admin view', () => {
  it('只投影管理员并由 shared 候选规则排除群主和已有管理员', () => {
    /** members 覆盖群主、管理员和普通成员三种角色。 */
    const members = [
      createMember('owner', 'owner', '群主'),
      createMember('admin', 'admin', '管理员'),
      createMember('member', 'member', '普通成员'),
    ];
    expect(getGroupAdminMembers(members).map(member => member.userID)).toEqual(['admin']);
    expect(filterGroupAdminCandidates(members, '').map(member => member.userID)).toEqual(['member']);
  });

  it('搜索同时匹配备注、群昵称、公开昵称和用户 ID', () => {
    /** member 带完整 shared 名称层级字段。 */
    const member = createMember('user-100', 'member', '公开昵称', {
      remark: '好友备注',
      groupNickname: '群内昵称',
    });
    expect(filterGroupAdminCandidates([member], '好友').length).toBe(1);
    expect(filterGroupAdminCandidates([member], '群内').length).toBe(1);
    expect(filterGroupAdminCandidates([member], '公开').length).toBe(1);
    expect(filterGroupAdminCandidates([member], '100').length).toBe(1);
    expect(filterGroupAdminCandidates([member], '不存在')).toEqual([]);
  });

  it('选择达到剩余名额后拒绝新增，但仍允许取消已选项', () => {
    /** selected 表示页面已经选中一个候选且只剩一个名额。 */
    const selected = new Set(['member-1']);
    expect([...toggleGroupAdminSelection(selected, 'member-2', 1)]).toEqual(['member-1']);
    expect([...toggleGroupAdminSelection(selected, 'member-1', 1)]).toEqual([]);
    expect([...selected]).toEqual(['member-1']);
  });

  it('管理员上限来自 SDK 且角色刷新会清理失效选择', () => {
    /** candidates 只保留仍可设置为管理员的普通成员。 */
    const candidates = [createMember('member-1', 'member', '成员一')];
    /** selected 包含一个已不在候选快照中的历史身份。 */
    const selected = new Set(['member-1', 'member-2']);
    expect(IM_GROUP_ADMIN_LIMIT).toBe(10);
    expect([...retainGroupAdminCandidateSelection(selected, candidates)]).toEqual(['member-1']);
  });
});
