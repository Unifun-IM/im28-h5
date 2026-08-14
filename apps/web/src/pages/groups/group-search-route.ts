import {
  readContactSearchBackHref,
  type ContactSearchBackHref,
} from '../contacts/contact-search-route.js';

/** 查找群聊页允许恢复的建群选择上下文。 */
export interface GroupSearchCreateState {
  readonly selectedUserIDs: readonly string[];
  readonly backHref: '/conversations' | '/contacts';
}

/** 群申请页允许的来源和返回上下文。 */
export interface GroupApplyRouteState {
  readonly sourceType: 'qrcode' | 'search';
  readonly backHref: '/scan' | '/groups/search' | '/contacts/search';
  readonly searchKeyword: string;
  readonly searchBackHref: ContactSearchBackHref;
  readonly createState: GroupSearchCreateState;
}

/** 群申请成功后允许恢复的搜索页 presentation state。 */
export interface GroupApplyReturnState extends GroupSearchCreateState {
  readonly searchKeyword: string;
  readonly serverTab?: 'groups';
  readonly searchBackHref?: ContactSearchBackHref;
}

/** 从未知 Router state 恢复稳定、去重且有界的用户 ID。 */
export function readGroupSearchCreateState(state: unknown): GroupSearchCreateState {
  /** fallback 深链进入时安全返回会话页且无选择。 */
  const fallback: GroupSearchCreateState = { selectedUserIDs: [], backHref: '/conversations' };
  if (!state || typeof state !== 'object') return fallback;
  /** rawIDs 只接受字符串数组，不信任外部 history state。 */
  const rawIDs = Reflect.get(state, 'selectedUserIDs');
  /** selectedUserIDs 最多保留 RN 群成员上限所需的 998 个稳定身份。 */
  const selectedUserIDs = Array.isArray(rawIDs)
    ? [...new Set(rawIDs.flatMap(value => typeof value === 'string' && value.trim() ? [value.trim()] : []))].slice(0, 998)
    : [];
  /** backHref 只允许两个建群入口。 */
  const backHref = Reflect.get(state, 'backHref') === '/contacts' ? '/contacts' : '/conversations';
  return { selectedUserIDs, backHref };
}

/** 从未知 state 读取群搜索关键词。 */
export function readGroupSearchKeyword(state: unknown): string {
  if (!state || typeof state !== 'object') return '';
  /** keyword 只用于恢复页面输入，限制异常 history state 大小。 */
  const keyword = Reflect.get(state, 'searchKeyword');
  return typeof keyword === 'string' ? keyword.trim().slice(0, 100) : '';
}

/** 读取群申请来源并拒绝任意返回地址。 */
export function readGroupApplyRouteState(state: unknown): GroupApplyRouteState {
  /** createState 复用建群选择上下文的严格读取。 */
  const createState = readGroupSearchCreateState(
    state && typeof state === 'object' ? Reflect.get(state, 'createState') : null,
  );
  if (!state || typeof state !== 'object' || Reflect.get(state, 'sourceType') !== 'search') {
    return {
      sourceType: 'qrcode',
      backHref: '/scan',
      searchKeyword: '',
      searchBackHref: '/contacts',
      createState,
    };
  }
  return {
    sourceType: 'search',
    backHref: Reflect.get(state, 'backHref') === '/contacts/search'
      ? '/contacts/search'
      : '/groups/search',
    searchKeyword: readGroupSearchKeyword(state),
    searchBackHref: readContactSearchBackHref(Reflect.get(state, 'searchBackHref')),
    createState,
  };
}

/** 为搜索来源构造成功返回 state，扫码来源不透传无意义上下文。 */
export function createGroupApplyReturnState(
  routeState: GroupApplyRouteState,
): GroupApplyReturnState | undefined {
  if (routeState.sourceType !== 'search') return undefined;
  return {
    ...routeState.createState,
    searchKeyword: routeState.searchKeyword,
    ...(routeState.backHref === '/contacts/search' ? {
      serverTab: 'groups' as const,
      searchBackHref: routeState.searchBackHref,
    } : {}),
  };
}
