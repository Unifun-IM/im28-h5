import { type GatewayAuthData, type GatewayHTTPClient } from '@im28/im-sdk/core';
import type { WebIMAccountDatabaseLifecycle } from '../storage/index.js';
import type { WebIMAuthSession, WebIMAuthSessionStore } from './auth-session-store.js';
/** 登录和注册成功后建立浏览器认证会话所需端口。 */
interface EstablishWebIMAuthSessionOptions {
    readonly requestAuthData: () => Promise<GatewayAuthData>;
    readonly accountDatabase: WebIMAccountDatabaseLifecycle;
    readonly authSessionStore: WebIMAuthSessionStore;
    readonly afterDatabaseOpen?: (session: WebIMAuthSession) => Promise<void>;
}
/** 将共享 Gateway 原始业务码收敛为页面可消费的认证判断。 */
export declare function isWebIMUnregisteredAccountError(cause: unknown): boolean;
/** 将 Gateway auth data 收敛为已打开账号库的持久会话。 */
export declare function establishWebIMAuthSession(options: EstablishWebIMAuthSessionOptions): Promise<WebIMAuthSession>;
/** 刷新服务端已判定失效的 access token 并保留原 userID。 */
export declare function refreshWebIMAuthSession(session: WebIMAuthSession, gatewayClient: GatewayHTTPClient, deviceID: string, authSessionStore: WebIMAuthSessionStore): Promise<WebIMAuthSession | null>;
export {};
//# sourceMappingURL=web-im-authentication.d.ts.map