import type { WebIMJoinedGroup } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';
import { createGroupPermissionsFixture } from '../../test-fixtures/group-permissions.js';

import {
  buildGroupIntroductionView,
  normalizeGroupIntroductionDraft,
} from './group-introduction-view.js';

/** 构造简介视图测试需要的最小 shared 群快照。 */
function createGroup(currentUserRole: WebIMJoinedGroup['currentUserRole']): WebIMJoinedGroup {
  return {
    groupID: 'group-1',
    conversationID: 'conversation-group-1',
    name: '产品群',
    avatarURL: '',
    introduction: '用于同步产品进度',
    announcement: '',
    announcementVersion: '',
    memberCount: 3,
    ownerUserID: 'owner-user',
    currentUserRole,
    permissions: createGroupPermissionsFixture(currentUserRole),
    canEditAnnouncement: currentUserRole !== 'member',
    canMentionAll: currentUserRole !== 'member',
    isCreatedByCurrentUser: currentUserRole === 'owner',
    status: 'active',
  };
}

describe('group introduction view', () => {
  it('只允许 owner/admin 编辑并保留 shared 简介', () => {
    expect(buildGroupIntroductionView(createGroup('owner'))).toEqual({
      introduction: '用于同步产品进度',
      canEdit: true,
    });
    expect(buildGroupIntroductionView(createGroup('admin')).canEdit).toBe(true);
    expect(buildGroupIntroductionView(createGroup('member')).canEdit).toBe(false);
  });

  it('规范化 trim 并拒绝空值和超过 500 字', () => {
    expect(normalizeGroupIntroductionDraft('  新简介  ', 500)).toBe('新简介');
    expect(() => normalizeGroupIntroductionDraft('   ', 500)).toThrow('群简介不能为空');
    expect(() => normalizeGroupIntroductionDraft('介'.repeat(501), 500)).toThrow(
      '群简介最多 500 个字符',
    );
  });
});
