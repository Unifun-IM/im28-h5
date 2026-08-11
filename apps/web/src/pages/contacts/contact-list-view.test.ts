import type { WebIMContact } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import { buildContactListEntries, getContactIndexes } from './contact-list-view.js';

/** 构造只包含联系人分组所需字段的稳定测试记录。 */
function createContact(
  userID: string,
  displayName: string,
  isStarred = false,
): WebIMContact {
  return {
    userID,
    displayName,
    nickname: displayName,
    remark: '',
    account: '',
    phone: '',
    email: '',
    avatarURL: '',
    isStarred,
    addedAt: '',
  };
}

// 联系人列表回归证明拼音索引不会改变 SDK 提供的添加时间顺序。
describe('contact list view', () => {
  it('按中文拼音首字母分组并保留分组首次出现顺序', () => {
    /** entries 保留输入顺序，同时把中文联系人投影到真实字母 section。 */
    const entries = buildContactListEntries([
      createContact('zhang', '张三'),
      createContact('li', '李四'),
      createContact('zhou', '周五'),
    ], '');

    expect(getContactIndexes(entries)).toEqual(['Z', 'L']);
    expect(entries.map(entry => entry.type === 'section' ? entry.title : entry.contact.userID))
      .toEqual(['Z', 'zhang', 'zhou', 'L', 'li']);
  });

  it('搜索时仍使用拼音分组且不重复星标联系人', () => {
    /** entries 验证搜索态禁用独立星标 section 的既有规则。 */
    const entries = buildContactListEntries([
      createContact('zhang', '张三', true),
    ], '张');

    expect(getContactIndexes(entries)).toEqual(['Z']);
    expect(entries).toHaveLength(2);
  });
});
