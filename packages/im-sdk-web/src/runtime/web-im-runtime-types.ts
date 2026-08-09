import type {
  GatewayFetch,
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

/** Web 登录请求由 runtime 统一注入稳定 device ID。 */
export type WebIMLoginRequest = Omit<GatewayUserLoginRequest, 'device_id'>;

/** UI 可订阅的 runtime 快照不暴露 access/refresh token。 */
export interface WebIMRuntimeSnapshot {
  readonly state: WebIMRuntimeState;
  readonly userID: string | null;
  readonly dataVersion: number;
}

/** Web runtime 对页面开放的最小认证与连接 API。 */
export interface WebIMRuntime {
  login(request: WebIMLoginRequest): Promise<WebIMRuntimeSnapshot>;
  getPlatformTerm(key: WebIMPlatformTermKey): Promise<WebIMPlatformTerm>;
  restore(): Promise<boolean>;
  signOut(): Promise<void>;
  getSnapshot(): WebIMRuntimeSnapshot;
  getSync(): WebIMSync;
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
