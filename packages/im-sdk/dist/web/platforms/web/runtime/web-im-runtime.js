import { createGatewayHTTPClient, createGatewayRealtimeClient } from '@im28/im-sdk/core';
import { createWebIMSync } from '../../../sync/index.js';
import { establishWebIMAuthSession, refreshWebIMAuthSession } from './web-im-authentication.js';
import { createWebIMPlatformTermsClient } from './platform-terms-client.js';
import { WebIMRuntimeError } from './runtime-error.js';
import { transitionWebIMRuntimeState } from './runtime-lifecycle.js';
import { createWebIMUserSettings } from './web-im-user-settings.js';
import { createWebIMClientVersion } from './web-im-client-version.js';
import { createBrowserOSSUploadPort } from '../media/index.js';
/** 创建复用共享 Gateway HTTP/WebSocket clients 的浏览器 runtime。 */
export function createWebIMRuntime(options) { return new WebIMRuntimeImpl(options); }
/** Web runtime 实例显式持有 auth/realtime 状态和浏览器端口。 */
class WebIMRuntimeImpl {
    options;
    deviceID;
    gatewayClient;
    platformTermsClient;
    sync;
    settings;
    clientVersion;
    listeners = new Set();
    currentState = 'anonymous';
    currentSession = null;
    currentSnapshot;
    dataVersion = 0;
    realtimeClient = null;
    unsubscribeRealtime = null;
    /** 初始化稳定 device ID、HTTP client 和匿名 snapshot。 */
    constructor(options) {
        this.options = options;
        this.deviceID = options.deviceIdentityStore.getOrCreate();
        this.currentSnapshot = this.createSnapshot();
        this.gatewayClient = createGatewayHTTPClient({
            baseURL: options.config.gatewayHTTPURL,
            fetch: options.fetch,
            getAccessToken: () => this.currentSession?.accessToken,
            language: options.config.language,
            ...(options.createRequestID ? { createRequestID: options.createRequestID } : {}),
        });
        this.platformTermsClient = createWebIMPlatformTermsClient({
            gatewayHTTPURL: options.config.gatewayHTTPURL,
            language: options.config.language,
            fetch: options.fetch,
            ...(options.createRequestID ? { createRequestID: options.createRequestID } : {}),
        });
        this.sync = createWebIMSync({
            gatewayClient: this.gatewayClient,
            mediaUploadPort: createBrowserOSSUploadPort({ gatewayClient: this.gatewayClient }),
            accountDatabase: this.options.accountDatabase,
            getCurrentUserID: () => this.currentSession?.userID ?? null,
        });
        this.settings = createWebIMUserSettings({ gatewayClient: this.gatewayClient, getCurrentUserID: () => this.currentSession?.userID ?? null });
        this.clientVersion = createWebIMClientVersion({
            gatewayClient: this.gatewayClient,
            appVersion: options.config.appVersion,
            ...(options.config.appBuildNumber
                ? { appBuildNumber: options.config.appBuildNumber }
                : {}),
        });
    }
    /** 使用 Gateway 登录，完整会话验证通过后启动 realtime。 */
    async login(request) {
        return this.authenticate(() => this.gatewayClient.login({ ...request, device_id: this.deviceID }));
    }
    /** 使用 Gateway 注册，并复用登录后的会话、数据库和 realtime 收敛链。 */
    async register(request) {
        return this.authenticate(() => this.gatewayClient.register({ ...request, device_id: this.deviceID }));
    }
    /** 首次设置账号密码成功后保留当前认证会话。 */
    async setAccountPassword(request) {
        this.requireAccountSecuritySession();
        await this.gatewayClient.setAccountPassword({
            account: request.account.trim(),
            password: request.password,
        });
    }
    /** 旧密码重置成功会撤销远端 session，并同步清除全部本地认证 owner。 */
    async resetPassword(request) {
        this.requireAccountSecuritySession();
        await this.gatewayClient.resetPassword(request);
        await this.invalidateLocalSession();
    }
    /** 将登录和注册返回的认证数据收敛为同一浏览器 runtime 状态。 */
    async authenticate(requestAuthData) {
        this.stopRealtime();
        this.currentSession = null;
        this.options.authSessionStore.clear();
        this.applyLifecycleEvent('auth_started');
        try {
            // session 仅在 auth data 与账号 SQLite 均有效后返回。
            const session = await establishWebIMAuthSession({
                requestAuthData,
                accountDatabase: this.options.accountDatabase,
                authSessionStore: this.options.authSessionStore,
            });
            this.currentSession = session;
            this.applyLifecycleEvent('auth_succeeded');
        }
        catch (cause) {
            this.currentSession = null;
            this.applyLifecycleEvent('auth_failed');
            throw cause;
        }
        this.connectRealtime();
        return this.currentSnapshot;
    }
    /** 查询公开平台条款，不要求建立认证会话。 */
    async getPlatformTerm(key) { return this.platformTermsClient.getTerm(key); }
    /** 恢复 tab 会话，先 check-token，明确无效时再 refresh。 */
    async restore() {
        // Store 会对损坏记录清理并抛错，不伪装成未登录。
        const storedSession = this.options.authSessionStore.load();
        if (!storedSession) {
            return false;
        }
        this.currentSession = storedSession;
        try {
            const checked = await this.gatewayClient.checkToken({
                access_token: storedSession.accessToken,
            });
            if (checked.valid === false) {
                // Refresh 只处理服务端已明确判定无效的 access token。
                const refreshedSession = await this.refreshInvalidSession(storedSession);
                if (!refreshedSession) {
                    this.clearLocalSession();
                    return false;
                }
                this.currentSession = refreshedSession;
            }
            // 恢复 realtime 前先恢复当前账号的 SQLite owner。
            await this.options.accountDatabase.open(this.currentSession.userID);
        }
        catch (cause) {
            this.currentSession = null;
            throw cause;
        }
        this.applyLifecycleEvent('auth_restored');
        this.connectRealtime();
        return true;
    }
    /** 远端 logout 失败时仍关闭 socket 并清除本地凭据。 */
    async signOut() {
        // 未 restore 的 runtime 仍可尝试退出已保存的 tab session。
        let session = this.currentSession;
        try {
            session ??= this.options.authSessionStore.load();
            if (session) {
                try {
                    await this.gatewayClient.logout({ access_token: session.accessToken });
                }
                catch {
                    // 远端不可用不能阻止用户清除本地凭据与实时连接。
                }
            }
        }
        finally {
            await this.invalidateLocalSession();
        }
    }
    /** 返回 useSyncExternalStore 可消费的稳定 snapshot。 */
    getSnapshot() { return this.currentSnapshot; }
    /** 返回动态绑定当前 auth/account DB owner 的唯一同步入口。 */
    getSync() { return this.sync; }
    /** 返回动态绑定当前认证会话的唯一用户设置入口。 */
    getSettings() { return this.settings; }
    /** 返回不依赖认证状态的 Web 客户端版本检查入口。 */
    getClientVersion() { return this.clientVersion; }
    /** 订阅 runtime snapshot 变化。 */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    /** 释放 socket 与监听器但保留可恢复的 tab session。 */
    dispose() { this.stopRealtime(); this.listeners.clear(); }
    /** 创建并连接与当前认证会话绑定的唯一 realtime client。 */
    connectRealtime() {
        if (!this.currentSession) {
            throw new WebIMRuntimeError('INVALID_LIFECYCLE_TRANSITION', 'Cannot connect realtime without an auth session.');
        }
        this.stopRealtime();
        // Client 构造先于状态转换，构造失败时保留 authenticated 状态。
        const nextClient = createGatewayRealtimeClient({
            url: this.options.config.gatewayWebSocketURL,
            WebSocket: this.options.WebSocket,
            userID: this.currentSession.userID,
            token: this.currentSession.accessToken,
            platformID: this.options.config.platformID,
            deviceID: this.deviceID,
        });
        this.realtimeClient = nextClient;
        this.unsubscribeRealtime = nextClient.onEvent(event => this.handleRealtimeEvent(event));
        this.applyLifecycleEvent('realtime_connecting');
        nextClient.connect();
    }
    /** 把共享 realtime event 映射为本地 lifecycle event。 */
    handleRealtimeEvent(event) {
        if (event.type === 'connected') {
            this.applyLifecycleEvent('realtime_connected');
            return;
        }
        if (event.type === 'disconnected') {
            this.markRealtimeDisconnected();
            return;
        }
        if (event.type === 'reconnecting') {
            this.markRealtimeDisconnected();
            if (this.currentState === 'reconnecting') {
                this.applyLifecycleEvent('realtime_connecting');
            }
            return;
        }
        if (event.type === 'message' || event.type === 'conversation' || event.type === 'message.update') {
            // eventUserID 阻止旧账号队列完成后发布新账号的数据版本。
            const eventUserID = this.currentSession?.userID;
            // callback 无法 await，队列失败必须经显式 reporter 暴露。
            void this.sync.realtime
                .handle(event)
                .then(changed => {
                if (changed && this.currentSession?.userID === eventUserID) {
                    this.publishDataChange();
                }
            })
                .catch(cause => this.options.reportBackgroundError(cause));
            return;
        }
        if (event.type === 'token_expired' || event.type === 'kicked') {
            this.stopRealtime();
            this.currentSession = null;
            this.options.authSessionStore.clear();
            this.applyLifecycleEvent(event.type === 'token_expired' ? 'token_expired' : 'signed_out');
            // SDK event callback 无法 await，失败必须经显式 reporter 暴露。
            void this.options.accountDatabase
                .close()
                .catch(cause => this.options.reportBackgroundError(cause));
        }
    }
    /** 将连接中/在线状态统一标记为等待共享 client 重连。 */
    markRealtimeDisconnected() {
        if (this.currentState === 'connecting' || this.currentState === 'online')
            this.applyLifecycleEvent('realtime_disconnected');
    }
    /** 刷新服务端已判定失效的 access token。 */
    async refreshInvalidSession(session) {
        return refreshWebIMAuthSession(session, this.gatewayClient, this.deviceID, this.options.authSessionStore);
    }
    /** 关闭 realtime client 和事件订阅，不修改认证会话。 */
    stopRealtime() {
        this.unsubscribeRealtime?.();
        this.unsubscribeRealtime = null;
        this.realtimeClient?.close();
        this.realtimeClient = null;
    }
    /** 清除已被服务端判定无效的本地认证会话。 */
    clearLocalSession() {
        this.stopRealtime();
        this.currentSession = null;
        this.options.authSessionStore.clear();
    }
    /** 拒绝未 restore 的 tab 直接执行账号安全 mutation。 */
    requireAccountSecuritySession() {
        if (!this.currentSession) {
            throw new WebIMRuntimeError('ACCOUNT_SECURITY_AUTH_REQUIRED', 'Account security requires an authenticated Web IM session.');
        }
    }
    /** 清除本地认证、realtime 与账号数据库，不额外请求远端 logout。 */
    async invalidateLocalSession() {
        this.stopRealtime();
        this.currentSession = null;
        this.options.authSessionStore.clear();
        this.applyLifecycleEvent('signed_out');
        await this.options.accountDatabase.close();
    }
    /** 通过唯一状态机应用事件并发布 snapshot。 */
    applyLifecycleEvent(event) {
        this.currentState = transitionWebIMRuntimeState(this.currentState, event);
        this.currentSnapshot = this.createSnapshot();
        for (const listener of this.listeners) {
            listener();
        }
    }
    /** 发布一次无凭据数据版本变化，驱动页面重读 SQLite。 */
    publishDataChange() {
        this.dataVersion += 1;
        this.currentSnapshot = this.createSnapshot();
        for (const listener of this.listeners)
            listener();
    }
    /** 创建不包含 token 的 runtime snapshot。 */
    createSnapshot() {
        return { state: this.currentState, userID: this.currentSession?.userID ?? null, dataVersion: this.dataVersion };
    }
}
//# sourceMappingURL=web-im-runtime.js.map