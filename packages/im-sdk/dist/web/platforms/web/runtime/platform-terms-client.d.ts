import { type GatewayFetch } from '@im28/im-sdk/core';
/** 平台条款业务键与 RN termService 保持一致。 */
export declare const WEB_IM_PLATFORM_TERM_KEYS: {
    readonly userAgreement: "user_agreement";
    readonly privacyPolicy: "privacy_policy";
};
/** 页面只允许查询已冻结的平台条款业务键。 */
export type WebIMPlatformTermKey = (typeof WEB_IM_PLATFORM_TERM_KEYS)[keyof typeof WEB_IM_PLATFORM_TERM_KEYS];
/** H5 页面消费的平台条款稳定结构。 */
export interface WebIMPlatformTerm {
    readonly key: WebIMPlatformTermKey;
    readonly title: string;
    readonly content: string;
    readonly version: string;
}
/** 平台条款 client 对 runtime 开放的只读查询能力。 */
export interface WebIMPlatformTermsClient {
    getTerm(key: WebIMPlatformTermKey): Promise<WebIMPlatformTerm>;
}
/** 创建平台条款 client 所需的公开 Gateway 端口。 */
export interface WebIMPlatformTermsClientOptions {
    readonly gatewayHTTPURL: string;
    readonly language: string;
    readonly fetch: GatewayFetch;
    readonly createRequestID?: () => string;
}
/** 复用 generated OpenAPI operation 创建浏览器平台条款 client。 */
export declare function createWebIMPlatformTermsClient(options: WebIMPlatformTermsClientOptions): WebIMPlatformTermsClient;
//# sourceMappingURL=platform-terms-client.d.ts.map