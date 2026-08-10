import {
  WebIMRuntimeError,
  createBrowserGatewayFetch,
  createBrowserSqlJsDatabaseWorker,
  createAccountDatabaseLeaseManager,
  createWebIMAccountDatabaseLifecycle,
  createWebIMAuthSessionStore,
  createWebIMDeviceIdentityStore,
  createWebIMRuntime,
  parseWebIMRuntimeConfig,
  type GatewayWebSocketConstructor,
  type WebIMRuntime,
} from '@im28/im-sdk/web';
import sqlWasmURL from 'sql.js/dist/sql-wasm.wasm?url';

/** 从当前 Vite 环境和浏览器原生能力创建唯一 Web IM runtime。 */
export function createConfiguredWebIMRuntime(): WebIMRuntime {
  if (typeof globalThis.WebSocket !== 'function') {
    throw new WebIMRuntimeError(
      'BROWSER_CAPABILITY_UNAVAILABLE',
      'Browser WebSocket is unavailable.',
    );
  }
  // SDK parser 是环境配置的唯一校验 owner。
  const config = parseWebIMRuntimeConfig(import.meta.env);
  // access/refresh token 仅进入当前 tab 的 sessionStorage。
  const authSessionStore = createWebIMAuthSessionStore(
    globalThis.sessionStorage,
  );
  // 非敏感 device identity 使用 localStorage 跨刷新保持稳定。
  const deviceIdentityStore = createWebIMDeviceIdentityStore(
    globalThis.localStorage,
  );
  // Fetch adapter 不复制 Gateway endpoint 或 envelope 语义。
  const gatewayFetch = createBrowserGatewayFetch(globalThis.fetch);
  // 账户数据库 owner 复用共享 migrations，并由 Vite 提供 WASM 资源 URL。
  const accountDatabase = createWebIMAccountDatabaseLifecycle({
    indexedDB: globalThis.indexedDB,
    locateWasmFile: () => sqlWasmURL,
    wasmURL: sqlWasmURL,
    createDatabaseWorker: createBrowserSqlJsDatabaseWorker,
    accountDatabaseLeaseManager: createAccountDatabaseLeaseManager(
      globalThis.navigator.locks,
    ),
  });
  return createWebIMRuntime({
    config,
    authSessionStore,
    deviceIdentityStore,
    fetch: gatewayFetch,
    WebSocket: globalThis.WebSocket as unknown as GatewayWebSocketConstructor,
    accountDatabase,
    reportBackgroundError: reportBrowserRuntimeBackgroundError,
    createRequestID: createBrowserRequestID,
  });
}

/** 将异步数据库关闭错误交给浏览器全局错误通道。 */
function reportBrowserRuntimeBackgroundError(cause: unknown): void {
  if (typeof globalThis.reportError === 'function') {
    globalThis.reportError(cause);
    return;
  }
  globalThis.setTimeout(() => {
    throw cause;
  }, 0);
}

/** 为 Gateway 请求生成不可预测且可关联的浏览器 request ID。 */
function createBrowserRequestID(): string {
  if (typeof globalThis.crypto?.randomUUID !== 'function') {
    throw new WebIMRuntimeError(
      'BROWSER_CAPABILITY_UNAVAILABLE',
      'Browser crypto.randomUUID is unavailable.',
    );
  }
  return globalThis.crypto.randomUUID();
}
