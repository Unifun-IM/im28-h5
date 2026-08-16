import { createGatewayHTTPClient, createGatewayRealtimeClient } from '@im28/im-sdk/core';
import { createWebIMSync } from '../sync/web-im-sync.js';
import { establishWebIMAuthSession, refreshWebIMAuthSession } from './web-im-authentication.js';
import { createWebIMPlatformTermsClient } from './platform-terms-client.js';
import { WebIMRuntimeError } from './runtime-error.js';
import { transitionWebIMRuntimeState } from './runtime-lifecycle.js';
import { createWebIMUserSettings } from './web-im-user-settings.js';
import { createWebIMClientVersion } from './web-im-client-version.js';
import { createWebIMOfflineReader } from './web-im-offline-reader.js';
import { createBrowserOSSUploadPort } from '../media/index.js';
import { createIMIncomingCallLifecycleState, dismissIMIncomingCall, normalizeIMCallRealtimeSignals, normalizeIMCallTerminalSignals, reconcileIMPendingIncomingCall, reduceIMIncomingCallSignals, resetIMIncomingCallLifecycleState, } from '../../../sync/call/index.js';
import { isIMRelationshipRealtimeEvent, isIMVerificationRealtimeEvent, } from '../../../sync/contact/index.js';
/** 创建复用共享 Gateway HTTP/WebSocket clients 的浏览器 runtime。 */
export function createWebIMRuntime(options) { return new WebIMRuntimeImpl(options); }
/** Web runtime 实例显式持有 auth/realtime 状态和浏览器端口。 */
class WebIMRuntimeImpl {
    options;
    deviceID;
    gatewayClient;
    platformTermsClient;
    sync;
    offlineReader;
    settings;
    clientVersion;
    listeners = new Set();
    callSignalListeners = new Set();
    currentState = 'anonymous';
    currentSession = null;
    offlineReaderEnabled = false;
    // pendingRestore 保证 React StrictMode 或重复启动只执行一次会话恢复与数据库打开。
    pendingRestore = null;
    pendingOfflineReconnect = null;
    // offlineReconnectVersion 使退出或新认证能够撤销仍在等待的离线重连结果。
    offlineReconnectVersion = 0;
    currentSnapshot;
    dataVersion = 0;
    /** relationshipVersion 只标记好友与我方黑名单领域事实可能变化。 */
    relationshipVersion = 0;
    /** verificationVersion 只标记好友与群验证计数可能变化。 */
    verificationVersion = 0;
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
            getDeviceID: () => this.deviceID,
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
            reportBackgroundError: options.reportBackgroundError,
            ...(options.createRequestID
                ? { createClientMessageID: options.createRequestID }
                : {}),
        });
        this.offlineReader = createWebIMOfflineReader({
            getContext: () => {
                if (!this.offlineReaderEnabled ||
                    !this.currentSession ||
                    (this.currentState !== 'offline-readonly' &&
                        this.currentState !== 'offline-validating')) {
                    return null;
                }
                // database 由 lifecycle 持有同账号 Web Lock，关闭或升级后立即变为 null。
                const database = this.options.accountDatabase.getDatabase();
                return database
                    ? { userID: this.currentSession.userID, database }
                    : null;
            },
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
        return this.authenticate(() => this.gatewayClient.login(request));
    }
    /** 使用 Gateway 注册，并复用登录后的会话、数据库和 realtime 收敛链。 */
    async register(request) {
        return this.authenticate(() => this.gatewayClient.register(request));
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
        this.offlineReconnectVersion += 1;
        this.stopRealtime();
        this.sync.presence.clear();
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
    restore() {
        if (this.pendingRestore) {
            return this.pendingRestore;
        }
        // restorePromise 是当前 runtime 唯一允许的冷启动恢复任务。
        const restorePromise = this.restoreStoredSession();
        this.pendingRestore = restorePromise;
        return restorePromise.finally(() => {
            if (this.pendingRestore === restorePromise) {
                this.pendingRestore = null;
            }
        });
    }
    /** 执行一次 tab 会话校验与账号数据库恢复。 */
    async restoreStoredSession() {
        // Store 会对损坏记录清理并抛错，不伪装成未登录。
        const storedSession = this.options.authSessionStore.load();
        if (!storedSession) {
            return false;
        }
        this.currentSession = storedSession;
        try {
            // validatedSession 只可能来自 valid check 或 explicit-invalid 后的 refresh。
            const validatedSession = await this.validateStoredSession(storedSession);
            if (!validatedSession) {
                await this.invalidateRestoredSession();
                return false;
            }
            this.currentSession = validatedSession;
            // 恢复 realtime 前先恢复当前账号的 SQLite owner。
            await this.options.accountDatabase.open(validatedSession.userID);
            await this.sync.messages.recoverInterruptedSends();
        }
        catch (cause) {
            if (isGatewayNetworkUnavailable(cause)) {
                try {
                    await this.options.accountDatabase.openExistingReadOnly(storedSession.userID);
                    this.offlineReaderEnabled = true;
                    this.applyLifecycleEvent('offline_restored');
                    return true;
                }
                catch (offlineCause) {
                    this.offlineReaderEnabled = false;
                    this.currentSession = null;
                    await this.options.accountDatabase.close();
                    throw offlineCause;
                }
            }
            this.currentSession = null;
            await this.options.accountDatabase.close();
            throw cause;
        }
        this.applyLifecycleEvent('auth_restored');
        this.connectRealtime();
        this.scheduleIncomingCallRefresh();
        return true;
    }
    /** 在离线只读状态重新校验会话，并只在成功后升级完整 runtime。 */
    reconnect() {
        if (this.pendingOfflineReconnect) {
            return this.pendingOfflineReconnect;
        }
        if (this.currentState !== 'offline-readonly' || !this.currentSession) {
            throw new WebIMRuntimeError('INVALID_LIFECYCLE_TRANSITION', 'Web IM offline reconnect requires an offline session.');
        }
        // reconnectPromise 是当前 runtime 唯一允许的离线校验请求。
        // reconnectVersion 固定本轮校验所有权，退出登录会使其立即过期。
        const reconnectVersion = ++this.offlineReconnectVersion;
        const reconnectPromise = this.reconnectOfflineSession(this.currentSession, reconnectVersion);
        this.pendingOfflineReconnect = reconnectPromise;
        return reconnectPromise.finally(() => {
            if (this.pendingOfflineReconnect === reconnectPromise) {
                this.pendingOfflineReconnect = null;
            }
        });
    }
    /** 远端 logout 失败时仍关闭 socket 并清除本地凭据。 */
    async signOut() {
        // 未 restore 的 runtime 仍可尝试退出已保存的 tab session。
        let session = this.currentSession;
        try {
            session ??= this.options.authSessionStore.load();
            if (session && this.currentState !== 'offline-readonly' && this.currentState !== 'offline-validating') {
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
    getSync() {
        this.rejectOfflineCapability('Full Web IM sync');
        return this.sync;
    }
    /** 仅在 runtime 明确处于离线状态时返回 cache-only reader。 */
    getOfflineReader() {
        if (!this.offlineReaderEnabled) {
            throw new WebIMRuntimeError('OFFLINE_READ_ONLY', 'Web IM offline reader is unavailable.');
        }
        return this.offlineReader;
    }
    /** 返回动态绑定当前认证会话的唯一用户设置入口。 */
    getSettings() {
        this.rejectOfflineCapability('Web IM settings');
        return this.settings;
    }
    /** 返回不依赖认证状态的 Web 客户端版本检查入口。 */
    getClientVersion() { return this.clientVersion; }
    /** 从 Gateway 恢复当前账号待接来电，失败由调用方或后台 reporter 显式处理。 */
    async refreshIncomingCall() {
        this.rejectOfflineCapability('Incoming call refresh');
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
        this.sync.presence.clear();
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
        if (event.type === 'user_status') {
            this.sync.presence.handleRealtimeEvent(event);
            return;
        }
        /** relationshipChanged 与 verificationChanged 允许 accepted 事件同时推进两个领域。 */
        const relationshipChanged = isIMRelationshipRealtimeEvent(event);
        /** verificationChanged 覆盖独立 type 1200 以及 friend/group application 事件。 */
        const verificationChanged = isIMVerificationRealtimeEvent(event);
        if (relationshipChanged || verificationChanged) {
            this.publishDomainChange(relationshipChanged, verificationChanged);
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
            this.sync.presence.clear();
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
        return refreshWebIMAuthSession(session, this.gatewayClient, this.options.authSessionStore);
    }
    /** 校验已有 tab session；explicit invalid 后的任何 refresh failure 都失效关闭。 */
    async validateStoredSession(session) {
        // checked 是唯一允许进入离线分支前抛 transport error 的远端操作。
        const checked = await this.gatewayClient.checkToken({
            access_token: session.accessToken,
        });
        if (checked.valid !== false) {
            return session;
        }
        try {
            return await this.refreshInvalidSession(session);
        }
        catch {
            return null;
        }
    }
    /** 执行离线单飞重连，网络失败保留 reader，其余失败清理 session/DB。 */
    async reconnectOfflineSession(session, reconnectVersion) {
        this.applyLifecycleEvent('offline_reconnect_started');
        let validatedSession;
        try {
            validatedSession = await this.validateStoredSession(session);
        }
        catch (cause) {
            if (!this.isCurrentOfflineReconnect(session, reconnectVersion)) {
                return false;
            }
            if (isGatewayNetworkUnavailable(cause)) {
                this.applyLifecycleEvent('offline_reconnect_failed');
                throw cause;
            }
            await this.invalidateOfflineSession();
            throw cause;
        }
        if (!this.isCurrentOfflineReconnect(session, reconnectVersion)) {
            return false;
        }
        if (!validatedSession) {
            await this.invalidateOfflineSession();
            return false;
        }
        // 升级 database 前先撤销旧 reader，防止其观察 readwrite adapter。
        this.offlineReaderEnabled = false;
        this.currentSession = validatedSession;
        try {
            await this.options.accountDatabase.open(validatedSession.userID);
            if (!this.isCurrentOfflineReconnect(session, reconnectVersion)) {
                return false;
            }
            await this.sync.messages.recoverInterruptedSends();
            if (!this.isCurrentOfflineReconnect(session, reconnectVersion)) {
                return false;
            }
        }
        catch (cause) {
            await this.invalidateOfflineSession();
            throw cause;
        }
        this.applyLifecycleEvent('offline_reconnect_succeeded');
        this.connectRealtime();
        this.scheduleIncomingCallRefresh();
        return true;
    }
    /** 判断异步离线重连结果仍属于当前 session 和生命周期。 */
    isCurrentOfflineReconnect(session, reconnectVersion) {
        return (this.offlineReconnectVersion === reconnectVersion &&
            this.currentSession?.userID === session.userID &&
            this.currentState === 'offline-validating');
    }
    /** 清理初次 restore 已明确失效的 session，不派发离线状态事件。 */
    async invalidateRestoredSession() {
        this.offlineReaderEnabled = false;
        this.clearLocalSession();
        await this.options.accountDatabase.close();
    }
    /** 从 offline-validating 原子进入 anonymous 并释放所有本地 owner。 */
    async invalidateOfflineSession() {
        this.offlineReaderEnabled = false;
        this.clearLocalSession();
        this.applyLifecycleEvent('offline_session_invalid');
        await this.options.accountDatabase.close();
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
        this.sync.presence.clear();
        this.currentSession = null;
        this.incomingCallState = resetIMIncomingCallLifecycleState(this.incomingCallState);
        this.options.authSessionStore.clear();
    }
    /** 离线状态禁止返回任何包含远端或 mutation 能力的 facade。 */
    rejectOfflineCapability(capability) {
        if (this.currentState === 'offline-readonly' ||
            this.currentState === 'offline-validating') {
            throw new WebIMRuntimeError('OFFLINE_READ_ONLY', `${capability} is unavailable while Web IM is offline.`);
        }
    }
    /** 拒绝未 restore 的 tab 直接执行账号安全 mutation。 */
    requireAccountSecuritySession() {
        this.rejectOfflineCapability('Account security');
        if (!this.currentSession) {
            throw new WebIMRuntimeError('ACCOUNT_SECURITY_AUTH_REQUIRED', 'Account security requires an authenticated Web IM session.');
        }
    }
    /** 清除本地认证、realtime 与账号数据库，不额外请求远端 logout。 */
    async invalidateLocalSession() {
        this.offlineReconnectVersion += 1;
        this.stopRealtime();
        this.sync.presence.clear();
        this.currentSession = null;
        this.offlineReaderEnabled = false;
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
    /** 一次发布关系与验证领域 revision，避免同一事件造成两次页面通知。 */
    publishDomainChange(relationshipChanged, verificationChanged) {
        if (relationshipChanged)
            this.relationshipVersion += 1;
        if (verificationChanged)
            this.verificationVersion += 1;
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
            relationshipVersion: this.relationshipVersion,
            verificationVersion: this.verificationVersion,
            incomingCall: this.incomingCallState.snapshot,
        };
    }
}
/** 判断 Gateway adapter 已证明的浏览器 transport unavailable 错误。 */
function isGatewayNetworkUnavailable(cause) {
    return (cause instanceof WebIMRuntimeError &&
        cause.code === 'GATEWAY_NETWORK_UNAVAILABLE');
}
//# sourceMappingURL=web-im-runtime.js.map