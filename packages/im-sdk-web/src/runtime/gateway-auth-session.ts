import type { GatewayAuthData } from '@im28/im-sdk/web';

import type { WebIMAuthSession } from './auth-session-store.js';
import { WebIMRuntimeError } from './runtime-error.js';

/** 从 Gateway auth DTO 提取并验证 Web runtime 最小会话。 */
export function normalizeGatewayAuthSession(
  authData: GatewayAuthData,
  fallbackUserID = '',
): WebIMAuthSession {
  // access token 是所有后续 Gateway channel 的 Bearer 凭据。
  const accessToken = authData.token?.access_token?.trim() ?? '';
  // user ID 按 user、token subject、已验证 fallback 的顺序解析。
  const userID =
    authData.user?.user_id?.trim() ||
    authData.token?.subject_id?.trim() ||
    fallbackUserID.trim();
  if (!accessToken || !userID) {
    throw new WebIMRuntimeError(
      'INVALID_AUTH_RESPONSE',
      'Gateway auth response is missing user or access token.',
    );
  }
  // 空 refresh token 必须省略，满足 exact-optional session contract。
  const refreshToken = authData.token?.refresh_token?.trim();
  return {
    userID,
    accessToken,
    ...(refreshToken ? { refreshToken } : {}),
  };
}
