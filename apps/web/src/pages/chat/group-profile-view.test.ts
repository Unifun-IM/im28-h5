import { describe, expect, it } from 'vitest';
import type { Conversation, WebIMJoinedGroup } from '@im28/im-sdk/web';
import { createGroupPermissionsFixture } from '../../test-fixtures/group-permissions.js';

import { buildGroupProfileView } from './group-profile-view.js';

/** 构造群资料投影测试使用的真实群会话。 */
function createConversation(): Conversation {
  return {
    conversationID: 'conversation-group-1',
    type: 'group',
    targetID: 'group-1',
    name: '旧群昵称',
    unreadCount: 0,
    updatedAt: 1,
  };
}

/** 构造群资料投影测试使用的 shared 群快照。 */
function createGroup(overrides: Partial<WebIMJoinedGroup> = {}): WebIMJoinedGroup {
  /** currentUserRole 决定测试默认 capability。 */
  const currentUserRole = overrides.currentUserRole ?? 'owner';
  return {
    groupID: 'group-1',
    conversationID: 'conversation-group-1',
    name: '新群昵称',
    avatarURL: 'https://example.test/group.png',
    introduction: '',
    announcement: '',
    announcementVersion: '',
    memberCount: 3,
    ownerUserID: 'owner',
    currentUserRole,
    permissions: createGroupPermissionsFixture(currentUserRole),
    canEditAnnouncement: true,
    canMentionAll: true,
    isCreatedByCurrentUser: true,
    status: 'active',
    ...overrides,
  };
}

describe('group profile view', () => {
  it('uses the matching shared group snapshot and owner/admin edit permission', () => {
    // view 必须优先使用 shared 群资料而不是旧会话展示值。
    const view = buildGroupProfileView(createConversation(), createGroup());
    expect(view).toEqual({
      conversationID: 'conversation-group-1',
      groupID: 'group-1',
      name: '新群昵称',
      avatarURL: 'https://example.test/group.png',
      canEdit: true,
    });
    expect(buildGroupProfileView(
      createConversation(),
      createGroup({ currentUserRole: 'member' }),
    ).canEdit).toBe(false);
  });

  it('rejects single conversations and mismatched group snapshots', () => {
    // singleConversation 证明页面不能从单聊路由伪造群资料。
    const singleConversation = { ...createConversation(), type: 'single' as const };
    expect(() => buildGroupProfileView(singleConversation, createGroup())).toThrow();
    expect(() => buildGroupProfileView(
      createConversation(),
      createGroup({ groupID: 'other-group' }),
    )).toThrow();
  });
});
