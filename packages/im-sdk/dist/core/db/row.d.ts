import type { DatabaseRow } from './database.js';
export declare function readRequiredString(row: DatabaseRow, key: string): string;
export declare function readOptionalString(row: DatabaseRow, key: string): string | undefined;
export declare function readRequiredNumber(row: DatabaseRow, key: string): number;
export declare function readOptionalNumber(row: DatabaseRow, key: string): number | undefined;
export declare function parseJsonColumn<T>(row: DatabaseRow, key: string, fallback: T): T;
//# sourceMappingURL=row.d.ts.map