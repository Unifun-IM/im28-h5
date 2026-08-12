import {
  resolveIMGroupMemberDisplayName,
  type WebIMGroupMember,
} from '@im28/im-sdk/web';

import {
  compareContactIndexedNames,
  getContactIndexKey,
} from '../contacts/contact-index-helpers.js';

/** 群成员页分组标题或成员行的稳定投影。 */
export type GroupMemberListEntry =
  | { readonly type: 'section'; readonly key: string; readonly title: string }
  | {
      readonly type: 'member';
      readonly key: string;
      readonly member: WebIMGroupMember;
      readonly displayName: string;
    };

/** 复用 SDK 唯一昵称优先级解析群成员可见名称。 */
export function getGroupMemberDisplayName(member: WebIMGroupMember): string {
  return resolveIMGroupMemberDisplayName(member, member.userID);
}

/** 按 RN 名称和用户 ID 过滤群成员，不改变共享成员事实。 */
export function filterGroupMembers(
  members: readonly WebIMGroupMember[],
  keyword: string,
): readonly WebIMGroupMember[] {
  /** query 统一首尾空白和大小写。 */
  const query = keyword.trim().toLocaleLowerCase();
  if (!query) return members;
  return members.filter(member => [
    getGroupMemberDisplayName(member),
    member.userID,
  ].join('\n').toLocaleLowerCase().includes(query));
}

/** 将完整成员快照按 RN 拼音顺序转换为分组列表。 */
export function buildGroupMemberListEntries(
  members: readonly WebIMGroupMember[],
  keyword: string,
): readonly GroupMemberListEntry[] {
  /** sorted 只排序页面副本，不改变 SDK facade 返回值。 */
  const sorted = [...filterGroupMembers(members, keyword)].sort((left, right) =>
    compareContactIndexedNames(
      getGroupMemberDisplayName(left),
      getGroupMemberDisplayName(right),
    ));
  /** groups 按 RN A-Z/# 分组并保持排序后的组内顺序。 */
  const groups = new Map<string, WebIMGroupMember[]>();
  // member 逐条进入自己的稳定字母分组。
  for (const member of sorted) {
    /** index 复用联系人同版本 pinyin-pro 索引规则。 */
    const index = getContactIndexKey(getGroupMemberDisplayName(member));
    groups.set(index, [...(groups.get(index) ?? []), member]);
  }
  /** entries 是页面唯一渲染数据源。 */
  const entries: GroupMemberListEntry[] = [];
  // groupedMembers 按 Map 中已排序的字母顺序展开。
  for (const [title, groupedMembers] of groups) {
    entries.push({ type: 'section', key: `section-${title}`, title });
    // member 保留当前分组中的拼音排序结果。
    for (const member of groupedMembers) {
      entries.push({
        type: 'member',
        key: `member-${member.userID}`,
        member,
        displayName: getGroupMemberDisplayName(member),
      });
    }
  }
  return entries;
}

/** 提取当前列表实际存在的 RN 右侧索引。 */
export function getGroupMemberIndexes(
  entries: readonly GroupMemberListEntry[],
): readonly string[] {
  return entries
    .filter((entry): entry is Extract<GroupMemberListEntry, { readonly type: 'section' }> =>
      entry.type === 'section')
    .map(entry => entry.title);
}

/** 将共享群角色映射为 RN 成员行标签。 */
export function getGroupMemberRoleLabel(role: WebIMGroupMember['role']): string {
  if (role === 'owner') return '群主';
  if (role === 'admin') return '管理员';
  return '';
}
