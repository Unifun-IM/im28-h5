import type {
  Message,
  WebIMContact,
  WebIMConversationListItem,
  WebIMJoinedGroup,
} from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';
import { createGroupPermissionsFixture } from '../../test-fixtures/group-permissions.js';

import {
  buildConversationHomeSearchSections,
  isCurrentConversationSearchRequest,
  mergeConversationHomeSearchMessageSections,
  splitConversationSearchHighlightedText,
  updateConversationSearchHistory,
} from './conversation-home-search.js';

/** 构造搜索测试使用的稳定会话缓存项。 */
function createConversationItem(
  conversationID: string,
  type: 'single' | 'group',
  targetID: string,
  name: string,
): WebIMConversationListItem {
  return {
    conversation: {
      conversationID,
      type,
      targetID,
      name,
      unreadCount: 0,
      updatedAt: 1,
    },
    latestMessage: null,
    unreadMention: null,
  };
}

/** 构造缓存好友，锁定可见字段和资料回退。 */
function createContact(userID: string, displayName: string): WebIMContact {
  return {
    userID,
    displayName,
    nickname: displayName,
    remark: '',
    account: userID,
    phone: '',
    email: '',
    avatarURL: '',
    isStarred: false,
    addedAt: '',
  };
}

/** 构造缓存群资料，锁定群 ID 与会话关联。 */
function createGroup(groupID: string, name: string): WebIMJoinedGroup {
  return {
    groupID,
    conversationID: `group_${groupID}`,
    name,
    avatarURL: '',
    introduction: '',
    announcement: '',
    announcementVersion: '',
    memberCount: 2,
    ownerUserID: 'owner-1',
    currentUserRole: 'member',
    permissions: createGroupPermissionsFixture('member'),
    canEditAnnouncement: false,
    canMentionAll: false,
    isCreatedByCurrentUser: false,
    status: 'active',
  };
}

/** 构造已由 SDK 关键词查询命中的消息。 */
function createMessage(
  clientMsgID: string,
  conversationID: string,
  seq: number,
): Message {
  return {
    clientMsgID,
    conversationID,
    senderID: 'peer-1',
    direction: 'incoming',
    contentType: 101,
    status: 'received',
    sendTime: seq,
    seq,
    payload: { text: { text: 'donk' } },
  };
}

// 首页搜索 contract 锁定 RN 的分区、真实会话约束和消息定位语义。
describe('conversation home search', () => {
  /** 验证好友、群聊、聊天记录固定顺序及最远消息定位。 */
  it('builds RN sections from current account cache', () => {
    /** conversations 提供可打开的单聊和群聊稳定身份。 */
    const conversations = [
      createConversationItem('single_user-2', 'single', 'user-2', 'donk二大爷'),
      createConversationItem('group_group-1', 'group', 'group-1', 'donk的群聊'),
    ];
    /** sections 聚合四个共享缓存 owner。 */
    const sections = buildConversationHomeSearchSections({
      query: 'donk',
      contacts: [
        createContact('user-2', 'donk二大爷'),
        createContact('user-without-conversation', 'donk未建会话'),
      ],
      groups: [createGroup('group-1', 'donk的群聊')],
      conversations,
      messages: [
        createMessage('message-later', 'group_group-1', 9),
        createMessage('message-earlier', 'group_group-1', 3),
        createMessage('message-orphan', 'missing-conversation', 1),
      ],
    });

    expect(sections.map(section => section.title)).toEqual(['好友', '群聊', '聊天记录']);
    expect(sections[0]?.items).toHaveLength(1);
    expect(sections[1]?.items[0]).toMatchObject({ conversationID: 'group_group-1' });
    expect(sections[2]?.items[0]).toMatchObject({
      type: 'message',
      subtitle: '共2条相关聊天记录',
      messageID: 'message-earlier',
      matchCount: 2,
      messagePosition: 3,
    });
  });

  /** 验证聊天记录跨页按会话合并计数并保留更远消息。 */
  it('merges paged message matches without duplicating conversations', () => {
    /** conversations 提供两页消息所需的稳定会话。 */
    const conversations = [
      createConversationItem('single_user-2', 'single', 'user-2', 'donk二大爷'),
      createConversationItem('group_group-1', 'group', 'group-1', 'donk的群聊'),
    ];
    /** firstPage 模拟 SQLite 首页包含较新的群消息。 */
    const firstPage = buildConversationHomeSearchSections({
      query: 'donk', contacts: [], groups: [], conversations,
      messages: [createMessage('group-newer', 'group_group-1', 9)],
    });
    /** secondPage 模拟下一页命中同一群和另一单聊。 */
    const secondPage = buildConversationHomeSearchSections({
      query: 'donk', contacts: [], groups: [], conversations,
      messages: [
        createMessage('group-older', 'group_group-1', 3),
        createMessage('single-message', 'single_user-2', 2),
      ],
    });
    /** merged 必须保持分区唯一并累计群命中数。 */
    const merged = mergeConversationHomeSearchMessageSections(firstPage, secondPage);

    expect(merged).toHaveLength(1);
    expect(merged[0]?.items).toHaveLength(2);
    expect(merged[0]?.items[0]).toMatchObject({
      key: 'message-group_group-1',
      messageID: 'group-older',
      matchCount: 2,
      subtitle: '共2条相关聊天记录',
    });
    expect(merged[0]?.items[1]).toMatchObject({
      key: 'message-single_user-2',
      matchCount: 1,
    });
  });

  /** 验证搜索历史按最近优先去重并受十条上限约束。 */
  it('keeps deduplicated recent search history', () => {
    /** history 模拟已有十条浏览器 preference。 */
    const history = Array.from({ length: 10 }, (_, index) => `查询${index}`);
    expect(updateConversationSearchHistory(history, ' 查询3 ')).toEqual([
      '查询3',
      '查询0',
      '查询1',
      '查询2',
      '查询4',
      '查询5',
      '查询6',
      '查询7',
      '查询8',
      '查询9',
    ]);
  });

  /** 验证输入变化后旧异步请求不能再提交页面结果。 */
  it('accepts only the latest search request generation', () => {
    expect(isCurrentConversationSearchRequest(7, 7)).toBe(true);
    expect(isCurrentConversationSearchRequest(8, 7)).toBe(false);
  });

  /** 验证结果高亮与 RN 一样忽略大小写并保留全部命中。 */
  it('splits highlighted result text with RN matching semantics', () => {
    expect(splitConversationSearchHighlightedText('Hello hello 你好', 'HELLO')).toEqual([
      { text: 'Hello', highlighted: true },
      { text: ' ', highlighted: false },
      { text: 'hello', highlighted: true },
      { text: ' 你好', highlighted: false },
    ]);
    expect(splitConversationSearchHighlightedText('明天吃什么', '吃')).toEqual([
      { text: '明天', highlighted: false },
      { text: '吃', highlighted: true },
      { text: '什么', highlighted: false },
    ]);
    expect(splitConversationSearchHighlightedText('没有命中', '')).toEqual([
      { text: '没有命中', highlighted: false },
    ]);
  });
});
