import {
  filterIMInvitableGroupContacts,
  formatIMUserDisplayName,
  type WebIMContact,
} from '@im28/im-sdk/web';

/** 群邀请页的稳定好友候选投影。 */
export interface GroupInviteMemberCandidate {
  readonly contact: WebIMContact;
  readonly displayName: string;
}

/** 复用 SDK 好友权限规则并按名称、身份过滤邀请候选。 */
export function buildGroupInviteMemberCandidates(
  contacts: readonly WebIMContact[],
  memberUserIDs: readonly string[],
  keyword: string,
): readonly GroupInviteMemberCandidate[] {
  /** candidates 只消费 SDK 已验证的未入群且允许邀请好友集合。 */
  const candidates = filterIMInvitableGroupContacts(contacts, memberUserIDs);
  /** query 只属于页面本地搜索态。 */
  const query = keyword.trim().toLocaleLowerCase();
  return candidates.flatMap(contact => {
    /** displayName 已由 shared contact DTO 执行备注名优先。 */
    const displayName = contact.displayName.trim() ||
      formatIMUserDisplayName(contact.userID);
    /** searchable 对齐 RN 的好友名称和用户 ID 搜索。 */
    const searchable = `${displayName}\n${contact.userID}`.toLocaleLowerCase();
    return query && !searchable.includes(query) ? [] : [{ contact, displayName }];
  });
}

/** 丢弃已不在好友权限或成员快照候选中的过期选择。 */
export function reconcileGroupInviteMemberSelection(
  selectedUserIDs: ReadonlySet<string>,
  candidates: readonly GroupInviteMemberCandidate[],
): ReadonlySet<string> {
  /** candidateIDs 限定当前好友和当前群快照下仍有效的身份。 */
  const candidateIDs = new Set(candidates.map(candidate => candidate.contact.userID));
  return new Set([...selectedUserIDs].filter(userID => candidateIDs.has(userID)));
}
