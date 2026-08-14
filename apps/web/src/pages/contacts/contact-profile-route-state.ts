import {
  readContactSearchProfileReturnState,
  type ContactSearchRouteState,
} from './contact-search-view.js';
import type { ContactSearchBackHref } from './contact-search-route.js';

/** 资料及其子路由允许延续的最小 React Router state。 */
export interface ContactProfileChildRouteState {
  readonly backHref: string;
  readonly searchKeyword?: string;
  readonly serverTab?: ContactSearchRouteState['serverTab'];
  readonly searchBackHref?: ContactSearchBackHref;
  readonly groupConversationID?: string;
  readonly sourceType?: 'qrcode';
}

/** 只接受资料页已经登记的内部返回路由。 */
export function readContactProfileBackHref(state: unknown): string | null {
  if (!state || typeof state !== 'object') return null;
  /** value 必须是无 query/hash 的应用内绝对路径。 */
  const value = Reflect.get(state, 'backHref');
  if (typeof value !== 'string') return null;
  /** backHref 清理用户可修改的 history state 空白。 */
  const backHref = value.trim();
  if (backHref === '/scan') return backHref;
  if (
    backHref === '/contacts' ||
    backHref === '/contacts/search' ||
    backHref === '/contacts/verifications/friend'
  ) return backHref;
  if (/^\/conversations\/[^/?#]+(?:\/settings(?:\/members)?)?$/.test(backHref)) {
    return backHref;
  }
  return null;
}

/** 为资料进入好友申请子路由构造白名单来源上下文。 */
export function createContactProfileChildRouteState(
  state: unknown,
): ContactProfileChildRouteState | undefined {
  /** backHref 决定其余字段是否具备恢复意义。 */
  const backHref = readContactProfileBackHref(state);
  if (!backHref) return undefined;
  if (backHref === '/contacts/search') {
    /** searchState 复用联系人搜索唯一的长度和页签校验。 */
    const searchState = readContactSearchProfileReturnState(state);
    if (!searchState) return undefined;
    return { backHref, ...searchState };
  }
  if (backHref === '/scan') {
    /** sourceType 仅允许扫码入口已发布的 Gateway 来源码。 */
    const sourceType = Reflect.get(state as object, 'sourceType');
    return sourceType === 'qrcode' ? { backHref, sourceType } : { backHref };
  }
  if (backHref.startsWith('/conversations/')) {
    /** groupConversationID 只是后续 shared facade 校验的稳定候选。 */
    const groupConversationID = readContactProfileGroupConversationID(state);
    return groupConversationID ? { backHref, groupConversationID } : { backHref };
  }
  return { backHref };
}

/** 根据 Navbar 目标返回搜索 presentation 或完整资料来源 context。 */
export function getContactProfileHeaderBackState(
  backHref: string,
  state: unknown,
): ContactSearchRouteState | ContactProfileChildRouteState | undefined {
  if (backHref === '/contacts/search') {
    return readContactSearchProfileReturnState(state);
  }
  if (/^\/contacts\/users\/[^/?#]+$/.test(backHref)) {
    return createContactProfileChildRouteState(state);
  }
  return undefined;
}

/** 只从合法扫码 context 读取好友申请来源。 */
export function readContactProfileApplicationSourceType(
  state: unknown,
): 'qrcode' | null {
  /** routeState 先校验 backHref，防止孤立 sourceType 被信任。 */
  const routeState = createContactProfileChildRouteState(state);
  return routeState?.sourceType === 'qrcode' ? 'qrcode' : null;
}

/** 资料页缺少或拒绝 state 时回到通讯录。 */
export function resolveContactProfileBackHref(state: unknown): string {
  return readContactProfileBackHref(state) ?? '/contacts';
}

/** 只读取群成员入口提供的稳定会话身份候选。 */
export function readContactProfileGroupConversationID(state: unknown): string {
  if (!state || typeof state !== 'object') return '';
  /** value 只作为后续 shared facade 校验候选，不直接授予权限。 */
  const value = Reflect.get(state, 'groupConversationID');
  return typeof value === 'string' ? value.trim() : '';
}
