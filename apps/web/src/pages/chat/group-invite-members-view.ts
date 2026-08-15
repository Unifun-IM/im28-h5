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

/** 群邀请提交可用性参数只覆盖页面选择与审核输入约束。 */
export interface GroupInvitationSubmissionState {
  readonly selectedCount: number;
  readonly requiresApproval: boolean;
  readonly reason: string;
  readonly blocked: boolean;
}

/** 审核群必须选择好友并填写非空理由，直邀群不展示也不校验理由。 */
export function canSubmitGroupInvitation(
  state: GroupInvitationSubmissionState,
): boolean {
  if (state.blocked || state.selectedCount < 1) return false;
  return !state.requiresApproval || state.reason.trim().length > 0;
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
