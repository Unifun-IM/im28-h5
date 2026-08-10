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
export declare function createWebIMAuthSessionStore(storage: WebIMSessionStorage, storageKey?: string): WebIMAuthSessionStore;
//# sourceMappingURL=auth-session-store.d.ts.map