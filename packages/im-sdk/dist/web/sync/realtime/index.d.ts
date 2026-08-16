/** 导出跨端共用的 realtime 事件持久化 facade。 */
export { createIMRealtimeSync, createWebIMRealtimeSync } from './realtime-sync.js';
/** 导出 realtime 事件持久化契约。 */
export type { IMRealtimeSync, IMRealtimeSyncDependencies, WebIMRealtimeSync, WebIMRealtimeSyncDependencies, } from './realtime-sync.js';
/** 导出 realtime 消息缺口恢复与缓存收敛 facade。 */
export { createIMRealtimeMessageSync } from './realtime-message-sync.js';
/** 导出 realtime 消息收敛契约。 */
export type { IMRealtimeMessageSync, IMRealtimeMessageSyncDependencies, IMRealtimeMessageSyncResult, } from './realtime-message-sync.js';
/** 导出跨端共用的 realtime 消息 wrapper 归一化能力。 */
export { normalizeIMRealtimeMessages } from './realtime-message-normalization.js';
/** 导出 realtime 缺口恢复标记判断能力。 */
export { hasDegradedMarker } from './realtime-event-data.js';
//# sourceMappingURL=index.d.ts.map