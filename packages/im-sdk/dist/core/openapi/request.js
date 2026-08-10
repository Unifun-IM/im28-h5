import { IMError } from '../core/errors.js';
let requestLoggingEnabled = typeof globalThis.__DEV__ === 'boolean'
    ? globalThis.__DEV__ === true
    : false;
/**
 * Toggle Gateway API network error logging.
 * Defaults to enabled in dev (`__DEV__`) and disabled otherwise.
 */
export function setGatewayRequestLogging(enabled) {
    requestLoggingEnabled = enabled;
}
let requestSeq = 0;
function appendParams(url, params) {
    if (!params) {
        return url;
    }
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) {
            continue;
        }
        search.append(key, String(value));
    }
    const query = search.toString();
    if (!query) {
        return url;
    }
    return `${url}${url.includes('?') ? '&' : '?'}${query}`;
}
export default async function request(url, options = {}) {
    const { baseURL, data, fetch: fetcher = fetch, params, requestType, onGatewayAPIError, proxy, headers, ...init } = options;
    const requestInit = { ...init };
    if (proxy !== undefined) {
        requestInit.proxy = proxy;
    }
    if (headers !== undefined) {
        requestInit.headers = headers;
    }
    if (data !== undefined) {
        requestInit.body = requestType === 'form'
            ? data
            : JSON.stringify(data);
    }
    const requestURL = appendParams(`${baseURL ?? ''}${url}`, params);
    const logId = requestLoggingEnabled ? ++requestSeq : 0;
    const startedAt = requestLoggingEnabled ? Date.now() : 0;
    let response;
    try {
        response = await fetcher(requestURL, requestInit);
    }
    catch (error) {
        if (requestLoggingEnabled) {
            console.warn(`[Gateway #${logId}] ✗ network error after ${Date.now() - startedAt}ms ${requestURL}`, error);
        }
        throw error;
    }
    const payload = await response.json();
    const apiCode = readGatewayCode(payload);
    if (apiCode !== undefined && apiCode !== 0) {
        onGatewayAPIError?.({
            code: apiCode,
            message: readGatewayMessage(payload) ?? `Gateway API failed with code ${apiCode}.`,
        });
    }
    if (!response.ok) {
        const message = readGatewayMessage(payload) ?? `Gateway HTTP ${response.status}.`;
        throw new IMError({
            code: 'GATEWAY_HTTP_ERROR',
            message,
            source: 'transport',
            cause: payload,
        });
    }
    return payload;
}
function readGatewayCode(payload) {
    if (!payload || typeof payload !== 'object') {
        return undefined;
    }
    const code = payload.code
        ?? payload.errCode;
    return typeof code === 'number' ? code : undefined;
}
function readGatewayMessage(payload) {
    if (!payload || typeof payload !== 'object') {
        return undefined;
    }
    const message = payload.message;
    return typeof message === 'string' && message.length > 0 ? message : undefined;
}
//# sourceMappingURL=request.js.map