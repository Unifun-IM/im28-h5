import { describe, expect, it } from 'vitest';

import {
  buildGroupRemoveMemberCandidates,
  reconcileGroupRemoveMemberSelection,
} from './group-remove-members-view.js';

/** 构造候选投影所需的最小共享成员。 */
const member = (
  userID: string,
  role: 'owner' | 'admin' | 'member',
  roleLevel: number,
  nickname = userID,
) => ({ groupID: 'group-1', userID, role, roleLevel, nickname, avatarURL: '' });

describe('group remove members view', () => {
  it('管理员候选排除本人、群主和其他管理员并支持名称搜索', () => {
    /** members 覆盖 RN 候选边界。 */
    const members = [
      member('owner', 'owner', 100),
      member('self', 'admin', 60),
      member('admin-2', 'admin', 60),
      member('member-1', 'member', 20, '可移除成员'),
    ];
    expect(buildGroupRemoveMemberCandidates(members, 'self', '可移除')).toEqual([
      expect.objectContaining({ member: expect.objectContaining({ userID: 'member-1' }) }),
    ]);
  });

  it('成员快照变化后会丢弃过期选择', () => {
    /** candidates 只保留仍有效的成员身份。 */
    const candidates = buildGroupRemoveMemberCandidates([
      member('owner', 'owner', 100),
      member('member-1', 'member', 20),
    ], 'owner', '');
    expect([...reconcileGroupRemoveMemberSelection(
      new Set(['member-1', 'removed-member']),
      candidates,
    )]).toEqual(['member-1']);
  });
});
