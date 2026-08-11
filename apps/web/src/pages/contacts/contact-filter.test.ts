import type { WebIMContact } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import { filterWebIMContacts } from './contact-filter.js';

/** 构造覆盖联系人本地搜索字段的稳定记录。 */
function createSearchContact(): WebIMContact {
  return {
    userID: 'user-28',
    displayName: '张三备注',
    nickname: '张三',
    remark: '项目联系人',
    account: 'zhangsan',
    phone: '13800138000',
    email: 'zhang@example.com',
    avatarURL: '',
    isStarred: false,
    addedAt: '',
  };
}

// 联系人过滤回归保护模块拆分前的全字段、大小写和空查询语义。
describe('contact filter', () => {
  it('按显示名、备注、账号、ID、手机号和邮箱匹配', () => {
    /** contacts 是过滤函数不应修改的 SDK 输入顺序。 */
    const contacts = [createSearchContact()];
    /** keyword 逐项覆盖 RN 联系人搜索允许匹配的字段。 */
    for (const keyword of ['张三备注', '项目联系人', 'ZHANGSAN', 'user-28', '1380', '@example.com']) {
      expect(filterWebIMContacts(contacts, keyword)).toEqual(contacts);
    }
  });

  it('空查询返回原列表，未命中查询返回空列表', () => {
    /** contacts 用于证明空查询保留原引用。 */
    const contacts = [createSearchContact()];
    expect(filterWebIMContacts(contacts, '   ')).toBe(contacts);
    expect(filterWebIMContacts(contacts, 'missing')).toEqual([]);
  });
});
