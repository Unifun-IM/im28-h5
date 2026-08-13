import {
  getIMPreviousMessageHistoryCursor,
  mergeIMMessageHistoryWindow,
  type Message,
  type WebIMSync,
} from '@im28/im-sdk/web';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

import {
  CHAT_STICKY_DATE_VISIBLE_MS,
  getChatHistoryRestoredScrollTop,
  getChatStickyDateLabel,
  shouldLoadOlderChatHistory,
} from './chat-history-scroll.js';
import { readChatPageError } from './chat-page-helpers.js';

/** 聊天历史分页 hook 的账号、游标、DOM 与状态依赖。 */
interface UseChatHistoryPaginationOptions {
  readonly conversationID: string;
  readonly enabled: boolean;
  readonly initialHasMore: boolean;
  readonly initialNextCursor?: string;
  readonly messages: readonly Message[];
  readonly sync: WebIMSync | null;
  readonly listRef: RefObject<HTMLElement | null>;
  readonly setMessages: (messages: readonly Message[]) => void;
  readonly onError: (error: string) => void;
}

/** 管理 Web 顶部历史分页、DOM 高度补偿和短时悬浮日期。 */
export function useChatHistoryPagination({
  conversationID,
  enabled,
  initialHasMore,
  initialNextCursor,
  messages,
  sync,
  listRef,
  setMessages,
  onError,
}: UseChatHistoryPaginationOptions) {
  // hasMore 只承载 Gateway 明确返回的历史结束事实。
  const [hasMore, setHasMore] = useState(initialHasMore);
  // loadingMore 防止惯性滚动重复发起同一历史页。
  const [loadingMore, setLoadingMore] = useState(false);
  // stickyDateLabel 只保存当前滚动视口的瞬时日期文案。
  const [stickyDateLabel, setStickyDateLabel] = useState('');
  // nextCursorRef 保留 Gateway 精确 uint64 下一页游标。
  const nextCursorRef = useRef(initialNextCursor ?? '');
  // loadingRef 在同一事件循环中阻止重复请求。
  const loadingRef = useRef(false);
  // userInteractionRef 阻止初始定位等程序滚动误触发历史分页。
  const userInteractionRef = useRef(false);
  // messagesRef 让滚动监听读取最新窗口而无需反复绑定。
  const messagesRef = useRef(messages);
  // stickyHideTimerRef 统一管理 RN 同语义的滚动停止隐藏。
  const stickyHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    nextCursorRef.current = initialNextCursor ?? '';
    setHasMore(enabled && initialHasMore);
    setLoadingMore(false);
    setStickyDateLabel('');
    loadingRef.current = false;
    userInteractionRef.current = false;
  }, [conversationID, enabled, initialHasMore, initialNextCursor]);

  /** 拉取一页更早历史，并在提交 React DOM 后恢复用户视觉位置。 */
  const loadOlder = useCallback(async () => {
    if (!enabled || !sync || loadingRef.current || !hasMore) return;
    /** cursor 优先使用 Gateway next_seq，缺失时退回 shared 窗口最早 seq。 */
    const cursor = nextCursorRef.current ||
      getIMPreviousMessageHistoryCursor(messagesRef.current);
    if (!cursor) {
      setHasMore(false);
      return;
    }
    /** container 固定本次补偿所使用的唯一消息滚动节点。 */
    const container = listRef.current;
    if (!container) return;
    /** previousScrollTop 记录用户触发分页前的视口位置。 */
    const previousScrollTop = container.scrollTop;
    /** previousScrollHeight 记录旧窗口提交前的完整高度。 */
    const previousScrollHeight = container.scrollHeight;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      /** page 只由 SDK 解释 Gateway 分页事实并完成 SQLite 持久化。 */
      const page = await sync.messages.pullHistoryPage({
        conversationID,
        fromSeq: cursor,
        limit: 50,
      });
      /** merged 复用 shared 去重和精确 seq 排序规则。 */
      const merged = mergeIMMessageHistoryWindow(messagesRef.current, page.messages);
      messagesRef.current = merged;
      setMessages(merged);
      nextCursorRef.current = page.nextSeq ?? '';
      setHasMore(page.hasMore);
      requestAnimationFrame(() => {
        /** currentContainer 防止路由切换后补偿旧页面节点。 */
        const currentContainer = listRef.current;
        if (!currentContainer) return;
        currentContainer.scrollTop = getChatHistoryRestoredScrollTop(
          previousScrollTop,
          previousScrollHeight,
          currentContainer.scrollHeight,
        );
      });
    } catch (cause) {
      onError(readChatPageError(cause));
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [conversationID, enabled, hasMore, listRef, onError, setMessages, sync]);

  useEffect(() => {
    /** container 是本路由唯一滚动消息列表。 */
    const container = listRef.current;
    if (!container || !enabled) return;
    /** handleUserInteraction 记录 RN hasUserScrolled 同语义的真实用户手势。 */
    const handleUserInteraction = () => {
      userInteractionRef.current = true;
    };
    /** handleScroll 只将 DOM 位置翻译为页面加载和日期展示动作。 */
    const handleScroll = () => {
      if (!userInteractionRef.current) return;
      if (container.scrollHeight > container.clientHeight) {
        setStickyDateLabel(getChatStickyDateLabel(container));
        if (stickyHideTimerRef.current) clearTimeout(stickyHideTimerRef.current);
        stickyHideTimerRef.current = setTimeout(
          () => setStickyDateLabel(''),
          CHAT_STICKY_DATE_VISIBLE_MS,
        );
      }
      if (shouldLoadOlderChatHistory({
        enabled,
        hasUserInteracted: userInteractionRef.current,
        hasMore,
        loading: loadingRef.current,
        scrollTop: container.scrollTop,
      })) {
        void loadOlder();
      }
    };
    container.addEventListener('wheel', handleUserInteraction, { passive: true });
    container.addEventListener('touchmove', handleUserInteraction, { passive: true });
    container.addEventListener('pointerdown', handleUserInteraction, { passive: true });
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('wheel', handleUserInteraction);
      container.removeEventListener('touchmove', handleUserInteraction);
      container.removeEventListener('pointerdown', handleUserInteraction);
      container.removeEventListener('scroll', handleScroll);
      if (stickyHideTimerRef.current) clearTimeout(stickyHideTimerRef.current);
      stickyHideTimerRef.current = null;
    };
  }, [enabled, hasMore, listRef, loadOlder]);

  return { hasMore, loadingMore, stickyDateLabel };
}
