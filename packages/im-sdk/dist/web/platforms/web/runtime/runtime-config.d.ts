/** 浏览器 Gateway runtime 创建客户端所需的稳定配置。 */
export interface WebIMRuntimeConfig {
    readonly gatewayHTTPURL: string;
    readonly gatewayWebSocketURL: string;
    readonly platformID: number;
    readonly language: string;
    readonly appVersion: string;
    readonly appBuildNumber?: string;
}
/** 解析并验证 Vite 环境输入，失败时不创建任何网络客户端。 */
export declare function parseWebIMRuntimeConfig(environment: Readonly<Record<string, unknown>>): WebIMRuntimeConfig;
//# sourceMappingURL=runtime-config.d.ts.map