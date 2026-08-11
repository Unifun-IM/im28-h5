import type {
  Conversation,
  WebIMGroupMember,
  WebIMJoinedGroup,
} from '@im28/im-sdk/web';

/** 聊天设置页可验证的会话与群资料投影。 */
export interface ChatSettingsView {
  readonly conversationID: string;
  readonly targetID: string;
  readonly title: string;
  readonly avatarURL: string;
  readonly isGroup: boolean;
  readonly pageTitle: string;
  readonly searchLabel: string;
  readonly memberCount: number;
  readonly canManageAutoDelete: boolean;
}

/** 群设置首卡可展示的稳定成员身份。 */
export interface ChatSettingsMemberView {
  readonly userID: string;
  readonly name: string;
  readonly avatarURL: string;
}

/** 将会话与可选群缓存收敛为 RN 设置页所需字段。 */
export function buildChatSettingsView(
  conversation: Conversation,
  group: WebIMJoinedGroup | null,
): ChatSettingsView {
  // isGroup 只信任共享 Conversation 类型，不从 ID 形态猜测。
  const isGroup = conversation.type === 'group';
  // targetID 是资料、成员和 fallback 展示的稳定目标身份。
  const targetID = conversation.targetID.trim();
  // groupName 只在群 facade 返回同一目标时覆盖会话快照。
  const groupName = isGroup && group?.groupID === targetID ? group.name.trim() : '';
  // title 保持群缓存、会话缓存、目标 ID 的可证明回退顺序。
  const title = groupName || conversation.name?.trim() || targetID || '会话';
  // avatarURL 优先使用群 facade 的最新缓存，其次保留会话快照。
  const avatarURL = (isGroup && group?.groupID === targetID
    ? group.avatarURL.trim()
    : '') || conversation.faceURL?.trim() || '';
  // memberCount 只展示 shared group facade 已规范化的非负数量。
  const memberCount = isGroup && group?.groupID === targetID
    ? Math.max(0, group.memberCount)
    : 0;
  return {
    conversationID: conversation.conversationID,
    targetID,
    title,
    avatarURL,
    isGroup,
    pageTitle: isGroup ? '群设置' : '聊天设置',
    searchLabel: isGroup ? '查找聊天内容' : '查看聊天记录',
    memberCount,
    canManageAutoDelete:
      !isGroup ||
      (group?.groupID === targetID &&
        (group.currentUserRole === 'owner' ||
          group.currentUserRole === 'admin')),
  };
}

/** 去重并限制群设置首屏成员，避免页面复制成员事实或排序规则。 */
export function buildChatSettingsMemberViews(
  members: readonly WebIMGroupMember[],
  limit = 10,
): readonly ChatSettingsMemberView[] {
  // seenIDs 阻止异常重复页让同一成员占用多个网格位置。
  const seenIDs = new Set<string>();
  // views 保持 shared facade 返回顺序，只做展示字段清洗。
  const views: ChatSettingsMemberView[] = [];
  for (const member of members) {
    // userID 为空时不能构造资料 route 或稳定 key。
    const userID = member.userID.trim();
    if (!userID || seenIDs.has(userID)) continue;
    seenIDs.add(userID);
    views.push({
      userID,
      name: member.nickname.trim() || userID,
      avatarURL: member.avatarURL.trim(),
    });
    if (views.length >= Math.max(0, limit)) break;
  }
  return views;
}
