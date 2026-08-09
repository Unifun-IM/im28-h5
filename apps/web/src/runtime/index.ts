/** 按部署环境惰性创建 Web App 唯一 IM runtime。 */
export { createConfiguredWebIMRuntime } from './create-configured-web-im-runtime.js';
/** 为 React Router 页面提供唯一 Web IM runtime。 */
export {
  WebIMRuntimeProvider,
  useWebIMRuntime,
} from './WebIMRuntimeProvider.js';
/** 导出页面消费的 runtime context contract。 */
export type { WebIMRuntimeContextValue } from './WebIMRuntimeProvider.js';
