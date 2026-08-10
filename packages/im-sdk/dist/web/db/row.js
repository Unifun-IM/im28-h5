import { IMError } from '../core/errors.js';
export function readRequiredString(row, key) {
    const value = readValue(row, key);
    if (typeof value === 'string') {
        return value;
    }
    throwInvalidColumn(key, 'string', value);
}
export function readOptionalString(row, key) {
    const value = readValue(row, key);
    if (value === null || value === undefined) {
        return undefined;
    }
    if (typeof value === 'string') {
        return value;
    }
    throwInvalidColumn(key, 'string | null', value);
}
export function readRequiredNumber(row, key) {
    const value = readValue(row, key);
    if (typeof value === 'number') {
        return value;
    }
    throwInvalidColumn(key, 'number', value);
}
export function readOptionalNumber(row, key) {
    const value = readValue(row, key);
    if (value === null || value === undefined) {
        return undefined;
    }
    if (typeof value === 'number') {
        return value;
    }
    throwInvalidColumn(key, 'number | null', value);
}
export function parseJsonColumn(row, key, fallback) {
    const value = readOptionalString(row, key);
    if (value === undefined || value.length === 0) {
        return fallback;
    }
    try {
        return JSON.parse(value);
    }
    catch (error) {
        throw new IMError({
            code: 'DB_INVALID_JSON_COLUMN',
            message: `Invalid JSON in database column ${key}.`,
            source: 'db',
            cause: error,
        });
    }
}
function readValue(row, key) {
    return row[key];
}
function throwInvalidColumn(key, expected, actual) {
    throw new IMError({
        code: 'DB_INVALID_COLUMN_TYPE',
        message: `Column ${key} expected ${expected}.`,
        source: 'db',
        cause: actual,
    });
}
//# sourceMappingURL=row.js.map