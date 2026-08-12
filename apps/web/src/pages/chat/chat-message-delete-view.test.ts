import type {
  Conversation,
  Message,
  WebIMJoinedGroup,
} from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import {
  canDeleteChatMessagesForAll,
  getChatDeleteForAllLabel,
  getChatDeleteResultNotice,
} from './chat-message-delete-view.js';

/** 创建删除权限测试使用的会话。 */
function createConversation(type: Conversation['type']): Conversation {
  return {
    conversationID: type === 'group' ? 'sg_group-1' : 'si_peer',
    type,
    targetID: type === 'group' ? 'group-1' : 'peer',
    name: type === 'group' ? '测试群聊' : '测试好友',
    unreadCount: 0,
    updatedAt: 1,
  };
}

/** 创建指定方向的可删除缓存消息。 */
function createMessage(direction: Message['direction']): Message {
  return {
    clientMsgID: `client-${direction}`,
    serverMsgID: `server-${direction}`,
    conversationID: 'sg_group-1',
    senderID: direction === 'outgoing' ? 'self' : 'peer',
    direction,
    contentType: 101,
    status: direction === 'outgoing' ? 'sent' : 'received',
    sendTime: 1,
    payload: { text: { text: direction } },
  };
}

/** 创建当前账号群角色缓存。 */
function createJoinedGroup(
  currentUserRole: WebIMJoinedGroup['currentUserRole'],
): WebIMJoinedGroup {
  return {
    groupID: 'group-1',
    conversationID: 'sg_group-1',
    name: '测试群聊',
    avatarURL: '',
    introduction: '',
    announcement: '',
    announcementVersion: '',
    memberCount: 3,
    ownerUserID: 'owner',
    currentUserRole,
    canEditAnnouncement: currentUserRole === 'owner',
    canMentionAll: currentUserRole !== 'member',
    isCreatedByCurrentUser: currentUserRole === 'owner',
    status: 'active',
  };
}

// 删除展示逻辑只映射 RN 语义，不参与 SDK mutation。
describe('chat message delete view', () => {
  it('allows direct chat and own group messages to delete for all', () => {
    expect(canDeleteChatMessagesForAll(
      createConversation('single'), [createMessage('incoming')], null,
    )).toBe(true);
    expect(canDeleteChatMessagesForAll(
      createConversation('group'), [createMessage('outgoing')], createJoinedGroup('member'),
    )).toBe(true);
  });

  it('requires owner or admin role for deleting other group members messages', () => {
    // incoming 是普通成员发送的消息。
    const incoming = createMessage('incoming');
    expect(canDeleteChatMessagesForAll(
      createConversation('group'), [incoming], createJoinedGroup('member'),
    )).toBe(false);
    expect(canDeleteChatMessagesForAll(
      createConversation('group'), [incoming], createJoinedGroup('admin'),
    )).toBe(true);
  });

  it('uses RN labels and reports partial results without fake success', () => {
    expect(getChatDeleteForAllLabel(createConversation('single'))).toBe('为我和 测试好友 删除');
    expect(getChatDeleteForAllLabel(createConversation('group'))).toBe('为我和所有群成员删除');
    expect(getChatDeleteResultNotice({
      deletedClientMsgIDs: ['client-ok'],
      failedCount: 1,
      list: [],
    })).toBe('删除完成：1条成功，1条失败');
  });
});
