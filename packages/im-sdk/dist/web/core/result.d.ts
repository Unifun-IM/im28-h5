export type IMResult<T> = IMSuccess<T> | IMFailure;
export interface IMSuccess<T> {
    readonly ok: true;
    readonly value: T;
}
export interface IMFailure {
    readonly ok: false;
    readonly error: Error;
}
export declare function ok<T>(value: T): IMSuccess<T>;
export declare function fail(error: Error): IMFailure;
//# sourceMappingURL=result.d.ts.map