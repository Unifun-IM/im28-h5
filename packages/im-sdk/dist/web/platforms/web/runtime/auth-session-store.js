import { z } from 'zod';
import { WebIMRuntimeError } from './runtime-error.js';
// 版本化 key 允许未来 schema 迁移时显式处理旧会话。
const DEFAULT_AUTH_SESSION_KEY = 'im28.web.auth.session.v1';
// 凭据 schema 拒绝空 user/token，不允许把页面资料混入认证 owner。
const WEB_IM_AUTH_SESSION_SCHEMA = z.object({
    userID: z.string().trim().min(1),
    accessToken: z.string().trim().min(1),
    refreshToken: z.string().trim().min(1).optional(),
});
/** 创建 tab 级认证会话 store；生产调用方应注入 window.sessionStorage。 */
export function createWebIMAuthSessionStore(storage, storageKey = DEFAULT_AUTH_SESSION_KEY) {
    return {
        load: () => loadAuthSession(storage, storageKey),
        save: session => saveAuthSession(storage, storageKey, session),
        clear: () => storage.removeItem(storageKey),
    };
}
/** 读取并验证会话；损坏记录会被清除并显式抛错。 */
function loadAuthSession(storage, storageKey) {
    // null 明确表示当前 tab 没有登录会话。
    const rawSession = storage.getItem(storageKey);
    if (rawSession === null) {
        return null;
    }
    try {
        // JSON 与 Zod 双重校验避免污染 token 进入 runtime。
        const parsedSession = JSON.parse(rawSession);
        return parseAuthSession(parsedSession);
    }
    catch (cause) {
        storage.removeItem(storageKey);
        throw new WebIMRuntimeError('CORRUPT_AUTH_SESSION', 'Stored Web IM auth session is invalid.', cause);
    }
}
/** 校验完整会话后原子覆盖 tab 级凭据记录。 */
function saveAuthSession(storage, storageKey, session) {
    // 校验后的新对象防止额外页面字段被序列化进 token store。
    const validatedSession = parseAuthSession(session);
    storage.setItem(storageKey, JSON.stringify(validatedSession));
}
/** 将 Zod optional 输出归一为 exact-optional 公开会话类型。 */
function parseAuthSession(value) {
    // Schema 输出仍可能显式包含 undefined，返回对象主动省略该字段。
    const parsedSession = WEB_IM_AUTH_SESSION_SCHEMA.parse(value);
    return {
        userID: parsedSession.userID,
        accessToken: parsedSession.accessToken,
        ...(parsedSession.refreshToken
            ? { refreshToken: parsedSession.refreshToken }
            : {}),
    };
}
//# sourceMappingURL=auth-session-store.js.map