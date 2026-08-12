import { createGatewayHTTPClient, createGatewayRealtimeClient } from '@im28/im-sdk/core';
import { createWebIMSync } from '../sync/web-im-sync.js';
import { establishWebIMAuthSession, refreshWebIMAuthSession } from './web-im-authentication.js';
import { createWebIMPlatformTermsClient } from './platform-terms-client.js';
import { WebIMRuntimeError } from './runtime-error.js';
import { transitionWebIMRuntimeState } from './runtime-lifecycle.js';
import { createWebIMUserSettings } from './web-im-user-settings.js';
import { createWebIMClientVersion } from './web-im-client-version.js';
import { createBrowserOSSUploadPort } from '../media/index.js';
import { normalizeIMCallTerminalSignals } from '../../../sync/call-terminal-signal.js';
import { normalizeIMCallRealtimeSignals } from '../../../sync/call-realtime-signal.js';
import { createIMIncomingCallLifecycleState, dismissIMIncomingCall, reconcileIMPendingIncomingCall, reduceIMIncomingCallSignals, resetIMIncomingCallLifecycleState, } from '../../../sync/incoming-call-lifecycle.js';
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
    callSignalListeners = new Set();
    currentState = 'anonymous';
    currentSession = null;
    currentSnapshot;
    dataVersion = 0;
    realtimeClient = null;
    unsubscribeRealtime = null;
    hasRealtimeConnected = false;
    incomingCallState = createIMIncomingCallLifecycleState();
    pendingCallRefresh = null;
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
            ...(options.createRequestID
                ? { createClientMessageID: options.createRequestID }
                : {}),
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
        this.pendingCallRefresh = null;
        this.incomingCallState = resetIMIncomingCallLifecycleState(this.incomingCallState);
        this.options.authSessionStore.clear();
        this.applyLifecycleEvent('auth_started');
        try {
            // session 仅在 auth data 与账号 SQLite 均有效后返回。
            const session = await establishWebIMAuthSession({
                requestAuthData,
                accountDatabase: this.options.accountDatabase,
                authSessionStore: this.options.authSessionStore,
                afterDatabaseOpen: async (session) => { this.currentSession = session; await this.sync.messages.recoverInterruptedSends(); },
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
        this.scheduleIncomingCallRefresh();
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
            await this.sync.messages.recoverInterruptedSends();
        }
        catch (cause) {
            this.currentSession = null;
            await this.options.accountDatabase.close();
            throw cause;
        }
        this.applyLifecycleEvent('auth_restored');
        this.connectRealtime();
        this.scheduleIncomingCallRefresh();
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
    /** 从 Gateway 恢复当前账号待接来电，失败由调用方或后台 reporter 显式处理。 */
    async refreshIncomingCall() {
        /** session 固定本轮查询所属账号，防止响应串入切换后的账号。 */
        const session = this.currentSession;
        if (!session)
            return;
        if (this.pendingCallRefresh?.userID === session.userID) {
            return this.pendingCallRefresh.promise;
        }
        /** refreshPromise 保证连接与前台恢复并发时只发一个 pending 请求。 */
        /** startRevision 防止慢 pending 空结果清除请求期间新到的 WS 邀请。 */
        const startRevision = this.incomingCallState.snapshot.revision;
        const refreshPromise = this.sync.calls.getPending().then(pending => {
            if (this.currentSession?.userID !== session.userID)
                return;
            if (this.incomingCallState.snapshot.revision !== startRevision)
                return;
            /** nextState 复用共享 pending 判定，不在 Web runtime 复制 RN 规则。 */
            const nextState = reconcileIMPendingIncomingCall(this.incomingCallState, pending, session.userID);
            this.replaceIncomingCallState(nextState);
        });
        /** refreshOwner 把 in-flight 请求绑定到发起时账号。 */
        const refreshOwner = { userID: session.userID, promise: refreshPromise };
        this.pendingCallRefresh = refreshOwner;
        try {
            await refreshPromise;
        }
        finally {
            if (this.pendingCallRefresh === refreshOwner) {
                this.pendingCallRefresh = null;
            }
        }
    }
    /** 收起已由当前 Web UI 接听或拒绝的来电快照。 */
    dismissIncomingCall(callID) {
        this.replaceIncomingCallState(dismissIMIncomingCall(this.incomingCallState, callID));
    }
    /** 订阅已由 shared parser 归一化的 RTC 过程信令，不暴露 transport 包装。 */
    subscribeCallSignals(listener) {
        this.callSignalListeners.add(listener);
        return () => this.callSignalListeners.delete(listener);
    }
    /** 订阅 runtime snapshot 变化。 */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    /** 释放 socket 与监听器但保留可恢复的 tab session。 */
    dispose() {
        this.stopRealtime();
        this.listeners.clear();
        this.callSignalListeners.clear();
    }
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
        this.hasRealtimeConnected = false;
        this.unsubscribeRealtime = nextClient.onEvent(event => this.handleRealtimeEvent(event));
        this.applyLifecycleEvent('realtime_connecting');
        nextClient.connect();
    }
    /** 把共享 realtime event 映射为本地 lifecycle event。 */
    handleRealtimeEvent(event) {
        if (event.type === 'connected') {
            /** isReconnect 区分首连与同一 client 的断线恢复，避免首连重复查 pending。 */
            const isReconnect = this.hasRealtimeConnected;
            this.hasRealtimeConnected = true;
            this.applyLifecycleEvent('realtime_connected');
            if (isReconnect)
                this.scheduleIncomingCallRefresh();
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
            // callback 无法 await，普通消息和通话记录失败必须经显式 reporter 暴露。
            void this.convergeRealtimeData(event, eventUserID)
                .catch(cause => this.options.reportBackgroundError(cause));
            return;
        }
        if (event.type === 'token_expired' || event.type === 'kicked') {
            this.stopRealtime();
            this.currentSession = null;
            this.incomingCallState = resetIMIncomingCallLifecycleState(this.incomingCallState);
            this.options.authSessionStore.clear();
            this.applyLifecycleEvent(event.type === 'token_expired' ? 'token_expired' : 'signed_out');
            // SDK event callback 无法 await，失败必须经显式 reporter 暴露。
            void this.options.accountDatabase
                .close()
                .catch(cause => this.options.reportBackgroundError(cause));
        }
    }
    /** 独立推进消息与通话记录收敛，并为同一 frame 只发布一次数据版本。 */
    async convergeRealtimeData(event, eventUserID) {
        /** processSignals 按原始 frame 顺序驱动不落库的来电生命周期。 */
        const processSignals = normalizeIMCallRealtimeSignals(event.raw ?? event.data);
        if (eventUserID && this.currentSession?.userID === eventUserID) {
            /** nextIncomingState 同时执行事件 ID 去重和终态乱序保护。 */
            const nextIncomingState = reduceIMIncomingCallSignals(this.incomingCallState, processSignals, eventUserID);
            this.replaceIncomingCallState(nextIncomingState);
            if (processSignals.length) {
                for (const listener of this.callSignalListeners) {
                    try {
                        listener(processSignals);
                    }
                    catch (cause) {
                        this.options.reportBackgroundError(cause);
                    }
                }
            }
        }
        /** callSignals 只解析共享协议，不依赖消息能否进入 conversation cache。 */
        const callSignals = normalizeIMCallTerminalSignals(event.data ?? event.raw);
        /** results 允许其中一条持久化链失败后另一条仍完成。 */
        const results = await Promise.allSettled([
            this.sync.realtime.handle(event),
            callSignals.length
                ? this.sync.calls.convergeTerminalSignals(callSignals).then(calls => calls.length > 0)
                : Promise.resolve(false),
        ]);
        /** changed 聚合两条链的真实缓存变化。 */
        const changed = results.some(result => result.status === 'fulfilled' && result.value);
        if (changed && this.currentSession?.userID === eventUserID) {
            this.publishDataChange();
        }
        /** failures 在成功链发布后统一暴露，不把失败吞成成功。 */
        const failures = results
            .filter((result) => result.status === 'rejected')
            .map(result => result.reason);
        if (failures.length === 1)
            throw failures[0];
        if (failures.length > 1) {
            throw new AggregateError(failures, 'Web IM realtime convergence failed.');
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
        this.hasRealtimeConnected = false;
    }
    /** 清除已被服务端判定无效的本地认证会话。 */
    clearLocalSession() {
        this.stopRealtime();
        this.currentSession = null;
        this.incomingCallState = resetIMIncomingCallLifecycleState(this.incomingCallState);
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
        this.incomingCallState = resetIMIncomingCallLifecycleState(this.incomingCallState);
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
    /** 后台恢复 pending 失败不改变认证成功状态。 */
    scheduleIncomingCallRefresh() {
        void this.refreshIncomingCall()
            .catch(cause => this.options.reportBackgroundError(cause));
    }
    /** 仅在公开来电 revision 变化时发布 runtime snapshot。 */
    replaceIncomingCallState(nextState) {
        /** changed 只比较公开 revision，内部去重集合变化不触发页面重绘。 */
        const changed = nextState.snapshot.revision !== this.incomingCallState.snapshot.revision;
        this.incomingCallState = nextState;
        if (!changed)
            return;
        this.currentSnapshot = this.createSnapshot();
        for (const listener of this.listeners)
            listener();
    }
    /** 创建不包含 token 的 runtime snapshot。 */
    createSnapshot() {
        return {
            state: this.currentState,
            userID: this.currentSession?.userID ?? null,
            dataVersion: this.dataVersion,
            incomingCall: this.incomingCallState.snapshot,
        };
    }
}
//# sourceMappingURL=web-im-runtime.js.map