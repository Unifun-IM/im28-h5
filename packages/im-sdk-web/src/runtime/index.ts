/** 创建 tab 级 Web IM 认证会话 store。 */
export { createWebIMAuthSessionStore } from './auth-session-store.js';
/** 创建共享 Gateway HTTP client 可用的浏览器 Fetch adapter。 */
export { createBrowserGatewayFetch } from './browser-gateway-fetch.js';
/** 创建非敏感的稳定浏览器 device identity store。 */
export { createWebIMDeviceIdentityStore } from './device-identity-store.js';
/** 解析部署环境中的 Gateway runtime 配置。 */
export { parseWebIMRuntimeConfig } from './runtime-config.js';
/** 创建复用 generated OpenAPI operation 的平台条款 client。 */
export {
  WEB_IM_PLATFORM_TERM_KEYS,
  createWebIMPlatformTermsClient,
} from './platform-terms-client.js';
/** 执行严格的 Web IM runtime 状态转换。 */
export { transitionWebIMRuntimeState } from './runtime-lifecycle.js';
/** 创建复用共享 Gateway clients 的浏览器 IM runtime。 */
export { createWebIMRuntime } from './web-im-runtime.js';
/** 导出 Web IM runtime 的结构化错误。 */
export { WebIMRuntimeError } from './runtime-error.js';
/** 导出认证会话与 sessionStorage 端口类型。 */
export type {
  WebIMAuthSession,
  WebIMAuthSessionStore,
  WebIMSessionStorage,
} from './auth-session-store.js';
/** 导出 device identity store 与持久化端口类型。 */
export type {
  WebIMDeviceIdentityStore,
  WebIMPersistentStorage,
} from './device-identity-store.js';
/** 导出类型化 Gateway runtime 配置。 */
export type { WebIMRuntimeConfig } from './runtime-config.js';
/** 导出平台条款查询的稳定公开 contract。 */
export type {
  WebIMPlatformTerm,
  WebIMPlatformTermKey,
  WebIMPlatformTermsClient,
  WebIMPlatformTermsClientOptions,
} from './platform-terms-client.js';
/** 导出 runtime 状态机的状态和事件类型。 */
export type {
  WebIMRuntimeEvent,
  WebIMRuntimeState,
} from './runtime-lifecycle.js';
/** 导出 runtime 稳定错误码。 */
export type { WebIMRuntimeErrorCode } from './runtime-error.js';
/** 导出 Web IM runtime 命令、配置和快照类型。 */
export type {
  WebIMLoginRequest,
  WebIMRuntime,
  WebIMRuntimeOptions,
  WebIMRuntimeSnapshot,
} from './web-im-runtime-types.js';
