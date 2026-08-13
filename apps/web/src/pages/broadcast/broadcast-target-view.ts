import type {
  IMBroadcastTarget,
  WebIMContact,
  WebIMJoinedGroup,
} from '@im28/im-sdk/web';

/** 群发选择页的浏览器展示目标。 */
export interface BroadcastDisplayTarget extends IMBroadcastTarget {
  readonly key: string;
  readonly title: string;
  readonly description: string;
  readonly avatarURL: string;
}

/** 将好友 facade 记录投影为群发目标。 */
export function contactToBroadcastTarget(contact: WebIMContact): BroadcastDisplayTarget {
  return {
    key: `friend:${contact.userID}`,
    kind: 'friend',
    targetID: contact.userID,
    title: contact.displayName || contact.userID,
    description: contact.userID,
    avatarURL: contact.avatarURL,
  };
}

/** 将已加入群 facade 记录投影为群发目标。 */
export function groupToBroadcastTarget(group: WebIMJoinedGroup): BroadcastDisplayTarget {
  return {
    key: `group:${group.groupID}`,
    kind: 'group',
    targetID: group.groupID,
    title: group.name || group.groupID,
    description: group.memberCount > 0 ? `${group.memberCount}人` : group.groupID,
    avatarURL: group.avatarURL,
  };
}

/** 按名称、描述和稳定 ID 本地过滤当前 tab。 */
export function filterBroadcastTargets(
  targets: readonly BroadcastDisplayTarget[],
  keyword: string,
): readonly BroadcastDisplayTarget[] {
  /** query 只影响页面投影，不改变 SDK 快照。 */
  const query = keyword.trim().toLocaleLowerCase();
  if (!query) return targets;
  return targets.filter(target =>
    `${target.title}\n${target.description}\n${target.targetID}`
      .toLocaleLowerCase()
      .includes(query),
  );
}

/** 按稳定路由身份恢复 compose 页的展示目标。 */
export function resolveBroadcastDisplayTargets(
  identities: readonly IMBroadcastTarget[],
  contacts: readonly WebIMContact[],
  groups: readonly WebIMJoinedGroup[],
): readonly BroadcastDisplayTarget[] {
  /** contactsByID 让恢复顺序由路由 identities 决定。 */
  const contactsByID = new Map(contacts.map(contact => [contact.userID, contact]));
  /** groupsByID 提供同样的群身份解析。 */
  const groupsByID = new Map(groups.map(group => [group.groupID, group]));
  return identities.flatMap(identity => {
    if (identity.kind === 'friend') {
      /** contact 缺失时保留稳定 ID，不制造昵称和头像。 */
      const contact = contactsByID.get(identity.targetID);
      return [contact ? contactToBroadcastTarget(contact) : createFallbackTarget(identity)];
    }
    /** group 缺失时同样保留稳定目标身份。 */
    const group = groupsByID.get(identity.targetID);
    return [group ? groupToBroadcastTarget(group) : createFallbackTarget(identity)];
  });
}

/** 为冷缓存目标创建明确 ID fallback。 */
function createFallbackTarget(identity: IMBroadcastTarget): BroadcastDisplayTarget {
  return {
    key: `${identity.kind}:${identity.targetID}`,
    ...identity,
    title: identity.targetID,
    description: identity.kind === 'friend' ? '好友' : '群聊',
    avatarURL: '',
  };
}
