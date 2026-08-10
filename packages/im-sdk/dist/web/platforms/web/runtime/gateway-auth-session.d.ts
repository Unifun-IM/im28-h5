import type { GatewayAuthData } from '@im28/im-sdk/core';
import type { WebIMAuthSession } from './auth-session-store.js';
/** 从 Gateway auth DTO 提取并验证 Web runtime 最小会话。 */
export declare function normalizeGatewayAuthSession(authData: GatewayAuthData, fallbackUserID?: string): WebIMAuthSession;
//# sourceMappingURL=gateway-auth-session.d.ts.map