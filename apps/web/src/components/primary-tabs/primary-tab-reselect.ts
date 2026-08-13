/** RN 消息主标签触发下一未读滚动的双击时间窗。 */
export const PRIMARY_CONVERSATION_TAB_DOUBLE_PRESS_MS = 320;

/** 判断两次消息主标签点击是否落在 RN 同款双击时间窗内。 */
export function isPrimaryConversationTabDoublePress(
  previousPressTime: number,
  currentPressTime: number,
): boolean {
  /** elapsed 只接受正向、有限的时间差，避免时钟异常误触发。 */
  const elapsed = currentPressTime - previousPressTime;
  return previousPressTime > 0 && Number.isFinite(elapsed) && elapsed >= 0 && (
    elapsed <= PRIMARY_CONVERSATION_TAB_DOUBLE_PRESS_MS
  );
}

/** 判断当前消息主标签点击是否具备请求下一未读滚动的完整条件。 */
export function shouldRequestPrimaryConversationTabReselect(
  selected: boolean,
  unreadTotal: number,
  previousPressTime: number,
  currentPressTime: number,
): boolean {
  return selected && Math.max(0, Math.trunc(unreadTotal)) > 0 && (
    isPrimaryConversationTabDoublePress(previousPressTime, currentPressTime)
  );
}
