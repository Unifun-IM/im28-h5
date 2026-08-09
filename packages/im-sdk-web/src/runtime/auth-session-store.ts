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

/** H5 runtime 唯一持有的最小认证会话。 */
export interface WebIMAuthSession {
  readonly userID: string;
  readonly accessToken: string;
  readonly refreshToken?: string;
}

/** sessionStorage 的最小可注入端口，便于无浏览器环境测试。 */
export interface WebIMSessionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** 认证会话 store 只负责校验和持久化，不发起登录或刷新请求。 */
export interface WebIMAuthSessionStore {
  load(): WebIMAuthSession | null;
  save(session: WebIMAuthSession): void;
  clear(): void;
}

/** 创建 tab 级认证会话 store；生产调用方应注入 window.sessionStorage。 */
export function createWebIMAuthSessionStore(
  storage: WebIMSessionStorage,
  storageKey = DEFAULT_AUTH_SESSION_KEY,
): WebIMAuthSessionStore {
  return {
    load: () => loadAuthSession(storage, storageKey),
    save: session => saveAuthSession(storage, storageKey, session),
    clear: () => storage.removeItem(storageKey),
  };
}

/** 读取并验证会话；损坏记录会被清除并显式抛错。 */
function loadAuthSession(
  storage: WebIMSessionStorage,
  storageKey: string,
): WebIMAuthSession | null {
  // null 明确表示当前 tab 没有登录会话。
  const rawSession = storage.getItem(storageKey);
  if (rawSession === null) {
    return null;
  }
  try {
    // JSON 与 Zod 双重校验避免污染 token 进入 runtime。
    const parsedSession: unknown = JSON.parse(rawSession);
    return parseAuthSession(parsedSession);
  } catch (cause) {
    storage.removeItem(storageKey);
    throw new WebIMRuntimeError(
      'CORRUPT_AUTH_SESSION',
      'Stored Web IM auth session is invalid.',
      cause,
    );
  }
}

/** 校验完整会话后原子覆盖 tab 级凭据记录。 */
function saveAuthSession(
  storage: WebIMSessionStorage,
  storageKey: string,
  session: WebIMAuthSession,
): void {
  // 校验后的新对象防止额外页面字段被序列化进 token store。
  const validatedSession = parseAuthSession(session);
  storage.setItem(storageKey, JSON.stringify(validatedSession));
}

/** 将 Zod optional 输出归一为 exact-optional 公开会话类型。 */
function parseAuthSession(value: unknown): WebIMAuthSession {
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
