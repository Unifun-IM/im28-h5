import { type GatewayHTTPClient } from '@im28/im-sdk/core';
import type { IMMediaUploadPort } from '../../../sync/index.js';
/** OSS multipart 请求所需的最小浏览器 response contract。 */
export interface BrowserMultipartResponse {
    readonly ok: boolean;
    readonly status: number;
}
/** 可注入的浏览器 multipart fetch 端口便于无网络回归。 */
export type BrowserMultipartFetch = (input: string, init: {
    readonly method: 'POST';
    readonly body: FormData;
}) => Promise<BrowserMultipartResponse>;
/** 浏览器 OSS 上传 adapter 的 Gateway 与 Fetch owners。 */
export interface BrowserOSSUploadDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly fetch?: BrowserMultipartFetch;
}
/** 创建只负责 Blob/FormData I/O 的 Web 媒体上传端口。 */
export declare function createBrowserOSSUploadPort(dependencies: BrowserOSSUploadDependencies): IMMediaUploadPort;
//# sourceMappingURL=browser-oss-upload.d.ts.map