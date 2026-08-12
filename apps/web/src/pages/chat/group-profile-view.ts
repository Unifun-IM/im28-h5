import type { Conversation, WebIMJoinedGroup } from '@im28/im-sdk/web';

/** 群资料页只接受同路由会话匹配的 shared 群快照。 */
export interface GroupProfileView {
  readonly conversationID: string;
  readonly groupID: string;
  readonly name: string;
  readonly avatarURL: string;
  readonly canEdit: boolean;
}

/** 将真实群会话和 shared 群缓存投影为群资料页模型。 */
export function buildGroupProfileView(
  conversation: Conversation,
  group: WebIMJoinedGroup,
): GroupProfileView {
  // groupID 必须与群会话目标严格一致，防止跨群资料误投影。
  const groupID = conversation.type === 'group' ? conversation.targetID.trim() : '';
  if (!groupID || group.groupID !== groupID) {
    throw new Error('群资料与当前会话不匹配');
  }
  // canEdit 只消费 shared 群资料 capability。
  const canEdit = group.permissions.canEditGroupInfo;
  return {
    conversationID: conversation.conversationID,
    groupID,
    name: group.name.trim() || conversation.name?.trim() || groupID,
    avatarURL: group.avatarURL.trim() || conversation.faceURL?.trim() || '',
    canEdit,
  };
}

/** 通过浏览器平台端口复制群 ID，失败必须向页面抛出。 */
export async function copyGroupProfileID(groupID: string): Promise<void> {
  // clipboard 只接受安全上下文提供的真实浏览器实现。
  const clipboard = navigator.clipboard;
  if (!clipboard) throw new Error('当前浏览器不支持复制');
  await clipboard.writeText(groupID);
}
