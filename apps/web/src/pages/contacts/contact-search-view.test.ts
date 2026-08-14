import { describe, expect, it } from 'vitest';

import {
  createContactSearchProfileState,
  buildContactSearchLocalResults,
  getContactSearchDescription,
  readContactSearchProfileReturnState,
  readContactSearchRouteState,
  shouldDismissContactSearchKeyboard,
  splitContactSearchText,
  toContactSearchDescriptionSource,
} from './contact-search-view.js';
import type { Conversation, WebIMContact, WebIMJoinedGroup } from '@im28/im-sdk/web';
import { createGroupPermissionsFixture } from '../../test-fixtures/group-permissions.js';

/** 构造本地搜索测试使用的标准好友。 */
function createContact(overrides: Partial<WebIMContact> = {}): WebIMContact {
  return { userID: 'friend-1', displayName: '产品好友', nickname: '产品好友', remark: '', account: '', phone: '', email: '', avatarURL: '', isStarred: false, addedAt: '', ...overrides };
}

/** 构造本地搜索测试使用的标准已加入群。 */
function createJoinedGroup(overrides: Partial<WebIMJoinedGroup> = {}): WebIMJoinedGroup {
  return { groupID: 'GROUP-28', conversationID: 'sg-group-28', name: '产品讨论群', avatarURL: '', introduction: '', announcement: '', announcementVersion: '', memberCount: 3, ownerUserID: 'owner', currentUserRole: 'member', permissions: createGroupPermissionsFixture('member'), canEditAnnouncement: false, canMentionAll: false, isCreatedByCurrentUser: false, status: 'active', ...overrides };
}

/** 构造本地搜索 fallback 使用的标准群会话。 */
function createConversation(overrides: Partial<Conversation> = {}): Conversation {
  return { conversationID: 'sg-conversation-28', type: 'group', targetID: 'CONVERSATION-28', name: '会话缓存群', faceURL: '', unreadCount: 0, updatedAt: 1, ...overrides };
}

// 联系人搜索 view helper 锁定字段摘要与纯文本高亮语义。
describe('contact search view', () => {
  it('按好友在前群聊在后合并本地结果', () => {
    /** results 同时覆盖好友昵称和群名称命中。 */
    const results = buildContactSearchLocalResults(
      [createContact()],
      [createJoinedGroup()],
      [],
      '产品',
    );
    expect(results.map(item => item.type)).toEqual(['friend', 'group']);
    expect(results.map(item => item.key)).toEqual(['friend-friend-1', 'group-GROUP-28']);
  });

  it('群 ID 大小写不敏感且空关键词不生成本地结果', () => {
    /** group 只通过 ID 命中，验证复用 joined-group 搜索规则。 */
    const group = createJoinedGroup({ name: '讨论群' });
    expect(buildContactSearchLocalResults([], [group], [], 'group-28')).toEqual([
      { type: 'group', key: 'group-GROUP-28', group },
    ]);
    expect(buildContactSearchLocalResults([createContact()], [group], [], ' ')).toEqual([]);
  });

  it('用群会话补齐群快照缺口并排除非群或空目标', () => {
    /** results 只接受可稳定定位的群会话。 */
    const results = buildContactSearchLocalResults([], [], [
      createConversation(),
      createConversation({ conversationID: 'single-1', type: 'single', targetID: 'friend-1', name: '会话缓存群' }),
      createConversation({ conversationID: 'group-empty', targetID: ' ', name: '会话缓存群' }),
    ], '缓存');
    expect(results).toEqual([{
      type: 'group',
      key: 'group-CONVERSATION-28',
      group: {
        source: 'conversation',
        groupID: 'CONVERSATION-28',
        conversationID: 'sg-conversation-28',
        name: '会话缓存群',
        avatarURL: '',
        introduction: '',
      },
    }]);
  });

  it('同群同时存在完整群资料和会话时始终保留群资料', () => {
    /** group 与 conversation 使用同一 ID 但不同展示事实。 */
    const group = createJoinedGroup({ name: '完整群资料' });
    const conversation = createConversation({ targetID: group.groupID, name: '过期会话名' });
    expect(buildContactSearchLocalResults([], [group], [conversation], '过期')).toEqual([]);
    expect(buildContactSearchLocalResults([], [group], [conversation], '完整')).toEqual([
      { type: 'group', key: 'group-GROUP-28', group },
    ]);
  });

  it('保持原文并对大小写不敏感地拆分全部关键词匹配', () => {
    expect(splitContactSearchText('Test tester', 'test')).toEqual([
      { text: 'Test', highlighted: true },
      { text: ' ', highlighted: false },
      { text: 'test', highlighted: true },
      { text: 'er', highlighted: false },
    ]);
  });

  it('将正则特殊字符当作普通搜索文本', () => {
    expect(splitContactSearchText('账号(a+b)', '(a+b)')).toEqual([
      { text: '账号', highlighted: false },
      { text: '(a+b)', highlighted: true },
    ]);
  });

  it('优先展示实际命中的公开字段并回退用户ID', () => {
    // source 覆盖所有远端公开搜索字段。
    const source = {
      userID: 'user-28',
      nickname: '测试用户',
      account: 'tester',
      phone: '13800138000',
      email: 'test@example.com',
    };
    expect(getContactSearchDescription(source, '1380')).toBe('手机号：13800138000');
    expect(getContactSearchDescription(source, 'missing')).toBe('ID：user-28');
  });

  it('从好友记录只投影搜索摘要字段', () => {
    expect(toContactSearchDescriptionSource({
      userID: 'friend-1',
      displayName: '备注',
      nickname: '昵称',
      remark: '备注',
      account: 'account-1',
      phone: '13800138000',
      email: 'friend@example.com',
      avatarURL: '',
      isStarred: false,
      addedAt: '',
    })).toEqual({
      userID: 'friend-1',
      nickname: '昵称',
      account: 'account-1',
      phone: '13800138000',
      email: 'friend@example.com',
    });
  });

  it('只恢复受控的服务器搜索页签和有界关键词', () => {
    expect(readContactSearchRouteState({
      searchKeyword: ' 群聊 ',
      serverTab: 'groups',
      searchBackHref: '/conversations/archived',
    })).toEqual({
      searchKeyword: '群聊',
      serverTab: 'groups',
      searchBackHref: '/conversations/archived',
    });
    expect(readContactSearchRouteState({
      searchKeyword: 'a'.repeat(101),
      serverTab: 'outside',
      searchBackHref: 'https://example.test',
    })).toEqual({
      searchKeyword: 'a'.repeat(100),
      serverTab: null,
      searchBackHref: '/contacts',
    });
  });

  it('只构造联系人搜索资料返回需要的有界 Router state', () => {
    expect(createContactSearchProfileState(
      ' 群聊 ',
      'groups',
      '/conversations',
    )).toEqual({
      backHref: '/contacts/search',
      searchKeyword: '群聊',
      serverTab: 'groups',
      searchBackHref: '/conversations',
    });
    expect(createContactSearchProfileState('a'.repeat(101), null)).toEqual({
      backHref: '/contacts/search',
      searchKeyword: 'a'.repeat(100),
      serverTab: null,
      searchBackHref: '/contacts',
    });
    expect(readContactSearchProfileReturnState({
      backHref: '/contacts/search',
      searchKeyword: ' 用户 ',
      serverTab: 'friends',
      searchBackHref: '/conversations/archived',
      token: 'discarded',
    })).toEqual({
      searchKeyword: '用户',
      serverTab: 'friends',
      searchBackHref: '/conversations/archived',
    });
    expect(readContactSearchProfileReturnState({
      backHref: 'https://example.test',
      searchKeyword: '用户',
      serverTab: 'friends',
    })).toBeUndefined();
  });

  it('只在非组合且非重复的 Enter 上收起搜索键盘', () => {
    expect(shouldDismissContactSearchKeyboard({ key: 'Enter', isComposing: false, repeat: false })).toBe(true);
    expect(shouldDismissContactSearchKeyboard({ key: 'Enter', isComposing: true, repeat: false })).toBe(false);
    expect(shouldDismissContactSearchKeyboard({ key: 'Enter', isComposing: false, repeat: true })).toBe(false);
    expect(shouldDismissContactSearchKeyboard({ key: 'NumpadEnter', isComposing: false, repeat: false })).toBe(false);
  });
});
