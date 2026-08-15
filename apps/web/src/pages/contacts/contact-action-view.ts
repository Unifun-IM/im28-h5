import type { WebIMContact } from '@im28/im-sdk/web';

/** 联系人长按菜单支持的四个 RN 动作。 */
export type ContactActionKey = 'message' | 'call' | 'share-card' | 'delete-friend';

/** 联系人长按菜单保存稳定联系人和视口定位结果。 */
export interface ContactActionMenuState {
  readonly contact: WebIMContact;
  readonly top: number;
  readonly left: number;
  readonly placement: 'above' | 'below';
}

/** 联系人长按点位是浏览器指针事件的最小稳定投影。 */
export interface ContactActionPoint {
  readonly x: number;
  readonly y: number;
}

/** 名片分享路由只携带展示所需的稳定公开字段。 */
export interface ContactCardShareLocationState {
  readonly card: Pick<WebIMContact, 'userID' | 'displayName' | 'avatarURL'>;
}

/** RN 联系人动作气泡的固定宽度。 */
const CONTACT_ACTION_MENU_WIDTH = 168;
/** RN 联系人动作气泡的固定高度。 */
const CONTACT_ACTION_MENU_HEIGHT = 224;
/** RN 联系人动作气泡与视口的最小间距。 */
const CONTACT_ACTION_MENU_MARGIN = 8;
/** RN 联系人动作气泡与长按点的间距。 */
const CONTACT_ACTION_MENU_GAP = 12;

/** 按 RN 规则计算联系人动作气泡的视口位置和翻转方向。 */
export function getContactActionMenuState(options: {
  readonly contact: WebIMContact;
  readonly point: ContactActionPoint;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
}): ContactActionMenuState {
  /** maxLeft 保证固定宽度气泡不会越过右侧安全边距。 */
  const maxLeft = Math.max(
    CONTACT_ACTION_MENU_MARGIN,
    options.viewportWidth - CONTACT_ACTION_MENU_WIDTH - CONTACT_ACTION_MENU_MARGIN,
  );
  /** left 以长按点为中心，并约束在水平视口内。 */
  const left = Math.min(
    Math.max(
      options.point.x - CONTACT_ACTION_MENU_WIDTH / 2,
      CONTACT_ACTION_MENU_MARGIN,
    ),
    maxLeft,
  );
  /** minTop 给顶部安全区保留固定边距。 */
  const minTop = CONTACT_ACTION_MENU_MARGIN;
  /** maxTop 保证气泡不会越过底部安全边距。 */
  const maxTop = Math.max(
    minTop,
    options.viewportHeight - CONTACT_ACTION_MENU_HEIGHT - CONTACT_ACTION_MENU_MARGIN,
  );
  /** aboveTop 是气泡完整显示在长按点上方时的候选位置。 */
  const aboveTop = options.point.y - CONTACT_ACTION_MENU_HEIGHT - CONTACT_ACTION_MENU_GAP;
  /** placement 在上方空间不足时与 RN 一样翻转到下方。 */
  const placement = aboveTop >= minTop ? 'above' : 'below';
  /** rawTop 根据翻转方向生成未约束的垂直位置。 */
  const rawTop = placement === 'above'
    ? aboveTop
    : options.point.y + CONTACT_ACTION_MENU_GAP;
  /** top 将最终位置限制在可见视口。 */
  const top = Math.min(Math.max(rawTop, minTop), maxTop);
  return { contact: options.contact, top, left, placement };
}

/** 校验未知 history state 是否属于当前名片用户。 */
export function readContactCardShareLocationState(
  value: unknown,
  routeUserID: string,
): ContactCardShareLocationState | null {
  if (!value || typeof value !== 'object' || !('card' in value)) return null;
  /** card 是唯一允许从 history state 读取的嵌套对象。 */
  const card = (value as { readonly card?: unknown }).card;
  if (!card || typeof card !== 'object') return null;
  /** candidate 将未知对象缩窄为待逐项验证的公开字段。 */
  const candidate = card as Record<string, unknown>;
  /** userID 必须与当前 URL 参数严格一致。 */
  const userID = typeof candidate.userID === 'string' ? candidate.userID.trim() : '';
  if (!userID || userID !== routeUserID.trim()) return null;
  return {
    card: {
      userID,
      displayName: typeof candidate.displayName === 'string'
        ? candidate.displayName.trim()
        : userID,
      avatarURL: typeof candidate.avatarURL === 'string'
        ? candidate.avatarURL.trim()
        : '',
    },
  };
}
