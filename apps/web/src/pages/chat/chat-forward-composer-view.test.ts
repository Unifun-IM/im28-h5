import type { Conversation, Message, WebIMGroupMember } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import {
  buildChatForwardComposerSummary,
  resolveChatForwardPreviewOrigin,
  resolveChatForwardSenderNames,
} from './chat-forward-composer-view.js';

/** 创建只覆盖转发摘要所需字段的缓存消息。 */
function createMessage(id: string, senderID: string, text: string): Message {
  return {
    clientMsgID: id,
    conversationID: 'source-group',
    senderID,
    direction: senderID === 'self' ? 'outgoing' : 'incoming',
    contentType: 101,
    status: 'sent',
    sendTime: 1,
    payload: { text: { text } },
  };
}

/** 创建 SDK 已完成名称分字段投影的群成员快照。 */
function createMember(userID: string, nickname: string): WebIMGroupMember {
  return {
    groupID: 'group-1',
    userID,
    nickname,
    avatarURL: '',
    role: 'member',
    roleLevel: 20,
  };
}

describe('chat forward composer RN sender summary', () => {
  it('多条消息按顺序去重展示本人和群成员昵称', () => {
    /** messages 包含本人重复消息和另一名群成员。 */
    const messages = [
      createMessage('m1', 'self', '第一条'),
      createMessage('m2', 'peer-1', '第二条'),
      createMessage('m3', 'self', '第三条'),
    ];
    /** sourceConversation 证明发送者来自来源群，而不是目标聊天。 */
    const sourceConversation = {
      conversationID: 'source-group',
      type: 'group',
      targetID: 'group-1',
      name: '来源群',
      unreadCount: 0,
      lastMessageSeq: 0,
      updatedAt: 1,
    } as Conversation;
    /** senderNames 复用 shared 群成员名称优先级并识别本人。 */
    const senderNames = resolveChatForwardSenderNames(messages, {
      currentUserID: 'self',
      sourceConversation,
      sourceConversationTitle: '来源群',
      sourceMembers: [createMember('peer-1', '爱吃冰淇凌')],
    });
    expect(buildChatForwardComposerSummary(messages, senderNames)).toBe(
      '来自：您自己，爱吃冰淇凌',
    );
  });

  it('超过两名发送者沿用 RN 的等N人摘要', () => {
    /** messages 保持三名发送者的首次出现顺序。 */
    const messages = [
      createMessage('m1', 'u1', '1'),
      createMessage('m2', 'u2', '2'),
      createMessage('m3', 'u3', '3'),
    ];
    /** senderNames 模拟来源缓存已解析的最终展示名。 */
    const senderNames = new Map([
      ['u1', '甲'],
      ['u2', '乙'],
      ['u3', '丙'],
    ]);
    expect(buildChatForwardComposerSummary(messages, senderNames)).toBe('来自：甲，乙等3人');
  });

  it('单条消息展示发送者名称和正文', () => {
    /** message 验证单条仍保留 RN 正文摘要，而不是只显示来源集合。 */
    const message = createMessage('m1', 'peer-1', '2323');
    expect(buildChatForwardComposerSummary([message], new Map([['peer-1', 'donk']]))).toBe(
      'donk：2323',
    );
  });

  it('预览新来源使用已解析备注名而不是格式化用户 ID', () => {
    /** message 模拟没有历史 forwardOrigin 的普通来源消息。 */
    const message = createMessage('m1', 'peer-1', '2323');
    expect(resolveChatForwardPreviewOrigin(
      message,
      new Map([['peer-1', 'donk二大爷备注名']]),
    )).toMatchObject({ userID: 'peer-1', name: 'donk二大爷备注名' });
  });

  it('预览保留消息已有的历史转发来源快照', () => {
    /** historicalOrigin 不能被当前消息发送者的备注覆盖。 */
    const historicalOrigin = { type: 'user' as const, userID: 'original-1', name: '原发送者' };
    /** message 模拟再次转发一条已转发消息。 */
    const message = { ...createMessage('m1', 'peer-1', '2323'), forwardOrigin: historicalOrigin };
    expect(resolveChatForwardPreviewOrigin(
      message,
      new Map([['peer-1', '当前发送者备注']]),
    )).toBe(historicalOrigin);
  });
});
