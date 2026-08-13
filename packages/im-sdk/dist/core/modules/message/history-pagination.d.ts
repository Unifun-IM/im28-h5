import type { Message } from '../../core/types.js';
/** 合并后的历史窗口及可继续向更早端拉取的精确游标。 */
export interface IMMessageHistoryWindow {
    readonly messages: readonly Message[];
    readonly previousCursor?: string;
}
/** 合并当前窗口与新拉取页，按稳定身份去重并保持 newest-first。 */
export declare function mergeIMMessageHistoryWindow(current: readonly Message[], incoming: readonly Message[]): readonly Message[];
/** 从当前窗口最早有效 seq 计算上一页游标，始终保留 uint64 精度。 */
export declare function getIMPreviousMessageHistoryCursor(messages: readonly Message[], fallbackCursor?: string): string | undefined;
//# sourceMappingURL=history-pagination.d.ts.map