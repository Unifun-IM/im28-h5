import {
  canCreateIMGroupWithMemberCount,
  type WebIMContact,
} from '@im28/im-sdk/web';

/** 创建群候选复用共享好友展示名和稳定身份。 */
export interface CreateGroupCandidate {
  readonly contact: WebIMContact;
  readonly displayName: string;
}

/** 按昵称、备注归一结果和用户 ID 本地过滤创建群好友。 */
export function buildCreateGroupCandidates(
  contacts: readonly WebIMContact[],
  keyword: string,
): readonly CreateGroupCandidate[] {
  /** query 只属于页面搜索，不改变 SDK 好友快照。 */
  const query = keyword.trim().toLocaleLowerCase();
  return contacts.flatMap(contact => {
    /** displayName 已由 shared contact DTO 处理备注名优先。 */
    const displayName = contact.displayName.trim() || contact.userID;
    /** searchable 同时覆盖展示名和稳定用户 ID。 */
    const searchable = `${displayName}\n${contact.userID}`.toLocaleLowerCase();
    return query && !searchable.includes(query) ? [] : [{ contact, displayName }];
  });
}

/** 创建按钮严格复用 SDK 的 RN 人数规则。 */
export function canSubmitCreateGroup(selectedUserIDs: ReadonlySet<string>): boolean {
  return canCreateIMGroupWithMemberCount(selectedUserIDs.size);
}

/** 判断 Gateway 已处理但缺失返回身份的不可重放创建错误。 */
export function isGroupCreationRemoteCompletedError(cause: unknown): boolean {
  if (!cause || typeof cause !== 'object') return false;
  /** code 只读取 SDK IMError 的稳定公开错误码。 */
  const code = (cause as { readonly code?: unknown }).code;
  return code === 'GROUP_CREATE_REMOTE_IDENTITY_INCOMPLETE';
}
