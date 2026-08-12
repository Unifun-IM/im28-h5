import { IMError } from '@im28/im-sdk/core';
import { normalizeGatewayAuthSession } from './gateway-auth-session.js';
/** Gateway 业务码：认证账号尚未注册。 */
const UNREGISTERED_ACCOUNT_CODE = 20002;
/** 将共享 Gateway 原始业务码收敛为页面可消费的认证判断。 */
export function isWebIMUnregisteredAccountError(cause) {
    if (!(cause instanceof IMError) || !cause.rawCause || typeof cause.rawCause !== 'object') {
        return false;
    }
    // gatewayCode 只在 SDK facade 内读取，不向页面泄漏原始信封结构。
    const gatewayCode = cause.rawCause.code;
    return gatewayCode === UNREGISTERED_ACCOUNT_CODE;
}
/** 将 Gateway auth data 收敛为已打开账号库的持久会话。 */
export async function establishWebIMAuthSession(options) {
    // authData 只来自共享 Gateway login/register client。
    const authData = await options.requestAuthData();
    // session 必须通过完整 token/userID 校验。
    const session = normalizeGatewayAuthSession(authData);
    await options.accountDatabase.open(session.userID);
    try {
        // hook 在凭据落盘和 realtime 前完成账号库恢复任务。
        await options.afterDatabaseOpen?.(session);
        options.authSessionStore.save(session);
        return session;
    }
    catch (cause) {
        // 认证事务失败时释放已打开账号库，不保留半初始化 owner。
        await options.accountDatabase.close();
        throw cause;
    }
}
/** 刷新服务端已判定失效的 access token 并保留原 userID。 */
export async function refreshWebIMAuthSession(session, gatewayClient, authSessionStore) {
    if (!session.refreshToken)
        return null;
    // authData 复用共享 Gateway refresh operation。
    const authData = await gatewayClient.refreshToken({
        refresh_token: session.refreshToken,
    });
    // refreshedSession 允许 Gateway 不重复返回已验证 user。
    const refreshedSession = normalizeGatewayAuthSession(authData, session.userID);
    authSessionStore.save(refreshedSession);
    return refreshedSession;
}
//# sourceMappingURL=web-im-authentication.js.map