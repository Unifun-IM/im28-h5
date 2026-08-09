/** Web IM runtime 可识别并稳定处理的错误码。 */
export type WebIMRuntimeErrorCode =
  | 'INVALID_RUNTIME_CONFIG'
  | 'CORRUPT_AUTH_SESSION'
  | 'CORRUPT_DEVICE_ID'
  | 'BROWSER_CAPABILITY_UNAVAILABLE'
  | 'INVALID_AUTH_RESPONSE'
  | 'INVALID_PLATFORM_TERM_RESPONSE'
  | 'INVALID_LIFECYCLE_TRANSITION';

/** Web IM runtime 的结构化错误，避免调用方依赖易变文案。 */
export class WebIMRuntimeError extends Error {
  readonly code: WebIMRuntimeErrorCode;

  /** 保存稳定错误码和原始原因，供上层决定恢复或退出。 */
  constructor(code: WebIMRuntimeErrorCode, message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'WebIMRuntimeError';
    this.code = code;
  }
}
