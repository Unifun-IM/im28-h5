import {
  filterIMRemovableGroupMembers,
  resolveIMGroupMemberDisplayName,
  type WebIMGroupMember,
} from '@im28/im-sdk/web';

/** 群成员移除页的稳定候选投影。 */
export interface GroupRemoveMemberCandidate {
  readonly member: WebIMGroupMember;
  readonly displayName: string;
}

/** 复用 SDK 角色规则并按名称、身份过滤可移除候选。 */
export function buildGroupRemoveMemberCandidates(
  members: readonly WebIMGroupMember[],
  currentUserID: string,
  keyword: string,
): readonly GroupRemoveMemberCandidate[] {
  /** candidates 只消费 SDK 返回的跨端唯一候选集合。 */
  const candidates = filterIMRemovableGroupMembers(members, currentUserID);
  /** query 只属于页面搜索态。 */
  const query = keyword.trim().toLocaleLowerCase();
  return candidates.flatMap(member => {
    /** displayName 复用备注、群昵称、公开昵称的唯一优先级。 */
    const displayName = resolveIMGroupMemberDisplayName(member, member.userID);
    /** searchable 兼容 RN 的名称和用户 ID 搜索。 */
    const searchable = `${displayName}\n${member.userID}`.toLocaleLowerCase();
    return query && !searchable.includes(query) ? [] : [{ member, displayName }];
  });
}

/** 丢弃已不在候选快照中的过期选择。 */
export function reconcileGroupRemoveMemberSelection(
  selectedUserIDs: ReadonlySet<string>,
  candidates: readonly GroupRemoveMemberCandidate[],
): ReadonlySet<string> {
  /** candidateIDs 限定当前群和当前权限下仍有效的身份。 */
  const candidateIDs = new Set(candidates.map(candidate => candidate.member.userID));
  return new Set([...selectedUserIDs].filter(userID => candidateIDs.has(userID)));
}
