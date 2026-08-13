import {
  filterIMGroupAdminCandidates,
  IM_GROUP_ADMIN_LIMIT,
  type WebIMGroupMember,
} from '@im28/im-sdk/web';

/** 对外转发 shared 唯一管理员上限，页面不得复制业务常量。 */
export { IM_GROUP_ADMIN_LIMIT };

/** 读取当前快照中的管理员成员。 */
export function getGroupAdminMembers(
  members: readonly WebIMGroupMember[],
): readonly WebIMGroupMember[] {
  return members.filter(member => member.role === 'admin');
}

/** 按 RN 名称和用户 ID 过滤 shared 普通成员候选。 */
export function filterGroupAdminCandidates(
  members: readonly WebIMGroupMember[],
  keyword: string,
): readonly WebIMGroupMember[] {
  /** query 只属于页面展示筛选，不改变 shared 候选规则。 */
  const query = keyword.trim().toLocaleLowerCase();
  /** candidates 仍由 SDK 按角色和 active 状态唯一裁决。 */
  const candidates = filterIMGroupAdminCandidates(members);
  if (!query) return candidates;
  return candidates.filter(member => [
    member.remark,
    member.groupNickname,
    member.nickname,
    member.userID,
  ].filter(Boolean).join('\n').toLocaleLowerCase().includes(query));
}

/** 在管理员剩余名额内切换一个稳定成员 ID。 */
export function toggleGroupAdminSelection(
  selected: ReadonlySet<string>,
  userID: string,
  remainingSlots: number,
): ReadonlySet<string> {
  /** next 复制页面选择态，禁止修改调用者 Set。 */
  const next = new Set(selected);
  if (next.has(userID)) {
    next.delete(userID);
    return next;
  }
  if (next.size >= Math.max(0, remainingSlots)) return next;
  next.add(userID);
  return next;
}

/** 成员角色刷新后只保留仍属于 shared 普通成员候选的选择。 */
export function retainGroupAdminCandidateSelection(
  selected: ReadonlySet<string>,
  candidates: readonly WebIMGroupMember[],
): ReadonlySet<string> {
  /** candidateIDs 只来自 SDK 已裁决的普通成员候选。 */
  const candidateIDs = new Set(candidates.map(candidate => candidate.userID));
  /** retained 移除已退群或角色已变化的历史选择。 */
  const retained = new Set([...selected].filter(userID => candidateIDs.has(userID)));
  if (retained.size === selected.size && [...retained].every(userID => selected.has(userID))) return selected;
  return retained;
}
