export type OpenAPIRequestOptions = RequestInit & {
    baseURL?: string;
    data?: unknown;
    fetch?: (input: string, init: RequestInit) => Promise<{
        readonly ok: boolean;
        readonly status: number;
        json(): Promise<unknown>;
    }>;
    params?: Record<string, unknown>;
    requestType?: 'form' | 'json' | string;
    onGatewayAPIError?: (notice: {
        readonly code: number;
        readonly message: string;
    }) => void;
    proxy?: unknown;
};
/**
 * Toggle Gateway API network error logging.
 * Defaults to enabled in dev (`__DEV__`) and disabled otherwise.
 */
export declare function setGatewayRequestLogging(enabled: boolean): void;
export default function request<T>(url: string, options?: OpenAPIRequestOptions): Promise<T>;
//# sourceMappingURL=request.d.ts.map