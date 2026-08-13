/** 消息动作弹层定位只依赖长按瞬间的浏览器矩形。 */
export interface ChatMessageActionAnchor {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
  readonly mine: boolean;
}

/** 消息预览与菜单共用一个固定定位栈。 */
export interface ChatMessageActionStackLayout {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly previewWidth: number;
  readonly previewMaxHeight: number;
}

/** RN 消息动作菜单固定宽度。 */
export const CHAT_MESSAGE_ACTION_MENU_WIDTH = 200;

/** RN 每条动作使用 40px 稳定高度。 */
export const CHAT_MESSAGE_ACTION_ITEM_HEIGHT = 40;

/** 弹层与视口边缘保留触控安全距离。 */
const CHAT_MESSAGE_ACTION_SCREEN_GAP = 16;

/** 消息预览与动作菜单之间的固定距离。 */
const CHAT_MESSAGE_ACTION_PREVIEW_GAP = 8;

/** 根据消息方向和动作数量计算不越界的预览/菜单定位。 */
export function getChatMessageActionStackLayout(
  anchor: ChatMessageActionAnchor,
  actionCount: number,
  viewportWidth: number,
  viewportHeight: number,
): ChatMessageActionStackLayout {
  /** safeViewportWidth 防止极窄嵌入视口产生负宽度。 */
  const safeViewportWidth = Math.max(0, viewportWidth);
  /** safeViewportHeight 防止失效浏览器尺寸污染定位。 */
  const safeViewportHeight = Math.max(0, viewportHeight);
  /** maxContentWidth 是两侧安全距离之间的真实可用宽度。 */
  const maxContentWidth = Math.max(
    0,
    safeViewportWidth - CHAT_MESSAGE_ACTION_SCREEN_GAP * 2,
  );
  /** menuWidth 在窄屏上允许收窄但不突破视口。 */
  const menuWidth = Math.min(CHAT_MESSAGE_ACTION_MENU_WIDTH, maxContentWidth);
  /** previewWidth 保持原气泡宽度并至少与菜单同宽。 */
  const previewWidth = Math.min(
    Math.max(menuWidth, Math.max(0, anchor.width)),
    maxContentWidth,
  );
  /** left 对齐 RN：收到的消息靠左，发出的消息靠右。 */
  const preferredLeft = anchor.mine
    ? safeViewportWidth - CHAT_MESSAGE_ACTION_SCREEN_GAP - previewWidth
    : CHAT_MESSAGE_ACTION_SCREEN_GAP;
  /** leftClampMax 是定位栈允许的最右起点。 */
  const leftClampMax = Math.max(
    CHAT_MESSAGE_ACTION_SCREEN_GAP,
    safeViewportWidth - CHAT_MESSAGE_ACTION_SCREEN_GAP - previewWidth,
  );
  /** left 始终落在可视区域。 */
  const left = clamp(
    preferredLeft,
    CHAT_MESSAGE_ACTION_SCREEN_GAP,
    leftClampMax,
  );
  /** menuHeight 使用真实可见动作数量计算。 */
  const menuHeight = Math.max(1, actionCount) * CHAT_MESSAGE_ACTION_ITEM_HEIGHT;
  /** availablePreviewHeight 为菜单和间距预留空间。 */
  const availablePreviewHeight = Math.max(
    0,
    safeViewportHeight -
      CHAT_MESSAGE_ACTION_SCREEN_GAP * 2 -
      CHAT_MESSAGE_ACTION_PREVIEW_GAP -
      menuHeight,
  );
  /** previewMaxHeight 防止长消息把菜单推出视口。 */
  const previewMaxHeight = Math.min(Math.max(0, anchor.height), availablePreviewHeight);
  /** stackHeight 是最终可见预览与菜单总高度。 */
  const stackHeight = previewMaxHeight + CHAT_MESSAGE_ACTION_PREVIEW_GAP + menuHeight;
  /** topClampMax 是整组内容允许的最低起点。 */
  const topClampMax = Math.max(
    CHAT_MESSAGE_ACTION_SCREEN_GAP,
    safeViewportHeight - CHAT_MESSAGE_ACTION_SCREEN_GAP - stackHeight,
  );
  /** top 尽量保留原气泡纵向位置。 */
  const top = clamp(
    anchor.top,
    CHAT_MESSAGE_ACTION_SCREEN_GAP,
    topClampMax,
  );
  return { top, left, width: previewWidth, previewWidth, previewMaxHeight };
}

/** 将定位值限制在闭区间内。 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
