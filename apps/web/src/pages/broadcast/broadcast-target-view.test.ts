import { describe, expect, it } from 'vitest';

import {
  filterBroadcastTargets,
  resolveBroadcastDisplayTargets,
} from './broadcast-target-view.js';

describe('broadcast target view', () => {
  it('restores selected order from contact and group facades', () => {
    /** contacts 模拟 shared facade 好友结果。 */
    const contacts = [{
      userID: 'user-1', displayName: '好友一', nickname: '好友一', remark: '',
      avatarURL: '', account: '', phone: '', email: '', bio: '', isStarred: false, addedAt: '',
    }];
    /** groups 模拟 shared facade 已加入群结果。 */
    const groups = [{
      groupID: 'group-1', conversationID: 'conversation-1', name: '研发群', avatarURL: '',
      memberCount: 3, status: 'active' as const, ownerUserID: '', introduction: '',
      announcement: '', announcementVersion: '', currentUserRole: 'member' as const,
      permissions: {
        canEditGroupInfo: false, canEditAnnouncement: false, canInviteMembers: false,
        canRemoveMembers: false, canAuditApplications: false, canOpenGroupManage: false,
        canManageAdmins: false, canTransferOwner: false, canDismissGroup: false,
        canQuitGroup: true, canMuteAll: false, canMuteMembers: false,
        canClearMessages: false, canMentionAll: false,
      },
      canEditAnnouncement: false, canMentionAll: false, isCreatedByCurrentUser: false,
    }];
    expect(resolveBroadcastDisplayTargets([
      { kind: 'group', targetID: 'group-1' },
      { kind: 'friend', targetID: 'user-1' },
    ], contacts, groups).map(target => target.title)).toEqual(['研发群', '好友一']);
  });

  it('filters by title and stable ID', () => {
    /** targets 覆盖展示名和 ID 两类查询。 */
    const targets = resolveBroadcastDisplayTargets(
      [{ kind: 'friend', targetID: 'user-100' }],
      [],
      [],
    );
    expect(filterBroadcastTargets(targets, '100')).toHaveLength(1);
    expect(filterBroadcastTargets(targets, 'missing')).toHaveLength(0);
  });
});
