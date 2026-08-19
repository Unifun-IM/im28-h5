import type { Message } from '@im28/im-sdk/web';

/** H5 可见未读提交门禁的纯输入。 */
export interface ChatUnreadReadGateInput {
  readonly positioned: boolean;
  readonly contentHeight: number;
  readonly viewportHeight: number;
  readonly userInteracted: boolean;
  readonly programmaticReadAllowed: boolean;
}

/** H5 聊天列表最新端判定只依赖真实滚动尺寸。 */
export interface ChatUnreadLatestEdgeInput {
  readonly contentHeight: number;
  readonly viewportHeight: number;
  readonly scrollTop: number;
}

/** H5 单条消息是否进入本次已读计算的纯输入。 */
export interface ChatUnreadRowReadableInput {
  readonly atLatestEdge: boolean;
  readonly visibleRatio: number;
}

/** 消息窗口更新后只暴露最新端新增方向，排除顶部历史分页。 */
export interface ChatLatestMessageDelta {
  readonly hasIncoming: boolean;
  readonly hasOutgoing: boolean;
}

/** 停滚 160ms 后再上报已读，合并触摸惯性滚动产生的高频事件。 */
export const CHAT_UNREAD_READ_IDLE_MS = 160;

/** 对齐 RN：内容不足一屏或距离底部不超过 40px 都视为到达最新端。 */
export function isChatUnreadAtLatestEdge({
  contentHeight,
  viewportHeight,
  scrollTop,
}: ChatUnreadLatestEdgeInput): boolean {
  if (contentHeight <= 0 || viewportHeight <= 0) return false;
  return contentHeight <= viewportHeight ||
    contentHeight - Math.max(0, scrollTop) - viewportHeight <= 40;
}

/** 对齐 RN：最新端消费全部未读，离开最新端后仅消费达到 80% 可见度的消息。 */
export function isChatUnreadRowReadable({
  atLatestEdge,
  visibleRatio,
}: ChatUnreadRowReadableInput): boolean {
  return atLatestEdge || visibleRatio >= 0.8;
}

/** 对齐 RN：短列表真实测量后可提交，长列表必须来自用户或显式最新端动作。 */
export function canReportChatVisibleUnread({
  positioned,
  contentHeight,
  viewportHeight,
  userInteracted,
  programmaticReadAllowed,
}: ChatUnreadReadGateInput): boolean {
  if (!positioned || viewportHeight <= 0 || contentHeight <= 0) return false;
  /** contentFitsViewport 只使用消息滚动容器的真实布局尺寸。 */
  const contentFitsViewport = contentHeight <= viewportHeight;
  return contentFitsViewport || userInteracted || programmaticReadAllowed;
}

/** 本端发送强制跟随最新；其他消息只在用户原本位于最新端时跟随。 */
export function shouldChatFollowLatest(
  atLatestEdge: boolean,
  outgoingMessageRequested: boolean,
): boolean {
  return atLatestEdge || outgoingMessageRequested;
}

/** 从 newest-first 窗口识别首个旧消息之前的真实新增消息。 */
export function getChatLatestMessageDelta(
  previousMessages: readonly Message[],
  nextMessages: readonly Message[],
): ChatLatestMessageDelta {
  if (previousMessages.length === 0 || nextMessages.length === 0) {
    return { hasIncoming: false, hasOutgoing: false };
  }
  /** previousMessageIDs 只使用列表稳定 key，状态替换不视为新消息。 */
  const previousMessageIDs = new Set(
    previousMessages.map(message => message.clientMsgID),
  );
  /** firstPreviousIndex 之前才是最新端增量，之后是历史或已有窗口。 */
  const firstPreviousIndex = nextMessages.findIndex(message =>
    previousMessageIDs.has(message.clientMsgID),
  );
  if (firstPreviousIndex <= 0) {
    return { hasIncoming: false, hasOutgoing: false };
  }
  /** latestMessages 保守拒绝完全换窗，避免搜索定位误判为实时消息。 */
  const latestMessages = nextMessages.slice(0, firstPreviousIndex);
  return {
    hasIncoming: latestMessages.some(message => message.direction === 'incoming'),
    hasOutgoing: latestMessages.some(message => message.direction === 'outgoing'),
  };
}
