/// <reference types="vite/client" />

/** H5 部署环境允许注入的 Gateway runtime 配置。 */
interface ImportMetaEnv {
  readonly VITE_GATEWAY_HTTP_URL?: string;
  readonly VITE_GATEWAY_WS_URL?: string;
  readonly VITE_IM_PLATFORM_ID?: string;
  readonly VITE_IM_LANGUAGE?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_APP_BUILD_NUMBER?: string;
}

/** Vite 为每个模块提供的类型化环境入口。 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
