/** Web IM auth 与 realtime 合并后的可观察 runtime 状态。 */
export type WebIMRuntimeState = 'anonymous' | 'authenticating' | 'authenticated' | 'connecting' | 'online' | 'reconnecting';
/** 能驱动 runtime 状态变化的显式事件。 */
export type WebIMRuntimeEvent = 'auth_started' | 'auth_restored' | 'auth_succeeded' | 'auth_failed' | 'realtime_connecting' | 'realtime_connected' | 'realtime_disconnected' | 'token_expired' | 'signed_out';
/** 根据唯一状态表计算下一状态，非法转换必须显式失败。 */
export declare function transitionWebIMRuntimeState(currentState: WebIMRuntimeState, event: WebIMRuntimeEvent): WebIMRuntimeState;
//# sourceMappingURL=runtime-lifecycle.d.ts.map