import { describe, expect, it } from 'vitest';
import type { WebIMGroupMember } from '@im28/im-sdk/web';

import {
  buildGroupOwnerTransferEntries,
  retainGroupOwnerTransferSelection,
} from './group-owner-transfer-view.js';

/** 构造群主转让展示 helper 所需最小成员快照。 */
function createMember(
  userID: string,
  role: WebIMGroupMember['role'],
  nickname: string,
): WebIMGroupMember {
  return {
    groupID: 'group-1',
    userID,
    nickname,
    avatarURL: '',
    role,
    roleLevel: role === 'owner' ? 100 : role === 'admin' ? 60 : 20,
  };
}

describe('group owner transfer view', () => {
  it('排除当前群主并把管理员放在普通成员分组之前', () => {
    /** members 覆盖当前群主、管理员和普通成员。 */
    const members = [
      createMember('owner', 'owner', '群主'),
      createMember('admin', 'admin', '管理员'),
      createMember('member', 'member', '张三'),
    ];
    /** entries 应先展示管理员分组，再展示普通成员字母分组。 */
    const entries = buildGroupOwnerTransferEntries(members, 'owner', '');
    expect(entries.map(entry => entry.type === 'section' ? entry.title : entry.member.userID))
      .toEqual(['群主及群管理员', 'admin', 'Z', 'member']);
  });

  it('搜索使用共享名称优先级和稳定用户 ID', () => {
    /** members 提供可按昵称或用户 ID 命中的普通成员。 */
    const members = [createMember('member-100', 'member', '新群主')];
    expect(buildGroupOwnerTransferEntries(members, 'owner', '新群').length).toBe(2);
    expect(buildGroupOwnerTransferEntries(members, 'owner', '100').length).toBe(2);
    expect(buildGroupOwnerTransferEntries(members, 'owner', '不存在')).toEqual([]);
  });

  it('成员角色刷新后清理不再可转让的选中身份', () => {
    /** member 最初是可转让的普通成员。 */
    const member = createMember('member', 'member', '成员');
    expect(retainGroupOwnerTransferSelection('member', [member], 'owner')).toBe('member');
    expect(retainGroupOwnerTransferSelection('member', [{ ...member, role: 'owner', roleLevel: 100 }], 'owner')).toBe('');
  });
});
