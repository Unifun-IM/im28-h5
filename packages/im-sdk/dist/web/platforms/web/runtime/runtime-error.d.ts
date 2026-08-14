/** Web IM runtime 可识别并稳定处理的错误码。 */
export type WebIMRuntimeErrorCode = 'INVALID_RUNTIME_CONFIG' | 'CORRUPT_AUTH_SESSION' | 'CORRUPT_DEVICE_ID' | 'BROWSER_CAPABILITY_UNAVAILABLE' | 'INVALID_AUTH_RESPONSE' | 'GATEWAY_NETWORK_UNAVAILABLE' | 'OFFLINE_READ_ONLY' | 'ACCOUNT_SECURITY_AUTH_REQUIRED' | 'USER_SETTINGS_AUTH_REQUIRED' | 'INVALID_PLATFORM_TERM_RESPONSE' | 'INVALID_LIFECYCLE_TRANSITION';
/** Web IM runtime 的结构化错误，避免调用方依赖易变文案。 */
export declare class WebIMRuntimeError extends Error {
    readonly code: WebIMRuntimeErrorCode;
    /** 保存稳定错误码和原始原因，供上层决定恢复或退出。 */
    constructor(code: WebIMRuntimeErrorCode, message: string, cause?: unknown);
}
//# sourceMappingURL=runtime-error.d.ts.map