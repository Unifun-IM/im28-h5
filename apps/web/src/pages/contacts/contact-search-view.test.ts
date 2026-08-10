import { describe, expect, it } from 'vitest';

import {
  getContactSearchDescription,
  splitContactSearchText,
  toContactSearchDescriptionSource,
} from './contact-search-view.js';

// 联系人搜索 view helper 锁定字段摘要与纯文本高亮语义。
describe('contact search view', () => {
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
});
