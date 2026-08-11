import { IMError } from '../../core/errors.js';
/** 为同一 Gateway client 的每次请求读取最新动态配置。 */
export function createOpenAPIRequestOptionsFactory(options) {
    /** 请求发起时才读取 token、baseURL 与代理，避免缓存过期会话。 */
    return function requestOptions() {
        // baseURL 去除尾斜杠，保证生成端点拼接稳定。
        const baseURL = (options.getBaseURL?.() ?? options.baseURL).replace(/\/+$/, '');
        // headers 是本次请求独享的可变副本。
        const headers = {
            'content-type': 'application/json',
        };
        // language 统一透传服务端国际化偏好。
        const language = options.language;
        // requestID 为每次调用生成独立追踪标识。
        const requestID = options.createRequestID?.();
        // token 始终读取 runtime 当前认证会话。
        const token = options.getAccessToken?.();
        // proxy 只在显式启用时交给平台 fetch adapter。
        const proxy = options.getProxyConfig?.();
        if (language)
            headers['Accept-Language'] = language;
        if (requestID)
            headers['X-Request-ID'] = requestID;
        if (token)
            headers.Authorization = `Bearer ${token}`;
        return {
            baseURL,
            fetch: options.fetch,
            headers,
            onGatewayAPIError: options.onGatewayAPIError,
            proxy: proxy?.enabled ? proxy : null,
        };
    };
}
/** 解包 Gateway 统一响应，并拒绝所有非零业务码。 */
export async function unwrapGatewayData(envelopeOrPromise) {
    // envelope 只在统一边界做结构读取，业务 mapper 不接触响应壳。
    const envelope = (await envelopeOrPromise);
    if (envelope.code !== undefined && envelope.code !== 0) {
        throw new IMError({
            code: 'GATEWAY_API_ERROR',
            message: envelope.message ?? `Gateway API failed with code ${envelope.code}.`,
            source: 'transport',
            cause: envelope,
        });
    }
    return (envelope.data ?? {});
}
//# sourceMappingURL=request-support.js.map