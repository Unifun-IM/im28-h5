import { describe, expect, it } from 'vitest';
import type { WebIMGroupMember } from '@im28/im-sdk/web';

import {
  buildGroupMemberListEntries,
  filterGroupMembers,
  getGroupMemberDisplayName,
  getGroupMemberIndexes,
  getGroupMemberRoleLabel,
} from './group-members-view.js';

/** 构造群成员投影测试使用的共享 DTO。 */
function createMember(overrides: Partial<WebIMGroupMember> = {}): WebIMGroupMember {
  return {
    groupID: 'group-1',
    userID: 'user-1',
    nickname: '公开昵称',
    avatarURL: '',
    role: 'member',
    roleLevel: 20,
    ...overrides,
  };
}

describe('group members view', () => {
  it('复用 SDK 的备注、群昵称、公开昵称和 ID 优先级', () => {
    expect(getGroupMemberDisplayName(createMember({
      remark: '好友备注',
      groupNickname: '群昵称',
    }))).toBe('好友备注');
    expect(getGroupMemberDisplayName(createMember({ remark: '', groupNickname: '群昵称' }))).toBe('群昵称');
    expect(getGroupMemberDisplayName(createMember({ nickname: '', userID: 'user-2' }))).toBe('user-2');
  });

  it('按名称或用户 ID 搜索并按 RN 拼音生成分组', () => {
    /** members 覆盖中文、拉丁和 ID 搜索。 */
    const members = [
      createMember({ userID: 'u-z', nickname: '张三' }),
      createMember({ userID: 'u-a', nickname: 'Alice', role: 'owner', roleLevel: 100 }),
      createMember({ userID: 'u-l', nickname: '李四', role: 'admin', roleLevel: 60 }),
    ];
    /** entries 验证页面不使用 SDK 角色顺序替代 RN 拼音顺序。 */
    const entries = buildGroupMemberListEntries(members, '');
    expect(getGroupMemberIndexes(entries)).toEqual(['A', 'L', 'Z']);
    expect(entries.filter(entry => entry.type === 'member').map(entry => entry.displayName))
      .toEqual(['Alice', '李四', '张三']);
    expect(filterGroupMembers(members, 'u-l')).toEqual([members[2]]);
  });

  it('只为群主和管理员展示角色标签', () => {
    expect(getGroupMemberRoleLabel('owner')).toBe('群主');
    expect(getGroupMemberRoleLabel('admin')).toBe('管理员');
    expect(getGroupMemberRoleLabel('member')).toBe('');
  });
});
