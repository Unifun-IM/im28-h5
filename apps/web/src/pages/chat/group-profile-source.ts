import type { Conversation, WebIMJoinedGroup, WebIMSync } from '@im28/im-sdk/web';

/** 群资料相关页面共用的真实会话与 shared 群快照。 */
export interface GroupProfileSource {
  readonly conversation: Conversation;
  readonly group: WebIMJoinedGroup;
}

/** 群资料加载参数允许页面先消费当前账号缓存。 */
export interface LoadGroupProfileSourceOptions {
  readonly sync: WebIMSync;
  readonly conversationID: string;
  readonly onCached?: (source: GroupProfileSource) => void;
}

/** 统一执行会话和群资料的 cache-first 恢复与权威刷新。 */
export async function loadGroupProfileSource(
  options: LoadGroupProfileSourceOptions,
): Promise<GroupProfileSource> {
  /** conversationID 只接受当前 React Router path 提供的稳定身份。 */
  const conversationID = options.conversationID.trim();
  if (!conversationID) throw new Error('群聊身份不可用');
  /** cachedConversations 为深链优先读取当前账号 SQLite。 */
  let cachedConversations = await options.sync.conversations.listCached({ limit: 500 });
  /** conversation 必须是当前路由精确匹配的群会话。 */
  let conversation = cachedConversations.find(item => item.conversationID === conversationID);
  if (!conversation) {
    cachedConversations = await options.sync.conversations.sync({ pageSize: 100 });
    conversation = cachedConversations.find(item => item.conversationID === conversationID);
  }
  if (!conversation || conversation.type !== 'group') throw new Error('群聊不存在或尚未同步');
  /** groupID 只来自 shared Conversation targetID。 */
  const groupID = conversation.targetID.trim();
  if (!groupID) throw new Error('群聊身份不可用');
  /** cachedGroup 允许页面先展示已有真实快照。 */
  const cachedGroup = (await options.sync.groups.listCached()).find(item => item.groupID === groupID);
  if (cachedGroup) options.onCached?.({ conversation, group: cachedGroup });
  /** group 必须来自 canonical groups sync 的精确匹配结果。 */
  const group = (await options.sync.groups.sync({ pageSize: 100 })).find(item => item.groupID === groupID);
  if (!group) throw new Error('群资料不存在或尚未同步');
  return { conversation, group };
}
