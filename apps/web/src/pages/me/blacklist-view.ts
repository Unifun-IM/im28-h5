import type { WebIMBlacklistUser } from '@im28/im-sdk/web';

/** 按 RN 黑名单页语义搜索昵称、账号和稳定用户 ID。 */
export function filterBlacklistUsers(
  users: readonly WebIMBlacklistUser[],
  keyword: string,
): readonly WebIMBlacklistUser[] {
  // query 统一大小写并忽略输入两端空白。
  const query = keyword.trim().toLocaleLowerCase();
  if (!query) return users;
  return users.filter(user => [user.displayName, user.account, user.userID]
    .some(value => value.toLocaleLowerCase().includes(query)));
}
