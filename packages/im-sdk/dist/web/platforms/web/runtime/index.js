/** 创建 tab 级 Web IM 认证会话 store。 */
export { createWebIMAuthSessionStore } from './auth-session-store.js';
/** 创建共享 Gateway HTTP client 可用的浏览器 Fetch adapter。 */
export { createBrowserGatewayFetch } from './browser-gateway-fetch.js';
/** 创建非敏感的稳定浏览器 device identity store。 */
export { createWebIMDeviceIdentityStore } from './device-identity-store.js';
/** 解析部署环境中的 Gateway runtime 配置。 */
export { parseWebIMRuntimeConfig } from './runtime-config.js';
/** 创建复用 generated OpenAPI operation 的平台条款 client。 */
export { WEB_IM_PLATFORM_TERM_KEYS, createWebIMPlatformTermsClient, } from './platform-terms-client.js';
/** 执行严格的 Web IM runtime 状态转换。 */
export { transitionWebIMRuntimeState } from './runtime-lifecycle.js';
/** 创建复用共享 Gateway clients 的浏览器 IM runtime。 */
export { createWebIMRuntime } from './web-im-runtime.js';
/** 导出未注册账号错误的标准化认证判断。 */
export { isWebIMUnregisteredAccountError } from './web-im-authentication.js';
/** 导出 Web IM runtime 的结构化错误。 */
export { WebIMRuntimeError } from './runtime-error.js';
/** 创建认证绑定的 Web 用户设置 facade。 */
export { createWebIMUserSettings } from './web-im-user-settings.js';
/** 创建复用共享 Gateway operation 的 Web 客户端版本 facade。 */
export { createWebIMClientVersion } from './web-im-client-version.js';
//# sourceMappingURL=index.js.map