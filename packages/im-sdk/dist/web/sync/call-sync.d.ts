import type { GatewayCall, GatewayHTTPClient } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from './sync-context.js';
import type { WebIMSyncMutationQueueDependencies } from './sync-mutation-queue.js';
/** 通话记录列表支持的服务端接听状态筛选。 */
export type WebIMCallAnswerStatus = 'all' | 'answered' | 'missed';
/** 通话记录缓存分页参数与 RN 列表筛选语义一致。 */
export interface WebIMCallListOptions {
    readonly answerStatus?: WebIMCallAnswerStatus;
    readonly keyword?: string;
    readonly limit?: number;
    readonly offset?: number;
}
/** 通话记录缓存分页结果同时返回当前筛选总数。 */
export interface WebIMCallListResult {
    readonly list: readonly GatewayCall[];
    readonly total: number;
}
/** 页面可消费的通话记录缓存、同步和删除能力。 */
export interface WebIMCallSync {
    listCached(options?: WebIMCallListOptions): Promise<WebIMCallListResult>;
    sync(): Promise<WebIMCallListResult>;
    delete(callIDs: readonly string[]): Promise<void>;
}
/** 通话记录能力复用 runtime 的 Gateway、账号库和共享写队列。 */
export interface WebIMCallSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
}
/** 创建 SQLite-first 通话记录 facade。 */
export declare function createWebIMCallSync(dependencies: WebIMCallSyncDependencies): WebIMCallSync;
//# sourceMappingURL=call-sync.d.ts.map