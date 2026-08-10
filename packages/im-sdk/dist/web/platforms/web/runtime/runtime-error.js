/** Web IM runtime 的结构化错误，避免调用方依赖易变文案。 */
export class WebIMRuntimeError extends Error {
    code;
    /** 保存稳定错误码和原始原因，供上层决定恢复或退出。 */
    constructor(code, message, cause) {
        super(message, cause === undefined ? undefined : { cause });
        this.name = 'WebIMRuntimeError';
        this.code = code;
    }
}
//# sourceMappingURL=runtime-error.js.map