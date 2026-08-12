import type { GatewayPendingCallData } from '@im28/im-sdk/core';
import type { IMCallRealtimeSignal } from './call-realtime-signal.js';
/** 来电生命周期对 UI 暴露的非敏感通话身份。 */
export interface IMIncomingCall {
    readonly callID: string;
    readonly conversationID: string;
    readonly roomName: string;
    readonly callerID: string;
    readonly callType: 'audio' | 'video';
    readonly mediaType: 'voice' | 'video';
    readonly e2eeRequired: boolean;
    readonly source: 'realtime' | 'pending';
}
/** 来电生命周期公开快照只表达是否需要展示响铃态。 */
export interface IMIncomingCallSnapshot {
    readonly phase: 'idle' | 'ringing';
    readonly call: IMIncomingCall | null;
    readonly revision: number;
}
/** 来电状态机内部状态保留有界去重与终态集合。 */
export interface IMIncomingCallLifecycleState {
    readonly snapshot: IMIncomingCallSnapshot;
    readonly seenSignalIDs: readonly string[];
    readonly closedCallIDs: readonly string[];
}
/** 创建不包含任何账号或通话信息的来电初始状态。 */
export declare function createIMIncomingCallLifecycleState(): IMIncomingCallLifecycleState;
/** 重置账号绑定的来电、去重和终态状态。 */
export declare function resetIMIncomingCallLifecycleState(state: IMIncomingCallLifecycleState): IMIncomingCallLifecycleState;
/** 按服务端到达顺序应用一批 RTC 过程通知。 */
export declare function reduceIMIncomingCallSignals(state: IMIncomingCallLifecycleState, signals: readonly IMCallRealtimeSignal[], currentUserID: string): IMIncomingCallLifecycleState;
/** 将 Gateway pending 结果恢复为与实时邀请相同的响铃快照。 */
export declare function reconcileIMPendingIncomingCall(state: IMIncomingCallLifecycleState, pending: GatewayPendingCallData, currentUserID: string): IMIncomingCallLifecycleState;
/** 收起本地已处理的指定来电，但允许后续 Gateway pending 重新校验。 */
export declare function dismissIMIncomingCall(state: IMIncomingCallLifecycleState, callID: string): IMIncomingCallLifecycleState;
//# sourceMappingURL=incoming-call-lifecycle.d.ts.map