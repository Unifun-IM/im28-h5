import {
  filterIMGroupOwnerTransferCandidates,
  type WebIMGroupMember,
} from '@im28/im-sdk/web';

import {
  buildGroupMemberListEntries,
  filterGroupMembers,
  getGroupMemberDisplayName,
  type GroupMemberListEntry,
} from './group-members-view.js';

/** 群主转让页分组标题或候选成员的稳定投影。 */
export type GroupOwnerTransferEntry = GroupMemberListEntry;

/** 先由 SDK 裁决可转让身份，再按 RN 搜索和角色分组投影。 */
export function buildGroupOwnerTransferEntries(
  members: readonly WebIMGroupMember[],
  currentUserID: string,
  keyword: string,
): readonly GroupOwnerTransferEntry[] {
  /** candidates 排除当前群主及 SDK 判定无效的角色。 */
  const candidates = filterIMGroupOwnerTransferCandidates(members, currentUserID);
  /** filtered 只追加名称和用户 ID 的页面搜索。 */
  const filtered = filterGroupMembers(candidates, keyword);
  /** managers 对齐 RN，管理员优先展示。 */
  const managers = filtered.filter(member => member.role === 'admin');
  /** regularMembers 继续复用 RN 拼音分组投影。 */
  const regularMembers = filtered.filter(member => member.role !== 'admin');
  /** managerEntries 使用稳定 section key，避免与字母分组冲突。 */
  const managerEntries: GroupOwnerTransferEntry[] = managers.length
    ? [
        { type: 'section', key: 'section-owner-admin', title: '群主及群管理员' },
        ...managers.map(member => ({
          type: 'member' as const,
          key: `member-${member.userID}`,
          member,
          displayName: getGroupMemberDisplayName(member),
        })),
      ]
    : [];
  return [...managerEntries, ...buildGroupMemberListEntries(regularMembers, '')];
}

/** 权威成员刷新后只保留仍在 shared 候选中的选中身份。 */
export function retainGroupOwnerTransferSelection(
  selectedUserID: string,
  members: readonly WebIMGroupMember[],
  currentUserID: string,
): string {
  if (!selectedUserID) return '';
  /** candidates 仅由 shared 候选规则产生。 */
  const candidates = filterIMGroupOwnerTransferCandidates(members, currentUserID);
  return candidates.some(member => member.userID === selectedUserID) ? selectedUserID : '';
}
