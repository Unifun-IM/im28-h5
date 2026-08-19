import {
  getIMInitialUnreadNavigation, getIMVisibleUnreadReadSeq,
  type IMInitialUnreadNavigation, type Message,
} from '@im28/im-sdk/web';
import {
  useCallback, useEffect, useLayoutEffect, useRef, useState,
  type RefObject,
} from 'react';

import {
  CHAT_UNREAD_READ_IDLE_MS,
  canReportChatVisibleUnread,
  getChatLatestMessageDelta,
  isChatUnreadAtLatestEdge,
  isChatUnreadRowReadable,
  shouldChatFollowLatest,
} from './chat-unread-read-gate.js';
import {
  findChatMessageRow,
  getChatMessageVisibleRatio,
  positionInitialUnreadBoundary,
} from './chat-unread-dom.js';

/** H5 初始未读导航只接收当前路由事实和唯一滚动容器。 */
interface ChatUnreadNavigationOptions {
  readonly conversationID: string;
  readonly lastReadSeq?: string;
  readonly messages: readonly Message[];
  readonly unreadCount: number;
  readonly ready: boolean;
  readonly listRef: RefObject<HTMLElement | null>;
  readonly onMarkRead?: (readSeq: string) => Promise<void>;
}

/** 未初始化时使用不可变空结果，避免列表创建伪边界。 */
const EMPTY_UNREAD_NAVIGATION: IMInitialUnreadNavigation = {
  unreadMessageIDs: [],
};

/** 管理初始未读锚点、剩余数量和用户离开最新端后的滚动保护。 */
export function useChatUnreadNavigation({
  conversationID,
  lastReadSeq,
  messages,
  unreadCount,
  ready,
  listRef,
  onMarkRead,
}: ChatUnreadNavigationOptions) {
  /** navigation 冻结入页完成加载时的 shared 未读边界。 */
  const [navigation, setNavigation] = useState<IMInitialUnreadNavigation>(
    EMPTY_UNREAD_NAVIGATION,
  );
  /** positionedConversationID 只在当前会话首屏定位完成后放行消息可见性。 */
  const [positionedConversationID, setPositionedConversationID] = useState('');
  /** initializedRef 保证同一路由只计算一次初始边界。 */
  const initializedRef = useRef(false);
  /** positionedRef 区分首次锚定和后续新消息跟随。 */
  const positionedRef = useRef(false);
  /** atLatestRef 记录 DOM 更新前用户是否位于最新端。 */
  const atLatestRef = useRef(true);
  /** viewedUnreadIDsRef 累积本次入页已看过的未读身份，不写服务端。 */
  const viewedUnreadIDsRef = useRef<ReadonlySet<string>>(new Set());
  /** previousMessagesRef 识别最新端新增并排除顶部历史分页。 */
  const previousMessagesRef = useRef<readonly Message[]>([]);
  /** hasUserInteractedRef 隔离首屏程序化滚动与真实用户阅读。 */
  const hasUserInteractedRef = useRef(false);
  /** allowProgrammaticReadRef 只放行显式未读定位或最新端新消息跟随。 */
  const allowProgrammaticReadRef = useRef(false);
  /** reportedReadSeqRef 阻止同一可见边界重复提交。 */
  const reportedReadSeqRef = useRef('');
  /** readIdleTimerRef 合并滚动期间的高频 read 尝试。 */
  const readIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** forceLatestAfterOutgoingRef 标记本端 sending 实体必须触发置底。 */
  const forceLatestAfterOutgoingRef = useRef(false);

  useEffect(() => {
    initializedRef.current = false;
    positionedRef.current = false;
    atLatestRef.current = true;
    viewedUnreadIDsRef.current = new Set();
    previousMessagesRef.current = [];
    hasUserInteractedRef.current = false;
    allowProgrammaticReadRef.current = false;
    reportedReadSeqRef.current = '';
    forceLatestAfterOutgoingRef.current = false;
    if (readIdleTimerRef.current) clearTimeout(readIdleTimerRef.current);
    readIdleTimerRef.current = null;
    setNavigation(EMPTY_UNREAD_NAVIGATION);
  }, [conversationID]);

  useLayoutEffect(() => {
    if (!ready || initializedRef.current || !conversationID) return;
    /** ordered 将 Repository newest-first 结果转换为 RN 阅读顺序。 */
    const ordered = [...messages].reverse();
    /** nextNavigation 仅调用 shared uint64 边界规则。 */
    const nextNavigation = getIMInitialUnreadNavigation(ordered, lastReadSeq);
    initializedRef.current = true;
    setNavigation(nextNavigation);
    /** container 在同一布局提交中使用 nextNavigation，不等待旧 state 重渲染。 */
    const container = listRef.current;
    if (!container) return;
    positionInitialUnreadBoundary(container, nextNavigation);
    positionedRef.current = true;
    previousMessagesRef.current = messages;
    setPositionedConversationID(conversationID);
  }, [conversationID, lastReadSeq, listRef, messages, ready]);

  /** 提交当前允许消费的最高可见未读序列，失败后允许重试。 */
  const reportVisibleUnread = useCallback((container: HTMLElement) => {
    if (unreadCount <= 0 || !onMarkRead || !positionedRef.current) return;
    if (!canReportChatVisibleUnread({
      positioned: positionedRef.current,
      contentHeight: container.scrollHeight,
      viewportHeight: container.clientHeight,
      userInteracted: hasUserInteractedRef.current,
      programmaticReadAllowed: allowProgrammaticReadRef.current,
    })) return;
    allowProgrammaticReadRef.current = false;
    /** atLatestEdge 对齐 RN：到达最新端必须消费当前窗口全部未读。 */
    const atLatestEdge = isChatUnreadAtLatestEdge({
      contentHeight: container.scrollHeight,
      viewportHeight: container.clientHeight,
      scrollTop: container.scrollTop,
    });
    /** visibleMessageIDs 在最新端收集全部身份，其余位置保持 RN 80% 阈值。 */
    const visibleMessageIDs = new Set<string>();
    container.querySelectorAll<HTMLElement>('[data-client-message-id]')
      .forEach(row => {
        if (!isChatUnreadRowReadable({
          atLatestEdge,
          visibleRatio: getChatMessageVisibleRatio(container, row),
        })) return;
        /** identity 同 shared 规则使用 server 优先。 */
        const identity = row.dataset.serverMessageId?.trim() ||
          row.dataset.clientMessageId?.trim();
        if (identity) visibleMessageIDs.add(identity);
      });
    /** currentReadSeq 优先使用本页已提交边界，保持单调递增。 */
    const currentReadSeq = reportedReadSeqRef.current || lastReadSeq;
    /** nextReadSeq 由 shared owner 过滤 incoming、未读和 uint64。 */
    const nextReadSeq = getIMVisibleUnreadReadSeq(
      [...messages].reverse(),
      currentReadSeq,
      visibleMessageIDs,
    );
    if (!nextReadSeq) return;
    reportedReadSeqRef.current = nextReadSeq;
    void onMarkRead(nextReadSeq).catch(() => {
      if (reportedReadSeqRef.current === nextReadSeq) {
        reportedReadSeqRef.current = '';
      }
    });
  }, [lastReadSeq, messages, onMarkRead, unreadCount]);

  /** 在滚动停止后重新读取当前 DOM 位置并提交唯一最高可见序列。 */
  const scheduleVisibleUnreadReport = useCallback(() => {
    if (readIdleTimerRef.current) clearTimeout(readIdleTimerRef.current);
    readIdleTimerRef.current = setTimeout(() => {
      readIdleTimerRef.current = null;
      /** container 在停滚时重新读取，禁止使用滚动事件发生时的旧位置。 */
      const container = listRef.current;
      if (container) reportVisibleUnread(container);
    }, CHAT_UNREAD_READ_IDLE_MS);
  }, [listRef, reportVisibleUnread]);

  /** 更新最新端状态并记录达到可见阈值的初始未读身份。 */
  const updateScrollState = useCallback(() => {
    /** container 是聊天页唯一消息滚动 owner。 */
    const container = listRef.current;
    if (!container) return;
    atLatestRef.current = isChatUnreadAtLatestEdge({
      contentHeight: container.scrollHeight,
      viewportHeight: container.clientHeight,
      scrollTop: container.scrollTop,
    });
    /** canConsumeVisible 拒绝初始长列表程序化定位产生的伪阅读。 */
    const canConsumeVisible = canReportChatVisibleUnread({
      positioned: positionedRef.current,
      contentHeight: container.scrollHeight,
      viewportHeight: container.clientHeight,
      userInteracted: hasUserInteractedRef.current,
      programmaticReadAllowed: allowProgrammaticReadRef.current,
    });
    if (!canConsumeVisible) return;
    /** nextViewed 从已有集合复制，只有新可见身份才触发状态更新。 */
    const nextViewed = new Set(viewedUnreadIDsRef.current);
    navigation.unreadMessageIDs.forEach(messageID => {
      /** row 使用气泡保存的 client/server 双身份匹配。 */
      const row = findChatMessageRow(container, messageID);
      if (row && getChatMessageVisibleRatio(container, row) >= 0.8) {
        nextViewed.add(messageID);
      }
    });
    if (nextViewed.size !== viewedUnreadIDsRef.current.size) {
      viewedUnreadIDsRef.current = nextViewed;
    }
    scheduleVisibleUnreadReport();
  }, [listRef, navigation, scheduleVisibleUnreadReport]);

  useEffect(() => {
    /** container 直接监听 passive scroll，列表保持纯展示组件。 */
    const container = listRef.current;
    if (!container) return;
    /** markUserInteraction 只记录会导致列表阅读位置变化的直接手势。 */
    const markUserInteraction = () => {
      hasUserInteractedRef.current = true;
      allowProgrammaticReadRef.current = false;
    };
    container.addEventListener('scroll', updateScrollState, { passive: true });
    container.addEventListener('touchstart', markUserInteraction, { passive: true });
    container.addEventListener('pointerdown', markUserInteraction, { passive: true });
    container.addEventListener('wheel', markUserInteraction, { passive: true });
    return () => {
      container.removeEventListener('scroll', updateScrollState);
      container.removeEventListener('touchstart', markUserInteraction);
      container.removeEventListener('pointerdown', markUserInteraction);
      container.removeEventListener('wheel', markUserInteraction);
      if (readIdleTimerRef.current) clearTimeout(readIdleTimerRef.current);
      readIdleTimerRef.current = null;
    };
  }, [listRef, updateScrollState]);

  useLayoutEffect(() => {
    if (!initializedRef.current) return;
    /** container 必须等消息 DOM 完成提交后再执行锚定或跟随。 */
    const container = listRef.current;
    if (!container) return;
    /** latestDelta 只识别 newest-first 窗口首部的新增消息。 */
    const latestDelta = getChatLatestMessageDelta(
      previousMessagesRef.current,
      messages,
    );
    /** outgoingMessageRequested 合并 sending 回调与 cache 最新端增量。 */
    const outgoingMessageRequested = forceLatestAfterOutgoingRef.current ||
      latestDelta.hasOutgoing;
    /** shouldFollowLatestValue 保留实时消息旧规则并放行本端强制置底。 */
    const shouldFollowLatestValue = shouldChatFollowLatest(
      atLatestRef.current,
      outgoingMessageRequested,
    );
    if (!positionedRef.current) {
      positionInitialUnreadBoundary(container, navigation);
      positionedRef.current = true;
      setPositionedConversationID(conversationID);
    } else if (
      (latestDelta.hasIncoming || outgoingMessageRequested) &&
      shouldFollowLatestValue
    ) {
      allowProgrammaticReadRef.current = true;
      container.scrollTop = container.scrollHeight;
      atLatestRef.current = true;
    }
    forceLatestAfterOutgoingRef.current = false;
    previousMessagesRef.current = messages;
    updateScrollState();
  }, [conversationID, listRef, messages, navigation, updateScrollState]);

  /** 本端 sending 实体写入视图前请求下一次消息布局强制置底。 */
  const requestLatestForOutgoingMessage = useCallback(() => {
    forceLatestAfterOutgoingRef.current = true;
  }, []);

  /** 显式用户动作定位下一条尚未看过的初始未读消息。 */
  const scrollToNextUnread = useCallback(() => {
    /** container 是唯一允许执行滚动的 DOM 节点。 */
    const container = listRef.current;
    if (!container) return;
    /** currentNavigation 同步包含入页后到达、尚未越过已读边界的消息。 */
    const currentNavigation = getIMInitialUnreadNavigation(
      [...messages].reverse(),
      reportedReadSeqRef.current || lastReadSeq,
    );
    /** nextID 按 shared 阅读顺序选择首个未达到可见阈值的身份。 */
    const nextID = currentNavigation.unreadMessageIDs.find(
      messageID => !viewedUnreadIDsRef.current.has(messageID),
    );
    /** row 缺失表示当前 50 条窗口无法承载该未读定位。 */
    const row = nextID ? findChatMessageRow(container, nextID) : null;
    if (row) {
      hasUserInteractedRef.current = true;
      allowProgrammaticReadRef.current = false;
      container.scrollTo({
        top: Math.max(
          0,
          row.offsetTop - (container.clientHeight - row.offsetHeight) / 2,
        ),
        behavior: 'smooth',
      });
    }
  }, [lastReadSeq, listRef, messages]);

  return {
    navigation,
    remainingUnreadCount: Math.max(0, unreadCount),
    initialPositioned: positionedConversationID === conversationID,
    scrollToNextUnread,
    requestLatestForOutgoingMessage,
  };
}
