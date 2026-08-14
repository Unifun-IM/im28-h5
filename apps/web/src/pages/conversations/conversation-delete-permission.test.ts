import type {
  WebIMConversationListItem,
  WebIMJoinedGroup,
} from '@im28/im-sdk/web';
import { describe, expect, it, vi } from 'vitest';

import {
  resolveConversationDeleteForAllPermission,
  type ConversationDeleteGroupPermissionSource,
} from './conversation-delete-permission.js';

/** 构造删除权限测试所需的最小会话列表实体。 */
function createConversationTarget(
  type: 'single' | 'group',
): WebIMConversationListItem {
  return {
    conversation: {
      conversationID: `${type}-conversation`,
      type,
      targetID: `${type}-target`,
      name: '',
      faceURL: '',
      unreadCount: 0,
      manualUnread: false,
      isPinned: false,
      isMuted: false,
      isArchived: false,
      draft: '',
      updatedAt: 0,
    },
    latestMessage: null,
    unreadMention: null,
  };
}

/** 构造包含指定清空权限的最小 shared 群投影。 */
function createJoinedGroup(canClearMessages: boolean): WebIMJoinedGroup {
  return {
    groupID: 'group-target',
    conversationID: 'group-conversation',
    name: '测试群',
    avatarURL: '',
    introduction: '',
    announcement: '',
    announcementVersion: '',
    memberCount: 1,
    ownerUserID: 'owner',
    currentUserRole: canClearMessages ? 'owner' : 'member',
    permissions: {
      canEditGroupInfo: canClearMessages,
      canEditAnnouncement: canClearMessages,
      canInviteMembers: canClearMessages,
      canRemoveMembers: canClearMessages,
      canAuditApplications: canClearMessages,
      canOpenGroupManage: canClearMessages,
      canManageAdmins: canClearMessages,
      canTransferOwner: canClearMessages,
      canDismissGroup: canClearMessages,
      canQuitGroup: !canClearMessages,
      canMuteAll: canClearMessages,
      canMuteMembers: canClearMessages,
      canClearMessages,
      canMentionAll: canClearMessages,
    },
    canEditAnnouncement: canClearMessages,
    canMentionAll: canClearMessages,
    isCreatedByCurrentUser: canClearMessages,
    status: 'active',
  };
}

/** 构造可观测缓存与远端群列表调用的权限来源。 */
function createPermissionSource(
  cachedGroups: readonly WebIMJoinedGroup[],
  syncedGroups: readonly WebIMJoinedGroup[],
): ConversationDeleteGroupPermissionSource {
  return {
    listCached: vi.fn(async () => cachedGroups),
    sync: vi.fn(async () => syncedGroups),
  };
}

describe('conversation delete permission', () => {
  it('allows single conversation deletion for both sides without group reads', async () => {
    // source 验证单聊不会触发无关群同步。
    const source = createPermissionSource([], []);
    await expect(resolveConversationDeleteForAllPermission(
      createConversationTarget('single'),
      source,
    )).resolves.toBe(true);
    expect(source.listCached).not.toHaveBeenCalled();
  });

  it('uses cached group permission without remote sync', async () => {
    // source 提供已缓存的明确权限事实。
    const source = createPermissionSource([createJoinedGroup(true)], []);
    await expect(resolveConversationDeleteForAllPermission(
      createConversationTarget('group'),
      source,
    )).resolves.toBe(true);
    expect(source.sync).not.toHaveBeenCalled();
  });

  it('refreshes shared groups when the target group cache is cold', async () => {
    // source 模拟会话已存在但群缓存尚未初始化的真实启动顺序。
    const source = createPermissionSource([], [createJoinedGroup(true)]);
    await expect(resolveConversationDeleteForAllPermission(
      createConversationTarget('group'),
      source,
    )).resolves.toBe(true);
    expect(source.sync).toHaveBeenCalledTimes(1);
  });
});
