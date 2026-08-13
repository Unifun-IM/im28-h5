/** 用户滚动期间悬浮日期的展示窗口。 */
export const CHAT_STICKY_DATE_VISIBLE_MS = 1200;

/** H5 历史到顶触发阈值，容纳浏览器惯性滚动误差。 */
export const CHAT_HISTORY_TOP_THRESHOLD_PX = 48;

/** 判断当前顶部滚动是否是用户主动触发且允许继续拉取历史。 */
export function shouldLoadOlderChatHistory(options: {
  readonly enabled: boolean;
  readonly hasUserInteracted: boolean;
  readonly hasMore: boolean;
  readonly loading: boolean;
  readonly scrollTop: number;
}): boolean {
  return options.enabled &&
    options.hasUserInteracted &&
    options.hasMore &&
    !options.loading &&
    options.scrollTop <= CHAT_HISTORY_TOP_THRESHOLD_PX;
}

/** 历史前插后按高度差恢复同一视觉消息位置。 */
export function getChatHistoryRestoredScrollTop(
  previousScrollTop: number,
  previousScrollHeight: number,
  nextScrollHeight: number,
): number {
  /** addedHeight 是本次旧页插入到顶部增加的真实 DOM 高度。 */
  const addedHeight = Math.max(0, nextScrollHeight - previousScrollHeight);
  return Math.max(0, previousScrollTop + addedHeight);
}

/** 从当前滚动容器顶部附近解析 RN 同语义的日期分隔文本。 */
export function getChatStickyDateLabel(container: HTMLElement): string {
  /** containerTop 是消息视口上边界。 */
  const containerTop = container.getBoundingClientRect().top;
  /** separators 按文档顺序提供每个自然日的可见边界。 */
  const separators = Array.from(
    container.querySelectorAll<HTMLElement>('.rn-chat-date-separator'),
  );
  /** current 保留最后一个已经越过视口顶部的日期。 */
  let current = separators[0]?.textContent?.trim() ?? '';
  for (const separator of separators) {
    if (separator.getBoundingClientRect().top > containerTop + 8) break;
    current = separator.textContent?.trim() ?? current;
  }
  return current;
}
