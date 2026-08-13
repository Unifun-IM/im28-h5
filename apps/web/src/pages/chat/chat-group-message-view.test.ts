import type { Message, WebIMGroupMember } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import {
  buildChatGroupMemberProfileLocation,
  getChatGroupSenderView,
  indexChatGroupMembers,
  resolveChatMentionDisplayText,
} from './chat-group-message-view.js';

/** 构造 SDK 已完成名称优先级解析的群成员。 */
function createMember(
  overrides: Partial<WebIMGroupMember> = {},
): WebIMGroupMember {
  return {
    groupID: 'group-1',
    userID: 'user-2',
    nickname: '好友备注',
    remark: '好友备注',
    groupNickname: '群昵称',
    avatarURL: 'https://media.example.com/user-2.jpg',
    role: 'admin',
    roleLevel: 60,
    ...overrides,
  };
}

/** 构造携带稳定 mention 身份的群消息。 */
function createMessage(overrides: Partial<Message> = {}): Message {
  return {
    clientMsgID: 'message-1',
    conversationID: 'conversation-1',
    senderID: 'user-2',
    direction: 'incoming',
    contentType: 106,
    status: 'received',
    sendTime: 1,
    payload: { mention: { text: '@user-2 你好' } },
    mentions: [{ type: 'user', userID: 'user-2', nickname: '旧群昵称' }],
    ...overrides,
  };
}

describe('chat group message view', () => {
  it('群消息头像只携带稳定会话和发送人身份进入资料 route', () => {
    expect(buildChatGroupMemberProfileLocation(' conversation/1 ', ' user/2 '))
      .toEqual({
        pathname: '/contacts/users/user%2F2',
        state: {
          backHref: '/conversations/conversation%2F1',
          groupConversationID: 'conversation/1',
        },
      });
    expect(buildChatGroupMemberProfileLocation('', 'user-2')).toBeNull();
    expect(buildChatGroupMemberProfileLocation('conversation-1', ' ')).toBeNull();
  });

  it('发送人直接消费 SDK 已解析昵称并保留头像与角色', () => {
    /** membersByID 模拟当前群成员 cache。 */
    const membersByID = indexChatGroupMembers([createMember()]);
    expect(getChatGroupSenderView(createMessage(), membersByID)).toEqual({
      userID: 'user-2',
      displayName: '好友备注',
      avatarURL: 'https://media.example.com/user-2.jpg',
      roleLabel: '管理员',
    });
  });

  it('发送人名称严格遵循备注、群昵称、公开昵称顺序', () => {
    expect(getChatGroupSenderView(
      createMessage(),
      indexChatGroupMembers([createMember({ remark: '' })]),
    ).displayName).toBe('群昵称');
    expect(getChatGroupSenderView(
      createMessage(),
      indexChatGroupMembers([createMember({ remark: '', groupNickname: '' })]),
    ).displayName).toBe('好友备注');
  });

  it('mention 同时替换 userID 和历史昵称快照但保留稳定身份', () => {
    /** message 覆盖两种历史正文写法。 */
    const message = createMessage();
    /** membersByID 提供当前展示名。 */
    const membersByID = indexChatGroupMembers([createMember()]);
    expect(
      resolveChatMentionDisplayText(
        message,
        '@user-2 回复 @旧群昵称',
        membersByID,
      ),
    ).toBe('@好友备注 回复 @好友备注');
    expect(message.mentions?.[0]?.userID).toBe('user-2');
  });

  it('只替换带 @ 前缀的目标身份，不污染普通正文数字', () => {
    /** membersByID 提供当前展示名。 */
    const membersByID = indexChatGroupMembers([createMember()]);
    expect(
      resolveChatMentionDisplayText(
        createMessage(),
        '订单 user-2，提醒 @user-2',
        membersByID,
      ),
    ).toBe('订单 user-2，提醒 @好友备注');
  });

  it('成员快照缺失时显式回退发送人 ID', () => {
    expect(getChatGroupSenderView(createMessage(), new Map())).toMatchObject({
      displayName: 'user-2',
      avatarURL: '',
      roleLabel: '',
    });
  });
});
