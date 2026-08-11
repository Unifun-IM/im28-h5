import type { OpenAPIRequestOptions } from '../../openapi/request.js';
import type { GatewayHTTPClientOptions } from './types.js';
/** 生成代码可消费的请求选项，统一承载认证、语言和代理信息。 */
export type GatewayGeneratedRequestOptions = Record<string, unknown> & OpenAPIRequestOptions;
/** 为同一 Gateway client 的每次请求读取最新动态配置。 */
export declare function createOpenAPIRequestOptionsFactory(options: GatewayHTTPClientOptions): () => GatewayGeneratedRequestOptions;
/** 解包 Gateway 统一响应，并拒绝所有非零业务码。 */
export declare function unwrapGatewayData<T>(envelopeOrPromise: unknown | Promise<unknown>): Promise<T>;
//# sourceMappingURL=request-support.d.ts.map