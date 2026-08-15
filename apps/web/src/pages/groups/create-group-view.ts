import {
  canCreateIMGroupWithMemberCount,
  formatIMUserDisplayName,
  IM_GROUP_CREATION_MAX_MEMBER_COUNT,
  type Conversation,
  type WebIMContact,
} from '@im28/im-sdk/web';

/** 创建群候选复用共享好友展示名和稳定身份。 */
export interface CreateGroupCandidate {
  readonly contact: WebIMContact;
  readonly displayName: string;
}

/** 建群成员切换结果同时返回稳定集合和是否触发人数上限。 */
export interface CreateGroupSelectionResult {
  readonly selectedUserIDs: ReadonlySet<string>;
  readonly limitReached: boolean;
}

/** 按昵称、备注归一结果和用户 ID 本地过滤创建群好友。 */
export function buildCreateGroupCandidates(
  contacts: readonly WebIMContact[],
  keyword: string,
  excludedUserIDs: ReadonlySet<string> = new Set(),
): readonly CreateGroupCandidate[] {
  /** query 只属于页面搜索，不改变 SDK 好友快照。 */
  const query = keyword.trim().toLocaleLowerCase();
  return contacts.flatMap(contact => {
    if (excludedUserIDs.has(contact.userID)) return [];
    /** displayName 已由 shared contact DTO 处理备注名优先。 */
    const displayName = contact.displayName.trim() ||
      formatIMUserDisplayName(contact.userID);
    /** searchable 同时覆盖展示名和稳定用户 ID。 */
    const searchable = `${displayName}\n${contact.userID}`.toLocaleLowerCase();
    return query && !searchable.includes(query) ? [] : [{ contact, displayName }];
  });
}

/** 按好友原始顺序投影仍然有效的已选建群候选。 */
export function buildSelectedCreateGroupCandidates(
  candidates: readonly CreateGroupCandidate[],
  selectedUserIDs: ReadonlySet<string>,
): readonly CreateGroupCandidate[] {
  return candidates.filter(candidate => selectedUserIDs.has(candidate.contact.userID));
}

/** 切换单个建群成员，并在达到共享人数上限时保留原集合。 */
export function toggleCreateGroupMemberSelection(
  current: ReadonlySet<string>,
  userID: string,
  fixedCount: number,
): CreateGroupSelectionResult {
  if (!current.has(userID) && current.size + fixedCount >= IM_GROUP_CREATION_MAX_MEMBER_COUNT) {
    return { selectedUserIDs: current, limitReached: true };
  }
  /** next 创建新集合保证 React 可观察。 */
  const next = new Set(current);
  if (next.has(userID)) next.delete(userID);
  else next.add(userID);
  return { selectedUserIDs: next, limitReached: false };
}

/** 更新当前可见候选，普通入口全量替换，单聊筛选只修改可见项。 */
export function updateVisibleCreateGroupMemberSelection(
  current: ReadonlySet<string>,
  visibleUserIDs: readonly string[],
  allSelected: boolean,
  preserveHidden: boolean,
): ReadonlySet<string> {
  if (!preserveHidden) return allSelected ? new Set() : new Set(visibleUserIDs);
  /** next 保留单聊搜索中当前不可见的既有选择。 */
  const next = new Set(current);
  for (const userID of visibleUserIDs) {
    if (allSelected) next.delete(userID);
    else next.add(userID);
  }
  return next;
}

/** 合并固定成员与页面选择成员，并按首次出现顺序去重。 */
export function buildCreateGroupMemberUserIDs(
  selectedUserIDs: Iterable<string>,
  fixedUserIDs: readonly string[] = [],
): readonly string[] {
  /** memberUserIDs 只保留非空稳定身份，固定成员始终位于提交数组前方。 */
  const memberUserIDs = [...fixedUserIDs, ...selectedUserIDs]
    .map(userID => userID.trim())
    .filter(Boolean);
  return [...new Set(memberUserIDs)];
}

/** 创建按钮严格复用 SDK 的 RN 人数规则。 */
export function canSubmitCreateGroup(
  selectedUserIDs: ReadonlySet<string>,
  fixedUserIDs: readonly string[] = [],
): boolean {
  return canCreateIMGroupWithMemberCount(
    buildCreateGroupMemberUserIDs(selectedUserIDs, fixedUserIDs).length,
  );
}

/** 从当前账号真实单聊会话解析“添加成员创建群聊”的固定对端。 */
export function resolveSingleChatCreateGroupPeer(
  conversations: readonly Conversation[],
  conversationID: string,
  currentUserID: string,
): string {
  /** conversation 必须是当前缓存中与 route ID 严格匹配的单聊。 */
  const conversation = conversations.find(
    item => item.conversationID === conversationID && item.type === 'single',
  );
  /** peerUserID 只接受非本人稳定目标身份。 */
  const peerUserID = conversation?.targetID.trim() ?? '';
  return peerUserID && peerUserID !== currentUserID.trim() ? peerUserID : '';
}

/** 判断 Gateway 已处理但缺失返回身份的不可重放创建错误。 */
export function isGroupCreationRemoteCompletedError(cause: unknown): boolean {
  if (!cause || typeof cause !== 'object') return false;
  /** code 只读取 SDK IMError 的稳定公开错误码。 */
  const code = (cause as { readonly code?: unknown }).code;
  return code === 'GROUP_CREATE_REMOTE_IDENTITY_INCOMPLETE';
}
