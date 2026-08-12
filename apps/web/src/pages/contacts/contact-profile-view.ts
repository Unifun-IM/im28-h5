import type {
  WebIMPeerProfile,
  WebIMPeerProfileRelationship,
} from '@im28/im-sdk/web';

/** 联系人资料页主操作。 */
export type ContactProfilePrimaryAction = 'message' | 'add-friend' | null;

/** 按关系状态选择唯一可用主操作。 */
export function getContactProfilePrimaryAction(
  relationship: WebIMPeerProfileRelationship,
): ContactProfilePrimaryAction {
  if (relationship === 'friend') return 'message';
  if (relationship === 'stranger') return 'add-friend';
  return null;
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

/** 只接受群成员或联系人域内的内部资料返回路由。 */
export function resolveContactProfileBackHref(state: unknown): string {
  if (!state || typeof state !== 'object') return '/contacts';
  /** backHref 从 Router state 读取，禁止外部 URL 和任意页面跳转。 */
  const backHref = Reflect.get(state, 'backHref');
  if (typeof backHref !== 'string') return '/contacts';
  /** normalizedHref 只保留明确的应用内群成员页或通讯录子页。 */
  const normalizedHref = backHref.trim();
  if (/^\/conversations\/[^/]+\/settings\/members$/.test(normalizedHref)) {
    return normalizedHref;
  }
  if (normalizedHref.startsWith('/contacts')) return normalizedHref;
  return '/contacts';
}
