import { useEffect, useRef, useState, type RefObject } from 'react';
import type { Conversation, Message, PresetEmojiDocument, WebIMSync } from '@im28/im-sdk/web';

import { focusChatMessageRow, readFocusedChatMessageWindow } from './chat-message-focus.js';
import { readChatPageError, readInitialChatMessageWindow } from './chat-page-helpers.js';

/** 聊天历史分页只保存服务端确认的上一页事实。 */
export interface ChatHistoryPageState {
  readonly hasMore: boolean;
  readonly nextCursor?: string;
}

/** 页面缓存 hook 只接收路由、账号和 shared facade 事实。 */
interface UseChatPageCacheStateOptions {
  readonly conversationID: string;
  readonly focusedMessageID: string;
  readonly accountUserID: string | null;
  readonly dataVersion: number;
  readonly sync: WebIMSync | null;
  readonly messageListRef: RefObject<HTMLElement | null>;
}

/** 统一拥有聊天页的 SQLite 首屏恢复、实时重读和搜索目标定位状态。 */
export function useChatPageCacheState({
  conversationID,
  focusedMessageID,
  accountUserID,
  dataVersion,
  sync,
  messageListRef,
}: UseChatPageCacheStateOptions) {
  // conversation 为 header 和发送能力提供当前账号缓存身份。
  const [conversation, setConversation] = useState<Conversation | null>(null);
  // draftDocument 是从 SDK SQLite 恢复的规范未发送文档。
  const [draftDocument, setDraftDocument] = useState<PresetEmojiDocument>({
    text: '',
    entities: [],
  });
  // messages 保持 Repository newest-first 结果。
  const [messages, setMessages] = useState<readonly Message[]>([]);
  // quoteMessage 保存当前 composer 唯一引用来源。
  const [quoteMessage, setQuoteMessage] = useState<Message | null>(null);
  // loading 标记首次 cache 与 remote history 窗口恢复。
  const [loading, setLoading] = useState(true);
  // error 只呈现真实读取或 mutation 错误。
  const [error, setError] = useState<string | null>(null);
  // historyPage 保存首拉后 Gateway 确认的精确游标。
  const [historyPage, setHistoryPage] = useState<ChatHistoryPageState>({ hasMore: false });
  // messageWindowSizeRef 防止 realtime 重读把已展开窗口裁回 50 条。
  const messageWindowSizeRef = useRef(50);

  useEffect(() => {
    messageWindowSizeRef.current = Math.max(50, messages.length);
  }, [messages.length]);

  useEffect(() => {
    if (!sync || !accountUserID || !conversationID) return;
    // active 阻止路由切换后的旧请求回写。
    let active = true;
    setLoading(true);
    setError(null);
    setConversation(null);
    setDraftDocument({ text: '', entities: [] });
    setMessages([]);
    setHistoryPage({ hasMore: false });
    setQuoteMessage(null);
    void (async () => {
      try {
        // cachedConversations 确认目标属于当前认证账号 SQLite。
        const cachedConversations = await sync.conversations.listCached({ limit: 500 });
        // target 是当前路由对应的真实缓存会话。
        const target = cachedConversations.find(item => item.conversationID === conversationID);
        if (!target) throw new Error('会话不存在或尚未同步');
        // cachedDraft 由 shared owner 从 draft 索引与专用 entity 列恢复。
        const cachedDraft = await sync.conversations.getDraft(conversationID);
        if (active) {
          setConversation(target);
          setDraftDocument(cachedDraft);
        }
        // refreshedWindow 按普通或搜索目标模式读取当前账号 SQLite 窗口。
        const refreshedWindow = await readInitialChatMessageWindow(sync.messages, {
          conversationID,
          fromSeq: target.lastMsgSeq ?? '0',
          focusedMessageID,
          limit: 50,
        }, cached => { if (active) setMessages(cached); });
        if (active) {
          setMessages(refreshedWindow.messages);
          setHistoryPage({
            hasMore: refreshedWindow.hasMore,
            ...(refreshedWindow.nextCursor ? { nextCursor: refreshedWindow.nextCursor } : {}),
          });
        }
      } catch (cause) {
        if (active) setError(readChatPageError(cause));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [accountUserID, conversationID, focusedMessageID, sync]);

  useEffect(() => {
    if (!sync || !accountUserID || !conversationID || dataVersion === 0) return;
    // active 阻止实时 cache 读取在路由切换后回写旧会话。
    let active = true;
    void Promise.all([
      sync.conversations.listCached({ limit: 500 }),
      focusedMessageID
        ? readFocusedChatMessageWindow(sync.messages, conversationID, focusedMessageID)
        : sync.messages.getCachedHistory({
            conversationID,
            limit: messageWindowSizeRef.current,
          }),
    ])
      .then(([cachedConversations, cachedMessages]) => {
        if (!active) return;
        // target 用当前 cache 刷新 header 的会话资料。
        const target = cachedConversations.find(item => item.conversationID === conversationID);
        if (target) setConversation(target);
        setMessages(cachedMessages);
      })
      .catch(cause => {
        if (active) setError(readChatPageError(cause));
      });
    return () => {
      active = false;
    };
  }, [accountUserID, conversationID, dataVersion, focusedMessageID, sync]);

  useEffect(() => {
    if (!focusedMessageID) return;
    // frame 等待搜索目标 DOM 完成布局后覆盖普通初始未读锚点。
    const frame = requestAnimationFrame(() => {
      focusChatMessageRow(messageListRef.current, focusedMessageID);
    });
    return () => cancelAnimationFrame(frame);
  }, [focusedMessageID, messageListRef, messages.length]);

  return {
    conversation,
    setConversation,
    draftDocument,
    setDraftDocument,
    messages,
    setMessages,
    quoteMessage,
    setQuoteMessage,
    loading,
    error,
    setError,
    historyPage,
  };
}
