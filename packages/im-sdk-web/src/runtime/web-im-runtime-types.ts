import type {
  GatewayFetch,
  GatewayRegisterUserRequest,
  GatewayUserLoginRequest,
  GatewayWebSocketConstructor,
} from '@im28/im-sdk/web';

import type { WebIMAccountDatabaseLifecycle } from '../storage/index.js';
import type { WebIMSync } from '../sync/index.js';
import type { WebIMAuthSessionStore } from './auth-session-store.js';
import type { WebIMDeviceIdentityStore } from './device-identity-store.js';
import type {
  WebIMPlatformTerm,
  WebIMPlatformTermKey,
} from './platform-terms-client.js';
import type { WebIMRuntimeConfig } from './runtime-config.js';
import type { WebIMRuntimeState } from './runtime-lifecycle.js';
import type { WebIMUserSettings } from './web-im-user-settings.js';

/** Web 登录请求由 runtime 统一注入稳定 device ID。 */
export type WebIMLoginRequest = Omit<GatewayUserLoginRequest, 'device_id'>;

/** Web 注册请求由 runtime 统一注入稳定 device ID。 */
export type WebIMRegisterRequest = Omit<GatewayRegisterUserRequest, 'device_id'>;

/** 首次设置账号密码只接受 Gateway 已支持的两个字段。 */
export interface WebIMSetAccountPasswordRequest {
  readonly account: string;
  readonly password: string;
}

/** 旧密码重置请求成功后会撤销当前 Gateway session。 */
export interface WebIMResetPasswordRequest {
  readonly old_password: string;
  readonly password: string;
}

/** UI 可订阅的 runtime 快照不暴露 access/refresh token。 */
export interface WebIMRuntimeSnapshot {
  readonly state: WebIMRuntimeState;
  readonly userID: string | null;
  readonly dataVersion: number;
}

/** Web runtime 对页面开放的最小认证与连接 API。 */
export interface WebIMRuntime {
  login(request: WebIMLoginRequest): Promise<WebIMRuntimeSnapshot>;
  register(request: WebIMRegisterRequest): Promise<WebIMRuntimeSnapshot>;
  setAccountPassword(request: WebIMSetAccountPasswordRequest): Promise<void>;
  resetPassword(request: WebIMResetPasswordRequest): Promise<void>;
  getPlatformTerm(key: WebIMPlatformTermKey): Promise<WebIMPlatformTerm>;
  restore(): Promise<boolean>;
  signOut(): Promise<void>;
  getSnapshot(): WebIMRuntimeSnapshot;
  getSync(): WebIMSync;
  getSettings(): WebIMUserSettings;
  subscribe(listener: () => void): () => void;
  dispose(): void;
}

/** 创建 Web runtime 所需的浏览器端口和共享 SDK 配置。 */
export interface WebIMRuntimeOptions {
  readonly config: WebIMRuntimeConfig;
  readonly authSessionStore: WebIMAuthSessionStore;
  readonly deviceIdentityStore: WebIMDeviceIdentityStore;
  readonly fetch: GatewayFetch;
  readonly WebSocket: GatewayWebSocketConstructor;
  readonly accountDatabase: WebIMAccountDatabaseLifecycle;
  readonly reportBackgroundError: (cause: unknown) => void;
  readonly createRequestID?: () => string;
}
