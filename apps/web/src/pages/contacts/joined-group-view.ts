import type { WebIMJoinedGroup } from '@im28/im-sdk/web';

/** 群列表右侧展示的 RN 身份标签。 */
export type JoinedGroupBadge = 'creator' | 'owner' | 'admin';

/** 按群名和群 ID 执行本地搜索。 */
export function filterJoinedGroups<
  Group extends Pick<WebIMJoinedGroup, 'groupID' | 'name'>,
>(
  groups: readonly Group[],
  keyword: string,
): readonly Group[] {
  // query 统一大小写和首尾空白，不改变 SDK 顺序。
  const query = keyword.trim().toLocaleLowerCase();
  if (!query) return groups;
  return groups.filter(group =>
    `${group.name}\n${group.groupID}`.toLocaleLowerCase().includes(query),
  );
}

/** 将 SDK 群状态映射为 RN 列表文案。 */
export function getJoinedGroupStatusLabel(
  status: WebIMJoinedGroup['status'],
): string {
  if (status === 'banned') return '已封禁';
  if (status === 'dismissed') return '已解散';
  if (status === 'muted') return '禁言中';
  return '';
}

/** 组合 RN 群人数、状态和群 ID 描述。 */
export function getJoinedGroupDescription(group: WebIMJoinedGroup): string {
  // parts 跳过不存在的状态和零成员数。
  const parts = [
    getJoinedGroupStatusLabel(group.status),
    group.memberCount > 0 ? `${group.memberCount}人` : '',
    `ID：${group.groupID}`,
  ].filter(Boolean);
  return parts.join(' · ');
}

/** 按 RN 规则生成“我创建/群主/管理员”标签。 */
export function getJoinedGroupBadges(
  group: Pick<WebIMJoinedGroup, 'isCreatedByCurrentUser' | 'currentUserRole'>,
): readonly JoinedGroupBadge[] {
  // badges 保持创建者标签优先。
  const badges: JoinedGroupBadge[] = [];
  if (group.isCreatedByCurrentUser) badges.push('creator');
  if (group.currentUserRole === 'owner') badges.push('owner');
  if (group.currentUserRole === 'admin') badges.push('admin');
  return badges;
}

/** 为角色标签返回稳定中文文案。 */
export function getJoinedGroupBadgeLabel(
  badge: JoinedGroupBadge,
): string {
  // labels 与 RN ContactGroupListScreen 完全一致。
  const labels: Record<JoinedGroupBadge, string> = {
    creator: '我创建',
    owner: '群主',
    admin: '管理员',
  };
  return labels[badge];
}
