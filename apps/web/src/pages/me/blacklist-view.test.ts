import type { WebIMBlacklistUser } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import { filterBlacklistUsers } from './blacklist-view.js';

/** 创建字段明确的黑名单筛选 fixture。 */
function createUser(
  userID: string,
  displayName: string,
  account: string,
): WebIMBlacklistUser {
  return { userID, displayName, account, avatarURL: '', isFriend: false, createdAt: '' };
}

// 黑名单本地搜索与 RN 字段回归。
describe('blacklist view', () => {
  // users 保留服务端顺序并覆盖三种可搜索字段。
  const users = [
    createUser('user-01', '张三', 'zhangsan'),
    createUser('user-02', 'Alice', 'alice-account'),
  ];

  it('空查询保留原列表引用与顺序', () => {
    expect(filterBlacklistUsers(users, '  ')).toBe(users);
  });

  it.each(['张三', 'ALICE-ACCOUNT', 'USER-02'])('可按 RN 黑名单字段搜索 %s', keyword => {
    expect(filterBlacklistUsers(users, keyword)).toHaveLength(1);
  });
});
