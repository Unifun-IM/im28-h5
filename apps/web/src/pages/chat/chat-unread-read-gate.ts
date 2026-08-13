/** H5 可见未读提交门禁的纯输入。 */
export interface ChatUnreadReadGateInput {
  readonly positioned: boolean;
  readonly contentHeight: number;
  readonly viewportHeight: number;
  readonly userInteracted: boolean;
  readonly programmaticReadAllowed: boolean;
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
