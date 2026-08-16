/** 跨端可消费的标准群模式。 */
export type IMGroupMode = 'normal' | 'large' | 'unknown';
/** 将 Gateway/RN 历史群模式值归一化为稳定枚举。 */
export declare function normalizeIMGroupMode(value: unknown): IMGroupMode;
/** 仅普通群允许展示成员在线状态。 */
export declare function isIMNormalGroupMode(value: unknown): boolean;
//# sourceMappingURL=group-mode.d.ts.map