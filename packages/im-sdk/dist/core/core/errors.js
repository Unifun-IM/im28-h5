export class IMError extends Error {
    code;
    source;
    retryable;
    rawCause;
    constructor(options) {
        super(options.message);
        this.name = 'IMError';
        this.code = options.code;
        this.source = options.source ?? 'unknown';
        this.retryable = options.retryable ?? false;
        if (options.cause !== undefined) {
            this.rawCause = options.cause;
        }
    }
}
export function toIMError(error, fallback) {
    if (error instanceof IMError) {
        return error;
    }
    if (error instanceof Error) {
        return new IMError({
            ...fallback,
            message: error.message || fallback.message,
            cause: error,
        });
    }
    return new IMError({ ...fallback, cause: error });
}
//# sourceMappingURL=errors.js.map