import type { GatewayHTTPClient, GatewayRealtimeEvent } from '@im28/im-sdk/core';
/** 跨端统一的用户在线状态投影。 */
export interface IMUserPresence {
    readonly userID: string;
    readonly online: boolean;
    readonly lastSeenAt: string;
}
/** 在线状态监听器只接收已归一化且具有稳定用户 ID 的变化。 */
export type IMUserPresenceListener = (presence: readonly IMUserPresence[]) => void;
/** 初始查询与实时订阅组成一个可取消的观察任务。 */
export interface IMUserPresenceObservation {
    readonly ready: Promise<void>;
    unsubscribe(): void;
}
/** RN、Web 与 Desktop 共用的在线状态查询和实时收敛入口。 */
export interface IMUserPresenceSync {
    list(userIDs: readonly string[]): Promise<readonly IMUserPresence[]>;
    observe(userIDs: readonly string[], listener: IMUserPresenceListener): IMUserPresenceObservation;
    handleRealtimeEvent(event: GatewayRealtimeEvent): boolean;
    clear(): void;
}
/** 在线状态 facade 只依赖共享 Gateway 和动态认证 owner。 */
export interface IMUserPresenceSyncDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly getCurrentUserID: () => string | null;
    readonly reportListenerError?: (cause: unknown) => void;
}
/** 创建不持久化在线状态的共享 presence facade。 */
export declare function createIMUserPresenceSync(dependencies: IMUserPresenceSyncDependencies): IMUserPresenceSync;
//# sourceMappingURL=user-presence.d.ts.map