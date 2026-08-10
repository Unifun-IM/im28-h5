import type { WebIMRegisterRequest } from '@im28/im-sdk/web';

/** Onboarding 来源决定刷新失败时返回哪个认证入口。 */
export type AuthOnboardingSourceMode = 'phone' | 'email' | 'account';

/** 注册成功后可持久化的最小账号级 onboarding 意图。 */
export interface AuthOnboardingMarker {
  readonly userID: string;
  readonly sourceMode: AuthOnboardingSourceMode;
}

/** 邀请码重试所需注册请求只允许驻留当前 React 树内存。 */
export interface AuthPendingRegistration {
  readonly sourceMode: Exclude<AuthOnboardingSourceMode, 'account'>;
  readonly request: WebIMRegisterRequest;
}

/** Marker store 只依赖浏览器 Storage 的最小同步端口。 */
export interface AuthOnboardingStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** 认证态 onboarding 路由守卫的纯判定输入。 */
export interface AuthOnboardingRouteInput {
  readonly stage: 'invite' | 'complete-profile';
  readonly userID: string | null;
  readonly marker: AuthOnboardingMarker | null;
  readonly pendingRegistration: AuthPendingRegistration | null;
  readonly sourceMode: AuthOnboardingSourceMode;
}

/** 路由守卫只返回允许渲染或 replace 目标。 */
export type AuthOnboardingRouteDecision =
  | { readonly allow: true }
  | { readonly allow: false; readonly redirectTo: string };

// Marker key 独立于 auth session，且值中禁止写入 token/contact/credential。
const AUTH_ONBOARDING_MARKER_KEY = 'im28.web.auth.onboarding';

/** 创建只持久化 userID/sourceMode 的账号级 marker store。 */
export function createAuthOnboardingMarkerStore(
  storage: AuthOnboardingStorage,
): {
  readonly read: () => AuthOnboardingMarker | null;
  readonly write: (marker: AuthOnboardingMarker) => void;
  readonly clear: () => void;
} {
  return {
    read: () => parseAuthOnboardingMarker(storage.getItem(AUTH_ONBOARDING_MARKER_KEY)),
    write: marker => {
      // normalizedMarker 丢弃 caller 可能附带的任何额外敏感字段。
      const normalizedMarker: AuthOnboardingMarker = {
        userID: marker.userID.trim(),
        sourceMode: marker.sourceMode,
      };
      if (!normalizedMarker.userID) throw new Error('Onboarding marker requires a user ID.');
      storage.setItem(AUTH_ONBOARDING_MARKER_KEY, JSON.stringify(normalizedMarker));
    },
    clear: () => storage.removeItem(AUTH_ONBOARDING_MARKER_KEY),
  };
}

/** 将损坏或越权字段的 marker 收敛为 null/最小安全结构。 */
function parseAuthOnboardingMarker(raw: string | null): AuthOnboardingMarker | null {
  if (!raw) return null;
  try {
    // candidate 只用于结构化 JSON 字段校验。
    const candidate = JSON.parse(raw) as Record<string, unknown>;
    // userID 是 marker 与当前认证账号绑定的唯一标识。
    const userID = typeof candidate.userID === 'string' ? candidate.userID.trim() : '';
    // sourceMode 必须来自冻结的三个认证入口。
    const sourceMode = candidate.sourceMode;
    if (!userID || !isAuthOnboardingSourceMode(sourceMode)) return null;
    return { userID, sourceMode };
  } catch {
    return null;
  }
}

/** 判断未知值是否为可恢复的认证入口。 */
function isAuthOnboardingSourceMode(value: unknown): value is AuthOnboardingSourceMode {
  return value === 'phone' || value === 'email' || value === 'account';
}

/** 把非敏感 source query 收敛为稳定登录返回路径。 */
export function getAuthOnboardingSourceRoute(sourceMode: AuthOnboardingSourceMode): string {
  return sourceMode === 'account' ? '/auth/account' : `/auth/${sourceMode}`;
}

/** 对邀请和完善资料路由执行匿名、丢失 pending 与账号错配守卫。 */
export function resolveAuthOnboardingRoute(
  input: AuthOnboardingRouteInput,
): AuthOnboardingRouteDecision {
  if (input.stage === 'invite') {
    if (input.userID) {
      return input.marker?.userID === input.userID
        ? { allow: false, redirectTo: '/auth/complete-profile' }
        : { allow: false, redirectTo: '/conversations' };
    }
    return input.pendingRegistration
      ? { allow: true }
      : { allow: false, redirectTo: getAuthOnboardingSourceRoute(input.sourceMode) };
  }
  if (!input.userID) return { allow: false, redirectTo: '/auth/phone' };
  return input.marker?.userID === input.userID
    ? { allow: true }
    : { allow: false, redirectTo: '/conversations' };
}
