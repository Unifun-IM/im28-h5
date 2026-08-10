import { createGatewayHTTPClient, createGatewayRealtimeClient, type GatewayAuthData, type GatewayHTTPClient, type GatewayRealtimeClient, type GatewayRealtimeEvent } from '@im28/im-sdk/web';
import type { WebIMAuthSession } from './auth-session-store.js';
import { createWebIMSync, type WebIMSync } from '../sync/index.js';
import { establishWebIMAuthSession, refreshWebIMAuthSession } from './web-im-authentication.js';
import { createWebIMPlatformTermsClient, type WebIMPlatformTerm, type WebIMPlatformTermKey, type WebIMPlatformTermsClient } from './platform-terms-client.js';
import { WebIMRuntimeError } from './runtime-error.js';
import { transitionWebIMRuntimeState, type WebIMRuntimeEvent, type WebIMRuntimeState } from './runtime-lifecycle.js';
import type { WebIMLoginRequest, WebIMRegisterRequest, WebIMResetPasswordRequest, WebIMRuntime, WebIMRuntimeOptions, WebIMRuntimeSnapshot, WebIMSetAccountPasswordRequest } from './web-im-runtime-types.js';
import { createWebIMUserSettings, type WebIMUserSettings } from './web-im-user-settings.js';
/** 创建复用共享 Gateway HTTP/WebSocket clients 的浏览器 runtime。 */
export function createWebIMRuntime(options: WebIMRuntimeOptions): WebIMRuntime { return new WebIMRuntimeImpl(options); }
/** Web runtime 实例显式持有 auth/realtime 状态和浏览器端口。 */
class WebIMRuntimeImpl implements WebIMRuntime {
  // 构造配置和注入端口在 runtime 生命周期内不可替换。
  private readonly options: WebIMRuntimeOptions;
  // device ID 由独立 store 跨刷新保持稳定。
  private readonly deviceID: string;
  // HTTP client 动态读取当前 closure-free runtime session。
  private readonly gatewayClient: GatewayHTTPClient;
  // 公共平台条款查询复用 generated OpenAPI endpoint。
  private readonly platformTermsClient: WebIMPlatformTermsClient;
  // sync facade 固定持有唯一 realtime 串行队列。
  private readonly sync: WebIMSync;
  // settings facade 动态绑定当前认证身份并复用同一个 Gateway client。
  private readonly settings: WebIMUserSettings;
  // 监听器只接收无 token snapshot 变化通知。
  private readonly listeners = new Set<() => void>();
  // 状态只允许通过 applyLifecycleEvent 修改。
  private currentState: WebIMRuntimeState = 'anonymous';
  // 凭据只保存在 private state 和注入式 session store。
  private currentSession: WebIMAuthSession | null = null;
  // Snapshot 引用只在实际 lifecycle 变化时替换。
  private currentSnapshot: WebIMRuntimeSnapshot;
  // dataVersion 只在 realtime 数据成功写入后递增。
  private dataVersion = 0;
  // 每个 runtime 最多持有一个 realtime client。
  private realtimeClient: GatewayRealtimeClient | null = null;
  // 事件退订句柄与 realtime client 同生命周期释放。
  private unsubscribeRealtime: (() => void) | null = null;
  /** 初始化稳定 device ID、HTTP client 和匿名 snapshot。 */
  constructor(options: WebIMRuntimeOptions) {
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
      accountDatabase: this.options.accountDatabase,
      getCurrentUserID: () => this.currentSession?.userID ?? null,
    });
    this.settings = createWebIMUserSettings({
      gatewayClient: this.gatewayClient,
      getCurrentUserID: () => this.currentSession?.userID ?? null,
    });
  }
  /** 使用 Gateway 登录，完整会话验证通过后启动 realtime。 */
  async login(request: WebIMLoginRequest): Promise<WebIMRuntimeSnapshot> {
    return this.authenticate(() => this.gatewayClient.login({
      ...request,
      device_id: this.deviceID,
    }));
  }
  /** 使用 Gateway 注册，并复用登录后的会话、数据库和 realtime 收敛链。 */
  async register(request: WebIMRegisterRequest): Promise<WebIMRuntimeSnapshot> {
    return this.authenticate(() => this.gatewayClient.register({
      ...request,
      device_id: this.deviceID,
    }));
  }
  /** 首次设置账号密码成功后保留当前认证会话。 */
  async setAccountPassword(request: WebIMSetAccountPasswordRequest): Promise<void> {
    this.requireAccountSecuritySession();
    await this.gatewayClient.setAccountPassword({
      account: request.account.trim(),
      password: request.password,
    });
  }
  /** 旧密码重置成功会撤销远端 session，并同步清除全部本地认证 owner。 */
  async resetPassword(request: WebIMResetPasswordRequest): Promise<void> {
    this.requireAccountSecuritySession();
    await this.gatewayClient.resetPassword(request);
    await this.invalidateLocalSession();
  }
  /** 将登录和注册返回的认证数据收敛为同一浏览器 runtime 状态。 */
  private async authenticate(requestAuthData: () => Promise<GatewayAuthData>): Promise<WebIMRuntimeSnapshot> {
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
    } catch (cause) {
      this.currentSession = null;
      this.applyLifecycleEvent('auth_failed');
      throw cause;
    }
    this.connectRealtime();
    return this.currentSnapshot;
  }
  /** 查询公开平台条款，不要求建立认证会话。 */
  async getPlatformTerm(key: WebIMPlatformTermKey): Promise<WebIMPlatformTerm> { return this.platformTermsClient.getTerm(key); }
  /** 恢复 tab 会话，先 check-token，明确无效时再 refresh。 */
  async restore(): Promise<boolean> {
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
    } catch (cause) {
      this.currentSession = null;
      throw cause;
    }
    this.applyLifecycleEvent('auth_restored');
    this.connectRealtime();
    return true;
  }
  /** 远端 logout 失败时仍关闭 socket 并清除本地凭据。 */
  async signOut(): Promise<void> {
    // 未 restore 的 runtime 仍可尝试退出已保存的 tab session。
    let session = this.currentSession;
    try {
      session ??= this.options.authSessionStore.load();
      if (session) {
        try {
          await this.gatewayClient.logout({ access_token: session.accessToken });
        } catch {
          // 远端不可用不能阻止用户清除本地凭据与实时连接。
        }
      }
    } finally {
      await this.invalidateLocalSession();
    }
  }
  /** 返回 useSyncExternalStore 可消费的稳定 snapshot。 */
  getSnapshot(): WebIMRuntimeSnapshot { return this.currentSnapshot; }
  /** 返回动态绑定当前 auth/account DB owner 的唯一同步入口。 */
  getSync(): WebIMSync { return this.sync; }
  /** 返回动态绑定当前认证会话的唯一用户设置入口。 */
  getSettings(): WebIMUserSettings { return this.settings; }
  /** 订阅 runtime snapshot 变化。 */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /** 释放 socket 与监听器但保留可恢复的 tab session。 */
  dispose(): void { this.stopRealtime(); this.listeners.clear(); }
  /** 创建并连接与当前认证会话绑定的唯一 realtime client。 */
  private connectRealtime(): void {
    if (!this.currentSession) {
      throw new WebIMRuntimeError(
        'INVALID_LIFECYCLE_TRANSITION',
        'Cannot connect realtime without an auth session.',
      );
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
    this.unsubscribeRealtime = nextClient.onEvent(event =>
      this.handleRealtimeEvent(event),
    );
    this.applyLifecycleEvent('realtime_connecting');
    nextClient.connect();
  }
  /** 把共享 realtime event 映射为本地 lifecycle event。 */
  private handleRealtimeEvent(event: GatewayRealtimeEvent): void {
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
      this.applyLifecycleEvent(
        event.type === 'token_expired' ? 'token_expired' : 'signed_out',
      );
      // SDK event callback 无法 await，失败必须经显式 reporter 暴露。
      void this.options.accountDatabase
        .close()
        .catch(cause => this.options.reportBackgroundError(cause));
    }
  }
  /** 将连接中/在线状态统一标记为等待共享 client 重连。 */
  private markRealtimeDisconnected(): void {
    if (this.currentState === 'connecting' || this.currentState === 'online') this.applyLifecycleEvent('realtime_disconnected');
  }
  /** 刷新服务端已判定失效的 access token。 */
  private async refreshInvalidSession(session: WebIMAuthSession): Promise<WebIMAuthSession | null> {
    return refreshWebIMAuthSession(session, this.gatewayClient, this.deviceID, this.options.authSessionStore);
  }
  /** 关闭 realtime client 和事件订阅，不修改认证会话。 */
  private stopRealtime(): void {
    this.unsubscribeRealtime?.();
    this.unsubscribeRealtime = null;
    this.realtimeClient?.close();
    this.realtimeClient = null;
  }
  /** 清除已被服务端判定无效的本地认证会话。 */
  private clearLocalSession(): void {
    this.stopRealtime();
    this.currentSession = null;
    this.options.authSessionStore.clear();
  }
  /** 拒绝未 restore 的 tab 直接执行账号安全 mutation。 */
  private requireAccountSecuritySession(): void {
    if (!this.currentSession) {
      throw new WebIMRuntimeError(
        'ACCOUNT_SECURITY_AUTH_REQUIRED',
        'Account security requires an authenticated Web IM session.',
      );
    }
  }
  /** 清除本地认证、realtime 与账号数据库，不额外请求远端 logout。 */
  private async invalidateLocalSession(): Promise<void> {
    this.stopRealtime();
    this.currentSession = null;
    this.options.authSessionStore.clear();
    this.applyLifecycleEvent('signed_out');
    await this.options.accountDatabase.close();
  }
  /** 通过唯一状态机应用事件并发布 snapshot。 */
  private applyLifecycleEvent(event: WebIMRuntimeEvent): void {
    this.currentState = transitionWebIMRuntimeState(this.currentState, event);
    this.currentSnapshot = this.createSnapshot();
    for (const listener of this.listeners) {
      listener();
    }
  }
  /** 发布一次无凭据数据版本变化，驱动页面重读 SQLite。 */
  private publishDataChange(): void {
    this.dataVersion += 1;
    this.currentSnapshot = this.createSnapshot();
    for (const listener of this.listeners) listener();
  }
  /** 创建不包含 token 的 runtime snapshot。 */
  private createSnapshot(): WebIMRuntimeSnapshot {
    return { state: this.currentState, userID: this.currentSession?.userID ?? null, dataVersion: this.dataVersion };
  }
}
