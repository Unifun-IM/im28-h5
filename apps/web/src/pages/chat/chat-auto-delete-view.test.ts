import type { Conversation, WebIMJoinedGroup } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import {
  CHAT_AUTO_DELETE_OPTIONS,
  canManageChatAutoDelete,
  formatChatAutoDeleteValue,
  normalizeChatAutoDeleteSelection,
} from './chat-auto-delete-view.js';

/** 构造权限投影测试使用的共享会话。 */
function createConversation(type: Conversation['type']): Conversation {
  return {
    conversationID: 'conversation-1',
    type,
    targetID: type === 'group' ? 'group-1' : 'peer-1',
    unreadCount: 0,
    updatedAt: 1,
  };
}

/** 构造指定当前用户角色的群快照。 */
function createGroup(
  currentUserRole: WebIMJoinedGroup['currentUserRole'],
): WebIMJoinedGroup {
  return {
    groupID: 'group-1',
    conversationID: 'conversation-1',
    name: '群聊',
    avatarURL: '',
    introduction: '',
    memberCount: 3,
    ownerUserID: 'owner-1',
    currentUserRole,
    canMentionAll: currentUserRole !== 'member',
    isCreatedByCurrentUser: currentUserRole === 'owner',
    status: 'active',
  };
}

/** 自动删除页面投影锁定 RN 档位和 fail-closed 权限。 */
describe('chat auto delete view', () => {
  /** 页面档位必须与 RN 当前交互完全一致。 */
  it('keeps the nine RN options in order', () => {
    expect(CHAT_AUTO_DELETE_OPTIONS.map(item => item.seconds)).toEqual([
      0, 21_600, 43_200, 86_400, 259_200, 604_800, 2_592_000, 7_776_000,
      15_552_000,
    ]);
  });

  /** 单聊可设置，群聊仅群主和管理员可设置。 */
  it('fails closed for group member and unknown group cache', () => {
    expect(canManageChatAutoDelete(createConversation('single'), null)).toBe(true);
    expect(canManageChatAutoDelete(createConversation('group'), createGroup('owner'))).toBe(true);
    expect(canManageChatAutoDelete(createConversation('group'), createGroup('admin'))).toBe(true);
    expect(canManageChatAutoDelete(createConversation('group'), createGroup('member'))).toBe(false);
    expect(canManageChatAutoDelete(createConversation('group'), null)).toBe(false);
  });

  /** 未展示的协议档位不得被页面悄悄提交。 */
  it('formats known values and keeps hidden values unselected', () => {
    expect(formatChatAutoDeleteValue(604_800)).toBe('7天');
    expect(formatChatAutoDeleteValue(1_296_000)).toBe('未设置');
    expect(normalizeChatAutoDeleteSelection(1_296_000)).toBeNull();
  });
});
