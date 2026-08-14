import type {
  WebIMConversationListItem,
  WebIMJoinedGroupSync,
} from '@im28/im-sdk/web';

/** 会话删除权限只依赖 shared 群缓存与远端同步能力。 */
export type ConversationDeleteGroupPermissionSource = Pick<
  WebIMJoinedGroupSync,
  'listCached' | 'sync'
>;

/** 读取删除全部会话记录权限，并在群缓存缺失时刷新 shared 群快照。 */
export async function resolveConversationDeleteForAllPermission(
  target: WebIMConversationListItem,
  groups: ConversationDeleteGroupPermissionSource,
): Promise<boolean> {
  if (target.conversation.type !== 'group') return true;
  // targetGroupID 只使用标准化会话目标，不从会话 ID 形态推断群身份。
  const targetGroupID = target.conversation.targetID;
  // cachedGroups 优先保持会话长按操作的 cache-first 行为。
  const cachedGroups = await groups.listCached();
  // cachedGroup 命中时直接消费 shared 权限投影。
  const cachedGroup = cachedGroups.find(group => group.groupID === targetGroupID);
  if (cachedGroup) return cachedGroup.permissions.canClearMessages === true;
  // syncedGroups 仅在缓存缺失时拉取权威群列表，避免把冷缓存误判为无权限。
  const syncedGroups = await groups.sync();
  // syncedGroup 缺失或权限未明确时保持 fail-closed。
  const syncedGroup = syncedGroups.find(group => group.groupID === targetGroupID);
  return syncedGroup?.permissions.canClearMessages === true;
}
