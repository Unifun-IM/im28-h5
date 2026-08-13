import type { WebIMContact, WebIMJoinedGroup, WebIMSync } from '@im28/im-sdk/web';

import {
  contactToChatForwardTarget,
  conversationToChatForwardTarget,
  findForwardGroupConversationID,
  groupToChatForwardTarget,
  type ChatForwardTarget,
} from './forward-target-view.js';

/** 转发和应用内分享共同消费的三类真实目标快照。 */
export interface ChatForwardTargetSource {
  readonly recent: readonly ChatForwardTarget[];
  readonly contacts: readonly WebIMContact[];
  readonly groups: readonly WebIMJoinedGroup[];
}

/** 目标加载参数允许页面选择是否读取最近会话。 */
export interface LoadChatForwardTargetsOptions {
  readonly sync: WebIMSync;
  readonly includeRecent?: boolean;
  readonly onCached?: (source: ChatForwardTargetSource) => void;
}

/** 统一执行最近会话、好友和已加入群的 cache-first 加载。 */
export async function loadChatForwardTargets(
  options: LoadChatForwardTargetsOptions,
): Promise<ChatForwardTargetSource> {
  /** includeRecent 让二维码分享沿用好友/群 owner 而不加载无用会话。 */
  const includeRecent = options.includeRecent !== false;
  /** cachedValues 只读取当前认证账号绑定的 SQLite。 */
  const cachedValues = await Promise.all([
    includeRecent
      ? options.sync.conversations.listCached({ archived: false, limit: 100 })
      : Promise.resolve([]),
    options.sync.contacts.listCached().catch(() => [] as readonly WebIMContact[]),
    options.sync.groups.listCached(),
  ]);
  /** cachedSource 在网络刷新前提供可追踪的真实缓存结果。 */
  const cachedSource: ChatForwardTargetSource = {
    recent: cachedValues[0].map(conversationToChatForwardTarget),
    contacts: cachedValues[1],
    groups: cachedValues[2],
  };
  options.onCached?.(cachedSource);
  /** refreshedValues 复用三个 canonical facade 的分页与落库规则。 */
  const refreshedValues = await Promise.all([
    includeRecent
      ? options.sync.conversations.sync({ pageSize: 100 })
      : Promise.resolve([]),
    options.sync.contacts.list({ pageSize: 100 }),
    options.sync.groups.sync({ pageSize: 50 }),
  ]);
  return {
    recent: refreshedValues[0].map(conversationToChatForwardTarget),
    contacts: refreshedValues[1],
    groups: refreshedValues[2],
  };
}

/** 将好友或群目标解析为当前账号下真实可发送的会话 ID。 */
export async function resolveChatForwardTargetConversationID(
  sync: WebIMSync,
  target: ChatForwardTarget,
): Promise<string> {
  if (target.kind === 'friend') {
    return (await sync.peerProfile.openConversation(target.id)).conversationID;
  }
  if (target.kind === 'conversation') {
    if (!target.conversationID) throw new Error('目标会话尚未建立');
    return target.conversationID;
  }
  /** cachedConversations 先验证群目标与现有会话的身份关系。 */
  let cachedConversations = await sync.conversations.listCached({ limit: 500 });
  /** conversationID 拒绝按字符串约定制造群会话身份。 */
  let conversationID = findForwardGroupConversationID(target, cachedConversations);
  if (!conversationID) {
    cachedConversations = await sync.conversations.sync({ pageSize: 100 });
    conversationID = findForwardGroupConversationID(target, cachedConversations);
  }
  if (!conversationID) throw new Error('目标会话尚未建立');
  return conversationID;
}

/** 把来源快照投影为指定好友或群 tab 的展示目标。 */
export function readChatForwardTargets(
  source: ChatForwardTargetSource,
  kind: 'friend' | 'group' | 'conversation',
): readonly ChatForwardTarget[] {
  if (kind === 'friend') return source.contacts.map(contactToChatForwardTarget);
  if (kind === 'group') return source.groups.map(groupToChatForwardTarget);
  return source.recent;
}
