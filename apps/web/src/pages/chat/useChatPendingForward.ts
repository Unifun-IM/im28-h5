import { useEffect, useState } from 'react';
import {
  type Conversation,
  type Message,
  type WebIMGroupMember,
  type WebIMSync,
} from '@im28/im-sdk/web';

import { resolveChatForwardSenderNames } from './chat-forward-composer-view.js';
import type { ChatForwardRouteState } from './chat-forward-route.js';

/** 待发送转发预览由稳定路由身份重新加载，不接收来源页面消息正文。 */
export interface ChatPendingForward {
  readonly routeState: ChatForwardRouteState;
  readonly messages: readonly Message[];
  readonly senderNamesByID: ReadonlyMap<string, string>;
  readonly loading: boolean;
}

/** 待转发预览恢复只消费当前账号缓存和失效回调。 */
interface UseChatPendingForwardOptions {
  readonly currentUserID: string;
  readonly routeState: ChatForwardRouteState | null;
  readonly sync: WebIMSync | null;
  readonly onInvalid: (cause: unknown) => void;
}

/** 从当前账号 SQLite 缓存恢复待转发消息和 RN 优先级发送者名称。 */
export function useChatPendingForward({
  currentUserID,
  routeState,
  sync,
  onInvalid,
}: UseChatPendingForwardOptions): ChatPendingForward | null {
  // messages 只保存稳定 ID 精确命中的完整来源集合。
  const [messages, setMessages] = useState<readonly Message[]>([]);
  // senderNamesByID 保存来源会话上下文解析后的发送者展示名。
  const [senderNamesByID, setSenderNamesByID] = useState<ReadonlyMap<string, string>>(new Map());
  // loading 区分目标聊天历史和来源预览加载状态。
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sync || !routeState) {
      setMessages([]);
      setSenderNamesByID(new Map());
      setLoading(false);
      return;
    }
    // active 阻止目标切换后旧 cache 查询回写。
    let active = true;
    // 新来源读取期间不保留上一批消息，避免跨目标短暂串用预览。
    setMessages([]);
    setSenderNamesByID(new Map());
    setLoading(true);
    void sync.messages.getCachedByClientMsgIDs(routeState.sourceClientMsgIDs)
      .then(async cached => {
        if (!active) return;
        if (cached.length !== routeState.sourceClientMsgIDs.length) {
          throw new Error('部分转发来源已不在本地缓存，请重新选择');
        }
        /** sourceConversation 在展示缓存读取失败时保持空值，不阻断已有消息草稿。 */
        let sourceConversation: Conversation | null = null;
        /** sourceMembers 缺失时由展示 helper 使用格式化用户名称兜底。 */
        let sourceMembers: readonly WebIMGroupMember[] = [];
        try {
          /** cachedConversations 用于识别来源单聊或群聊，禁止使用目标会话名称。 */
          const cachedConversations = await sync.conversations.listCached({ limit: 500 });
          sourceConversation = cachedConversations.find(
            item => item.conversationID === routeState.sourceConversationID,
          ) ?? null;
          if (sourceConversation?.type === 'group' && sourceConversation.targetID) {
            sourceMembers = await sync.groupMembers.listCached(sourceConversation.targetID);
          }
        } catch {
          // 名称增强失败只降级展示，消息 cache 已完整时仍允许用户继续转发。
        }
        /** resolvedNames 严格按 frozen RN 的本人、群成员和单聊标题语义投影。 */
        const resolvedNames = resolveChatForwardSenderNames(cached, {
          currentUserID,
          sourceConversation,
          sourceConversationTitle: routeState.sourceConversationTitle,
          sourceMembers,
        });
        if (!active) return;
        setMessages(cached);
        setSenderNamesByID(resolvedNames);
      })
      .catch(cause => {
        if (active) onInvalid(cause);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currentUserID, onInvalid, routeState, sync]);

  if (!routeState) return null;
  return { routeState, messages, senderNamesByID, loading };
}
