import {
  getIMInitialUnreadNavigation,
  getIMVisibleUnreadReadSeq,
  type IMInitialUnreadNavigation,
  type Message,
} from '@im28/im-sdk/web';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';

import { canReportChatVisibleUnread } from './chat-unread-read-gate.js';

/** H5 初始未读导航只接收当前路由事实和唯一滚动容器。 */
interface ChatUnreadNavigationOptions {
  readonly conversationID: string;
  readonly lastReadSeq?: string;
  readonly messages: readonly Message[];
  readonly hasUnreadMessages: boolean;
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
  hasUnreadMessages,
  ready,
  listRef,
  onMarkRead,
}: ChatUnreadNavigationOptions) {
  /** navigation 冻结入页完成加载时的 shared 未读边界。 */
  const [navigation, setNavigation] = useState<IMInitialUnreadNavigation>(
    EMPTY_UNREAD_NAVIGATION,
  );
  /** remainingUnreadCount 只表示本页尚未达到 80% 可见的初始未读消息。 */
  const [remainingUnreadCount, setRemainingUnreadCount] = useState(0);
  /** initializedRef 保证同一路由只计算一次初始边界。 */
  const initializedRef = useRef(false);
  /** positionedRef 区分首次锚定和后续新消息跟随。 */
  const positionedRef = useRef(false);
  /** atLatestRef 记录 DOM 更新前用户是否位于最新端。 */
  const atLatestRef = useRef(true);
  /** viewedUnreadIDsRef 累积本次入页已看过的未读身份，不写服务端。 */
  const viewedUnreadIDsRef = useRef<ReadonlySet<string>>(new Set());
  /** previousMessageCountRef 识别后续消息窗口增长。 */
  const previousMessageCountRef = useRef(0);
  /** hasUserInteractedRef 隔离首屏程序化滚动与真实用户阅读。 */
  const hasUserInteractedRef = useRef(false);
  /** allowProgrammaticReadRef 只放行显式未读定位或最新端新消息跟随。 */
  const allowProgrammaticReadRef = useRef(false);
  /** reportedReadSeqRef 阻止同一可见边界重复提交。 */
  const reportedReadSeqRef = useRef('');

  useEffect(() => {
    initializedRef.current = false;
    positionedRef.current = false;
    atLatestRef.current = true;
    viewedUnreadIDsRef.current = new Set();
    previousMessageCountRef.current = 0;
    hasUserInteractedRef.current = false;
    allowProgrammaticReadRef.current = false;
    reportedReadSeqRef.current = '';
    setNavigation(EMPTY_UNREAD_NAVIGATION);
    setRemainingUnreadCount(0);
  }, [conversationID]);

  useEffect(() => {
    if (!ready || initializedRef.current || !conversationID) return;
    /** ordered 将 Repository newest-first 结果转换为 RN 阅读顺序。 */
    const ordered = [...messages].reverse();
    /** nextNavigation 仅调用 shared uint64 边界规则。 */
    const nextNavigation = getIMInitialUnreadNavigation(ordered, lastReadSeq);
    initializedRef.current = true;
    setNavigation(nextNavigation);
    setRemainingUnreadCount(nextNavigation.unreadMessageIDs.length);
  }, [conversationID, lastReadSeq, messages, ready]);

  /** 提交当前允许消费的最高可见未读序列，失败后允许重试。 */
  const reportVisibleUnread = useCallback((container: HTMLElement) => {
    if (!hasUnreadMessages || !onMarkRead || !positionedRef.current) return;
    if (!canReportChatVisibleUnread({
      positioned: positionedRef.current,
      contentHeight: container.scrollHeight,
      viewportHeight: container.clientHeight,
      userInteracted: hasUserInteractedRef.current,
      programmaticReadAllowed: allowProgrammaticReadRef.current,
    })) return;
    /** visibleMessageIDs 只收集达到 RN 80% 阈值的稳定身份。 */
    const visibleMessageIDs = new Set<string>();
    container.querySelectorAll<HTMLElement>('[data-client-message-id]')
      .forEach(row => {
        if (getVisibleRatio(container, row) < 0.8) return;
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
    allowProgrammaticReadRef.current = false;
    void onMarkRead(nextReadSeq).catch(() => {
      if (reportedReadSeqRef.current === nextReadSeq) {
        reportedReadSeqRef.current = '';
      }
    });
  }, [hasUnreadMessages, lastReadSeq, messages, onMarkRead]);

  /** 更新最新端状态并累计达到可见阈值的初始未读消息。 */
  const updateScrollState = useCallback(() => {
    /** container 是聊天页唯一消息滚动 owner。 */
    const container = listRef.current;
    if (!container) return;
    atLatestRef.current = isChatListAtLatestEdge(container);
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
      if (row && getVisibleRatio(container, row) >= 0.8) nextViewed.add(messageID);
    });
    if (nextViewed.size !== viewedUnreadIDsRef.current.size) {
      viewedUnreadIDsRef.current = nextViewed;
      setRemainingUnreadCount(Math.max(
        0,
        navigation.unreadMessageIDs.length - nextViewed.size,
      ));
    }
    reportVisibleUnread(container);
  }, [listRef, navigation, reportVisibleUnread]);

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
    container.addEventListener('touchmove', markUserInteraction, { passive: true });
    container.addEventListener('wheel', markUserInteraction, { passive: true });
    return () => {
      container.removeEventListener('scroll', updateScrollState);
      container.removeEventListener('touchmove', markUserInteraction);
      container.removeEventListener('wheel', markUserInteraction);
    };
  }, [listRef, updateScrollState]);

  useLayoutEffect(() => {
    if (!initializedRef.current) return;
    /** container 必须等消息 DOM 完成提交后再执行锚定或跟随。 */
    const container = listRef.current;
    if (!container) return;
    /** shouldFollowLatest 冻结 DOM 更新前的最新端状态。 */
    const shouldFollowLatest = atLatestRef.current;
    /** frame 合并本轮布局与唯一滚动命令。 */
    const frame = requestAnimationFrame(() => {
      if (!positionedRef.current) {
        positionInitialUnreadBoundary(container, navigation);
        positionedRef.current = true;
      } else if (
        messages.length !== previousMessageCountRef.current &&
        shouldFollowLatest
      ) {
        allowProgrammaticReadRef.current = true;
        container.scrollTop = container.scrollHeight;
      }
      previousMessageCountRef.current = messages.length;
      updateScrollState();
      /** 最新端跟随许可只属于当前布局帧，outgoing 增长不得残留。 */
      allowProgrammaticReadRef.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [listRef, messages.length, navigation, updateScrollState]);

  /** 显式用户动作定位下一条尚未看过的初始未读消息。 */
  const scrollToNextUnread = useCallback(() => {
    /** container 是唯一允许执行滚动的 DOM 节点。 */
    const container = listRef.current;
    if (!container) return;
    /** nextID 按 shared 阅读顺序选择首个未达到可见阈值的身份。 */
    const nextID = navigation.unreadMessageIDs.find(
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
  }, [listRef, navigation]);

  return { navigation, remainingUnreadCount, scrollToNextUnread };
}

/** 首入页把最后已读消息贴近底边；无已读上下文时显示首条未读。 */
function positionInitialUnreadBoundary(
  container: HTMLElement,
  navigation: IMInitialUnreadNavigation,
): void {
  /** lastReadRow 是 RN 初始未读区域之前的视觉锚点。 */
  const lastReadRow = navigation.lastReadMessageID
    ? findChatMessageRow(container, navigation.lastReadMessageID)
    : null;
  if (lastReadRow) {
    container.scrollTop = Math.max(
      0,
      lastReadRow.offsetTop + lastReadRow.offsetHeight - container.clientHeight,
    );
    return;
  }
  /** firstUnreadRow 覆盖未读从窗口首条开始的短历史。 */
  const firstUnreadRow = navigation.firstUnreadMessageID
    ? findChatMessageRow(container, navigation.firstUnreadMessageID)
    : null;
  if (firstUnreadRow) {
    container.scrollTop = Math.max(0, firstUnreadRow.offsetTop - 32);
    return;
  }
  container.scrollTop = container.scrollHeight;
}

/** 按 client/server 双身份查找普通气泡或系统消息。 */
function findChatMessageRow(
  container: HTMLElement,
  messageID: string,
): HTMLElement | null {
  return Array.from(
    container.querySelectorAll<HTMLElement>('[data-client-message-id]'),
  ).find(row =>
    row.dataset.clientMessageId === messageID ||
    row.dataset.serverMessageId === messageID,
  ) ?? null;
}

/** 判断消息列表是否处于距最新端 40px 的 RN 容错区。 */
function isChatListAtLatestEdge(container: HTMLElement): boolean {
  return container.scrollHeight - container.scrollTop - container.clientHeight <= 40;
}

/** 计算消息行在滚动容器中的可见比例。 */
function getVisibleRatio(container: HTMLElement, row: HTMLElement): number {
  /** containerRect 提供当前滚动视口边界。 */
  const containerRect = container.getBoundingClientRect();
  /** rowRect 提供消息实际布局边界。 */
  const rowRect = row.getBoundingClientRect();
  /** visibleHeight 拒绝视口外的负相交高度。 */
  const visibleHeight = Math.max(
    0,
    Math.min(containerRect.bottom, rowRect.bottom) -
      Math.max(containerRect.top, rowRect.top),
  );
  return rowRect.height > 0 ? visibleHeight / rowRect.height : 0;
}
