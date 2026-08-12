/** RTC 过程通知支持的服务端事件类型。 */
export declare const IM_CALL_REALTIME_SIGNAL_KEYS: readonly ["rtc.call.invite", "rtc.call.accept", "rtc.call.reject", "rtc.call.cancel", "rtc.call.hangup", "rtc.call.ended", "rtc.call.summary", "rtc.call.missed", "rtc.call.failed"];
/** RTC 过程通知的稳定事件类型。 */
export type IMCallRealtimeSignalKey = typeof IM_CALL_REALTIME_SIGNAL_KEYS[number];
/** RTC 过程通知允许的媒体类型。 */
export type IMCallRealtimeType = 'audio' | 'video';
/** RN、Web 与 Desktop 共用的 RTC 过程通知投影。 */
export interface IMCallRealtimeSignal {
    readonly key: IMCallRealtimeSignalKey;
    readonly callID: string;
    readonly conversationID: string;
    readonly callType: IMCallRealtimeType;
    readonly mediaType: 'voice' | 'video';
    readonly roomName: string;
    readonly callerID: string;
    readonly operatorID: string;
    readonly status: string;
    readonly reason: string;
    readonly durationSeconds: number;
    readonly e2eeRequired: boolean;
    readonly eventID?: string;
    readonly occurredAtMs?: number;
}
/** 从单条 RN、Web 或 Desktop 消息包装读取第一个合法 RTC 过程通知。 */
export declare function parseIMCallRealtimeSignal(value: unknown): IMCallRealtimeSignal | null;
/** 从 RN、Web 或 Desktop realtime 包装中按输入顺序归一化 RTC 过程通知。 */
export declare function normalizeIMCallRealtimeSignals(value: unknown): IMCallRealtimeSignal[];
//# sourceMappingURL=call-realtime-signal.d.ts.map