/** 按部署环境惰性创建 Web App 唯一 IM runtime。 */
export { createConfiguredWebIMRuntime } from './create-configured-web-im-runtime.js';
/** 为 React Router 页面提供唯一 Web IM runtime。 */
export {
  WebIMRuntimeProvider,
  useWebIMRuntime,
} from './WebIMRuntimeProvider.js';
/** 导出页面消费的 runtime context contract。 */
export type { WebIMRuntimeContextValue } from './WebIMRuntimeProvider.js';
/** 导出冷启动离线态的 H5 路由与能力边界。 */
export { OfflineRuntimeBoundary } from './OfflineRuntimeBoundary.js';
/** 导出全局 Web 通话生命周期 Provider 与消费 hook。 */
export { WebIMCallProvider, useWebIMCall } from './WebIMCallProvider.js';
/** 导出 H5 通话入口所需的非敏感 view contract。 */
export type {
  WebIMActiveCallView,
  WebIMCallContextValue,
  WebIMStartOutgoingCallOptions,
} from './WebIMCallProvider.js';
