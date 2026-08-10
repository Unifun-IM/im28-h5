export type IMErrorSource = 'auth' | 'client' | 'db' | 'media' | 'sync' | 'transport' | 'unknown';
export interface IMErrorOptions {
    readonly code: string;
    readonly message: string;
    readonly source?: IMErrorSource;
    readonly retryable?: boolean;
    readonly cause?: unknown;
}
export declare class IMError extends Error {
    readonly code: string;
    readonly source: IMErrorSource;
    readonly retryable: boolean;
    readonly rawCause?: unknown;
    constructor(options: IMErrorOptions);
}
export declare function toIMError(error: unknown, fallback: Omit<IMErrorOptions, 'cause'>): IMError;
//# sourceMappingURL=errors.d.ts.map