/** 创建跨端通话记录 facade，并保留已发布的 Web 兼容名称。 */
export { createIMCallRecordSync, createWebIMCallSync, mapIMCallTerminalSignalToRecord, } from './call-sync.js';
/** 导出跨端通话记录契约。 */
export type { IMCallRecordSync, IMCallRecordSyncDependencies, IMCallRecordListOptions, IMCallRecordListResult, IMCallRemoteListOptions, IMCallTerminalSignal, WebIMCallAnswerStatus, WebIMCallListOptions, WebIMCallListResult, WebIMCallSync, WebIMCallSyncDependencies, } from './call-sync.js';
/** 创建 RN、Web 与 Desktop 共用的通话控制 facade。 */
export { createIMCallControlSync, normalizeIMCallServerURL } from './call-control.js';
/** 导出中性通话控制契约。 */
export type { IMCallControlSync, IMCallControlSyncDependencies, IMCallCredential, IMCallTokenResult, IMStartCallOptions, } from './call-control.js';
/** 归一化 RN、Web、Desktop 共用的通话终结消息包装。 */
export { normalizeIMCallTerminalSignals } from './call-terminal-signal.js';
/** 归一化 RN、Web、Desktop 共用的 RTC 全过程通知包装。 */
export { IM_CALL_REALTIME_SIGNAL_KEYS, normalizeIMCallRealtimeSignals, parseIMCallRealtimeSignal, } from './call-realtime-signal.js';
/** 导出 RTC 全过程通知的中性契约。 */
export type { IMCallRealtimeSignal, IMCallRealtimeSignalKey, IMCallRealtimeType, } from './call-realtime-signal.js';
/** 导出来电生命周期的共享状态迁移与 pending 恢复。 */
export { createIMIncomingCallLifecycleState, dismissIMIncomingCall, reconcileIMPendingIncomingCall, reduceIMIncomingCallSignals, resetIMIncomingCallLifecycleState, } from './incoming-call-lifecycle.js';
/** 导出来电生命周期的无凭据公开契约。 */
export type { IMIncomingCall, IMIncomingCallLifecycleState, IMIncomingCallSnapshot, } from './incoming-call-lifecycle.js';
//# sourceMappingURL=index.d.ts.map