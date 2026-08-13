/** 将 Gateway/RN 历史群模式值归一化为稳定枚举。 */
export function normalizeIMGroupMode(value) {
    if (typeof value === 'number' && Number.isInteger(value)) {
        if (value === 1)
            return 'normal';
        if (value === 2)
            return 'large';
        return 'unknown';
    }
    if (typeof value !== 'string')
        return 'unknown';
    /** normalized 兼容 RN 已发布的数字字符串和 Gateway 文字值。 */
    const normalized = value.trim().toLowerCase();
    if (normalized === '1' || normalized === 'normal')
        return 'normal';
    if (normalized === '2' || normalized === 'large')
        return 'large';
    return 'unknown';
}
/** 仅普通群允许展示成员在线状态。 */
export function isIMNormalGroupMode(value) {
    return normalizeIMGroupMode(value) === 'normal';
}
//# sourceMappingURL=group-mode.js.map