import type { GatewayHTTPClient } from '@im28/im-sdk/core';
/** H5 页面消费的客户端版本检查结果。 */
export interface WebIMClientVersionCheckResult {
    readonly needUpdate: boolean;
    readonly forceUpdate: boolean;
    readonly latestVersion: string;
    readonly updateURL: string | null;
    readonly title: string;
    readonly description: string;
}
/** 公开版本检查 facade 不依赖认证会话。 */
export interface WebIMClientVersion {
    readonly currentVersion: string;
    check(): Promise<WebIMClientVersionCheckResult>;
}
/** 创建版本检查 facade 所需的共享 Gateway client 与部署 identity。 */
export interface WebIMClientVersionDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly appVersion: string;
    readonly appBuildNumber?: string;
}
/** 复用共享 Gateway operation，并收敛 Web 更新地址安全策略。 */
export declare function createWebIMClientVersion(dependencies: WebIMClientVersionDependencies): WebIMClientVersion;
//# sourceMappingURL=web-im-client-version.d.ts.map