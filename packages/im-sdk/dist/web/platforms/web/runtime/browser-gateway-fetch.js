import { WebIMRuntimeError } from './runtime-error.js';
/** 创建共享 Gateway HTTP client 可消费的浏览器 Fetch adapter。 */
export function createBrowserGatewayFetch(fetchImplementation = globalThis.fetch) {
    if (typeof fetchImplementation !== 'function') {
        throw new WebIMRuntimeError('BROWSER_CAPABILITY_UNAVAILABLE', 'Browser fetch is unavailable.');
    }
    return async (input, init) => fetchImplementation(input, {
        method: init.method,
        headers: init.headers,
        body: init.body,
    });
}
//# sourceMappingURL=browser-gateway-fetch.js.map