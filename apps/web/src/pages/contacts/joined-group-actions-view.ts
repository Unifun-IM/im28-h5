import type { WebIMJoinedGroup } from '@im28/im-sdk/web';

/** 群列表长按菜单支持的 RN 动作。 */
export type JoinedGroupActionKey = 'share-card' | 'quit' | 'edit-name';

/** 群列表退出入口按 shared capability 收敛后的模式。 */
export type JoinedGroupQuitMode = 'leave' | 'owner' | 'unavailable';

/** 群列表长按点位只保留浏览器视口坐标。 */
export interface JoinedGroupActionPoint {
  readonly x: number;
  readonly y: number;
}

/** 群列表动作菜单保存真实群记录和稳定定位结果。 */
export interface JoinedGroupActionMenuState {
  readonly group: WebIMJoinedGroup;
  readonly top: number;
  readonly left: number;
  readonly placement: 'above' | 'below';
  readonly actions: readonly JoinedGroupActionKey[];
}

/** RN 群动作气泡固定宽度。 */
const GROUP_ACTION_MENU_WIDTH = 168;
/** RN 群动作气泡单项高度。 */
const GROUP_ACTION_MENU_ITEM_HEIGHT = 56;
/** 群动作气泡与视口的最小间距。 */
const GROUP_ACTION_MENU_MARGIN = 8;
/** 群动作气泡与长按点的间距。 */
const GROUP_ACTION_MENU_GAP = 12;

/** 按 shared capability 生成 RN 同序群列表动作。 */
export function getJoinedGroupActions(
  group: WebIMJoinedGroup,
): readonly JoinedGroupActionKey[] {
  /** actions 固定保留群名片与退出入口。 */
  const actions: JoinedGroupActionKey[] = ['share-card', 'quit'];
  if (group.permissions.canEditGroupInfo) actions.push('edit-name');
  return actions;
}

/** 只按 shared lifecycle capability 决定退出后续，不读取角色数字。 */
export function getJoinedGroupQuitMode(
  group: WebIMJoinedGroup,
): JoinedGroupQuitMode {
  if (group.permissions.canQuitGroup) return 'leave';
  if (group.permissions.canTransferOwner) return 'owner';
  return 'unavailable';
}

/** 按 RN 规则计算群动作气泡位置与上下翻转方向。 */
export function getJoinedGroupActionMenuState(options: {
  readonly group: WebIMJoinedGroup;
  readonly point: JoinedGroupActionPoint;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
}): JoinedGroupActionMenuState {
  /** actions 决定当前能力下的真实菜单高度。 */
  const actions = getJoinedGroupActions(options.group);
  /** menuHeight 由固定行高和动作数量构成。 */
  const menuHeight = actions.length * GROUP_ACTION_MENU_ITEM_HEIGHT;
  /** maxLeft 保证菜单不越过右侧视口。 */
  const maxLeft = Math.max(
    GROUP_ACTION_MENU_MARGIN,
    options.viewportWidth - GROUP_ACTION_MENU_WIDTH - GROUP_ACTION_MENU_MARGIN,
  );
  /** left 以长按点为中心并限制在视口内。 */
  const left = Math.min(
    Math.max(options.point.x - GROUP_ACTION_MENU_WIDTH / 2, GROUP_ACTION_MENU_MARGIN),
    maxLeft,
  );
  /** maxTop 保证完整菜单不越过底部视口。 */
  const maxTop = Math.max(
    GROUP_ACTION_MENU_MARGIN,
    options.viewportHeight - menuHeight - GROUP_ACTION_MENU_MARGIN,
  );
  /** aboveTop 是菜单置于长按点上方的候选位置。 */
  const aboveTop = options.point.y - menuHeight - GROUP_ACTION_MENU_GAP;
  /** placement 在上方空间不足时翻转到下方。 */
  const placement = aboveTop >= GROUP_ACTION_MENU_MARGIN ? 'above' : 'below';
  /** rawTop 保存翻转后的未约束位置。 */
  const rawTop = placement === 'above'
    ? aboveTop
    : options.point.y + GROUP_ACTION_MENU_GAP;
  /** top 将最终位置限制在可见视口。 */
  const top = Math.min(Math.max(rawTop, GROUP_ACTION_MENU_MARGIN), maxTop);
  return { group: options.group, top, left, placement, actions };
}

/** 构造群资料页路由，并可直达原有群名称编辑层。 */
export function buildJoinedGroupProfileRoute(
  conversationID: string,
  editName = false,
): string {
  /** normalizedConversationID 阻止空身份生成不可恢复路由。 */
  const normalizedConversationID = conversationID.trim();
  if (!normalizedConversationID) throw new Error('群资料需要会话 ID');
  /** baseURL 只携带 canonical Conversation 身份。 */
  const baseURL = `/conversations/${encodeURIComponent(normalizedConversationID)}/settings/profile`;
  return editName ? `${baseURL}?edit=name` : baseURL;
}
