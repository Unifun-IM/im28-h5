import { describe, expect, it } from 'vitest';

import {
  buildContactFriendApplicationRoute,
  buildContactProfileRoute,
  formatContactProfileAddedAt,
  getContactProfileGenderLabel,
  getContactProfilePrimaryAction,
} from './contact-profile-view.js';

// 联系人资料 view helper 锁定关系 action、显示字段和 SPA 路由语义。
describe('contact profile view', () => {
  it('按好友、陌生人和本人关系选择唯一主操作', () => {
    expect(getContactProfilePrimaryAction('friend')).toBe('message');
    expect(getContactProfilePrimaryAction('stranger')).toBe('add-friend');
    expect(getContactProfilePrimaryAction('self')).toBeNull();
  });

  it('只为明确性别值显示标签', () => {
    expect(getContactProfileGenderLabel(1)).toBe('男');
    expect(getContactProfileGenderLabel(2)).toBe('女');
    expect(getContactProfileGenderLabel(0)).toBe('');
  });

  it('格式化可解析时间并保留异常原文', () => {
    expect(formatContactProfileAddedAt('2026-08-01T00:00:00Z')).toMatch(/^2026-08-0[1-2]$/);
    expect(formatContactProfileAddedAt('未知时间')).toBe('未知时间');
    expect(formatContactProfileAddedAt(' ')).toBe('');
  });

  it('编码联系人 ID 并生成资料和申请子路由', () => {
    expect(buildContactProfileRoute(' user/a ')).toBe('/contacts/users/user%2Fa');
    expect(buildContactFriendApplicationRoute('user/a'))
      .toBe('/contacts/users/user%2Fa/add');
  });
});
