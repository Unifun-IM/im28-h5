import type { GatewayHTTPClient } from '@im28/im-sdk/core';
import { type WebIMSyncContext, type WebIMSyncContextDependencies } from './sync-context.js';
import type { WebIMSyncMutationQueueDependencies } from './sync-mutation-queue.js';
/** 群生命周期动作仅允许普通退群和群主解散。 */
export type IMGroupLifecycleOperation = 'leave' | 'dismiss';
/** 退群可显式请求服务端清理当前成员历史消息。 */
export interface IMLeaveGroupOptions {
    readonly groupID: string;
    readonly clearHistory?: boolean;
}
/** 解散群只接受稳定群身份。 */
export interface IMDismissGroupOptions {
    readonly groupID: string;
}
/** 远端成功后的本地缓存状态用于阻止破坏性动作重放。 */
export type IMGroupLifecycleCacheState = 'local' | 'remote-only';
/** 生命周期结果显式返回动作、本地状态和已删除会话边界。 */
export interface IMGroupLifecycleResult {
    readonly operation: IMGroupLifecycleOperation;
    readonly groupID: string;
    readonly cacheState: IMGroupLifecycleCacheState;
    readonly removedConversationIDs: readonly string[];
}
/** 群生命周期 facade 复用认证数据库、Gateway 和全局写队列。 */
export interface IMGroupLifecycleSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
}
/** 群生命周期的唯一中性业务入口。 */
export interface IMGroupLifecycleSync {
    leave(options: IMLeaveGroupOptions): Promise<IMGroupLifecycleResult>;
    dismiss(options: IMDismissGroupOptions): Promise<IMGroupLifecycleResult>;
}
/** 创建 RN、Web、Desktop 可复用的破坏性群生命周期 facade。 */
export declare function createIMGroupLifecycleSync(dependencies: IMGroupLifecycleSyncDependencies): IMGroupLifecycleSync;
/** 校验非群主退群权限并执行唯一一次 Gateway 写入。 */
export declare function leaveIMGroup(context: WebIMSyncContext, options: IMLeaveGroupOptions, gatewayClient: GatewayHTTPClient): Promise<IMGroupLifecycleResult>;
/** 校验群主解散权限并执行唯一一次 Gateway 写入。 */
export declare function dismissIMGroup(context: WebIMSyncContext, options: IMDismissGroupOptions, gatewayClient: GatewayHTTPClient): Promise<IMGroupLifecycleResult>;
//# sourceMappingURL=group-lifecycle.d.ts.map