import { describe, expect, it } from 'vitest';
import type { WebIMContact } from '@im28/im-sdk/web';

import {
  buildGroupInviteMemberCandidates,
  canSubmitGroupInvitation,
  reconcileGroupInviteMemberSelection,
} from './group-invite-members-view.js';

/** 构造好友候选使用的最小标准 DTO。 */
function createContact(
  userID: string,
  displayName: string,
  allowGroupInvite?: boolean,
): WebIMContact {
  return {
    userID,
    displayName,
    nickname: displayName,
    remark: '',
    account: '',
    phone: '',
    email: '',
    avatarURL: '',
    isStarred: false,
    ...(allowGroupInvite === undefined ? {} : { allowGroupInvite }),
    addedAt: '',
  };
}

// 邀请页视图只负责搜索和选择，不复制 shared 权限规则。
describe('group invite members view', () => {
  it('只展示未入群且明确允许邀请的好友并支持名称搜索', () => {
    /** contacts 覆盖备注展示、已入群、拒绝和未知权限。 */
    const contacts = [
      createContact('member-1', '群内好友', true),
      createContact('friend-1', '可邀请好友', true),
      createContact('friend-2', '拒绝邀请', false),
      createContact('friend-3', '未知权限'),
    ];
    expect(buildGroupInviteMemberCandidates(contacts, ['member-1'], '可邀请'))
      .toEqual([{ contact: contacts[1], displayName: '可邀请好友' }]);
  });

  it('成员或权限变化后清理过期选择', () => {
    /** candidates 表示刷新后仍可邀请的唯一好友。 */
    const candidates = buildGroupInviteMemberCandidates([
      createContact('friend-1', '好友一', true),
    ], [], '');
    expect([...reconcileGroupInviteMemberSelection(
      new Set(['friend-1', 'friend-2']),
      candidates,
    )]).toEqual(['friend-1']);
  });

  it('审核群填写理由后才允许提交，直邀群不校验理由', () => {
    expect(canSubmitGroupInvitation({
      selectedCount: 1,
      requiresApproval: true,
      reason: '   ',
      blocked: false,
    })).toBe(false);
    expect(canSubmitGroupInvitation({
      selectedCount: 1,
      requiresApproval: true,
      reason: '请同意入群',
      blocked: false,
    })).toBe(true);
    expect(canSubmitGroupInvitation({
      selectedCount: 1,
      requiresApproval: false,
      reason: '',
      blocked: false,
    })).toBe(true);
  });
});
