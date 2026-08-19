import type { IMInitialUnreadNavigation } from '@im28/im-sdk/web';

/** 首入页把最后已读消息贴近底边；无已读上下文时显示首条未读。 */
export function positionInitialUnreadBoundary(
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
export function findChatMessageRow(
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

/** 计算消息行在滚动容器中的可见比例。 */
export function getChatMessageVisibleRatio(
  container: HTMLElement,
  row: HTMLElement,
): number {
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
