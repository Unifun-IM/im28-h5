import type { Conversation, IMContactCommonGroup } from '@im28/im-sdk/web';

/** 从当前账号会话集合解析共同群聊真实会话主键。 */
export function findCommonGroupConversationID(
  group: Pick<IMContactCommonGroup, 'groupID' | 'conversationID'>,
  conversations: readonly Conversation[],
): string {
  /** projectedID 只有在当前账号会话集合真实存在时才可信。 */
  const projectedID = group.conversationID.trim();
  if (projectedID && conversations.some(
    conversation => conversation.conversationID === projectedID,
  )) return projectedID;
  /** matched 禁止把 group ID 直接当成 conversation ID。 */
  const matched = conversations.find(
    conversation => conversation.type === 'group' && conversation.targetID === group.groupID,
  );
  return matched?.conversationID ?? '';
}
