import type {
  WebIMPeerProfile,
  WebIMPeerProfileRelationship,
} from '@im28/im-sdk/web';

/** 联系人资料页主操作。 */
export type ContactProfilePrimaryAction = 'message' | 'add-friend' | null;

/** 联系人资料导航栏中心状态。 */
export type ContactProfileNavbarState =
  | { readonly kind: 'blacklist' }
  | { readonly kind: 'presence'; readonly online: boolean }
  | { readonly kind: 'none' };

/** 群成员资料上下文的异步校验状态。 */
export type ContactProfileGroupContextStatus = 'absent' | 'loading' | 'ready' | 'error';

/** 群成员资料页只消费已校验的群展示事实。 */
export interface ContactProfileGroupContextView {
  readonly status: ContactProfileGroupContextStatus;
  readonly displayName: string;
  readonly allowMemberAddFriend?: boolean;
}

/** 群成员资料限制投影同时控制动作和可见说明。 */
export interface ContactProfileGroupPresentation {
  readonly restricted: boolean;
  readonly notice: string;
}

/** 对齐 RN 黑名单优先、好友 presence 次之的导航栏投影。 */
export function getContactProfileNavbarState(
  relationship: WebIMPeerProfileRelationship | null,
  blockedByMe: boolean,
  peerOnline: boolean | null,
): ContactProfileNavbarState {
  if (blockedByMe) return { kind: 'blacklist' };
  if (relationship === 'friend' && peerOnline !== null) {
    return { kind: 'presence', online: peerOnline };
  }
  return { kind: 'none' };
}

/** 按关系状态选择唯一可用主操作。 */
export function getContactProfilePrimaryAction(
  relationship: WebIMPeerProfileRelationship,
): ContactProfilePrimaryAction {
  if (relationship === 'friend') return 'message';
  if (relationship === 'stranger') return 'add-friend';
  return null;
}

/** 校验完成前 fail-closed，避免群限制读取期间短暂暴露关系动作。 */
export function getContactProfileGroupPresentation(
  relationship: WebIMPeerProfileRelationship,
  context: ContactProfileGroupContextView,
): ContactProfileGroupPresentation {
  if (relationship === 'self' || context.status === 'absent') {
    return { restricted: false, notice: '' };
  }
  if (context.status === 'loading') {
    return { restricted: true, notice: '' };
  }
  if (context.status === 'error') {
    return { restricted: true, notice: '群成员资料暂不可用' };
  }
  if (context.allowMemberAddFriend === false) {
    return { restricted: true, notice: '已是群成员' };
  }
  return { restricted: false, notice: '' };
}

/** 将 Gateway 性别值转换为 RN 可见标签。 */
export function getContactProfileGenderLabel(
  gender: WebIMPeerProfile['gender'],
): string {
  if (gender === 1) return '男';
  if (gender === 2) return '女';
  return '';
}

/** 将好友添加时间格式化为稳定日期，异常值保留原文。 */
export function formatContactProfileAddedAt(value: string): string {
  // normalizedValue 避免空白时间生成 Invalid Date。
  const normalizedValue = value.trim();
  if (!normalizedValue) return '';
  // timestamp 只用于页面日期展示，不改变服务端真相。
  const timestamp = Date.parse(normalizedValue);
  if (!Number.isFinite(timestamp)) return normalizedValue;
  // date 使用本地时区对齐移动端可读日期。
  const date = new Date(timestamp);
  // month 和 day 固定两位，避免布局抖动。
  const month = String(date.getMonth() + 1).padStart(2, '0');
  // day 是本地日期中的日字段。
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** 为联系人资料生成编码后的 React Router 路由。 */
export function buildContactProfileRoute(userID: string): string {
  return `/contacts/users/${encodeURIComponent(userID.trim())}`;
}

/** 为好友申请生成独立全屏 React Router 路由。 */
export function buildContactFriendApplicationRoute(userID: string): string {
  return `${buildContactProfileRoute(userID)}/add`;
}

/** 兼容既有 view facade，实际 route-state owner 位于独立模块。 */
export {
  readContactProfileGroupConversationID,
  resolveContactProfileBackHref,
} from './contact-profile-route-state.js';
