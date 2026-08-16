import type { GatewayCall, GatewayDetailCallData, GatewayHTTPClient, GatewayListCallData, GatewayPendingCallData } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from '../sync-context.js';
import type { WebIMSyncMutationQueueDependencies } from '../sync-mutation-queue.js';
import { type IMCallControlSync, type IMCallControlSyncDependencies } from './call-control.js';
/** 通话记录列表支持的服务端接听状态筛选。 */
export type WebIMCallAnswerStatus = 'all' | 'answered' | 'missed';
/** 通话记录缓存分页参数与 RN 列表筛选语义一致。 */
export interface WebIMCallListOptions {
    readonly answerStatus?: WebIMCallAnswerStatus;
    readonly keyword?: string;
    readonly conversationID?: string;
    readonly peerUserID?: string;
    readonly startedAtFromMs?: number;
    readonly startedAtToMs?: number;
    readonly limit?: number;
    readonly offset?: number;
}
/** 通话记录缓存分页结果同时返回当前筛选总数。 */
export interface WebIMCallListResult {
    readonly list: readonly GatewayCall[];
    readonly total: number;
}
/** 跨端远端通话列表分页参数，保留 RN 既有直读语义。 */
export interface IMCallRemoteListOptions {
    readonly answerStatus?: 'answered' | 'missed' | string;
    readonly conversationID?: string;
    readonly limit?: number;
    readonly page?: number;
    readonly page_size?: number;
}
/** 中性本地通话列表参数复用既有 Web 兼容契约。 */
export type IMCallRecordListOptions = WebIMCallListOptions;
/** 中性本地通话列表结果复用既有 Web 兼容契约。 */
export type IMCallRecordListResult = WebIMCallListResult;
/** 平台解析出的 RTC 终结信令，不绑定 RN/Web 消息容器。 */
export interface IMCallTerminalSignal {
    readonly key: string;
    readonly callID: string;
    readonly conversationID?: string;
    readonly callType?: string;
    readonly roomName?: string;
    readonly callerID?: string;
    readonly operatorID?: string;
    readonly status?: string;
    readonly answerStatus?: string;
    readonly reason?: string;
    readonly durationSeconds?: number;
    readonly endedAtMs: number;
}
/** 页面可消费的通话记录缓存、同步和删除能力。 */
export interface WebIMCallSync extends IMCallControlSync {
    listCached(options?: WebIMCallListOptions): Promise<WebIMCallListResult>;
    listRemote(options?: IMCallRemoteListOptions): Promise<GatewayListCallData>;
    getCachedDetail(callID: string): Promise<GatewayCall | null>;
    getDetail(callID: string): Promise<GatewayDetailCallData>;
    getPending(): Promise<GatewayPendingCallData>;
    save(calls: readonly GatewayCall[]): Promise<readonly GatewayCall[]>;
    convergeTerminalSignals(signals: readonly IMCallTerminalSignal[]): Promise<readonly GatewayCall[]>;
    sync(): Promise<WebIMCallListResult>;
    delete(callIDs: readonly string[]): Promise<void>;
}
/** 通话记录能力复用 runtime 的 Gateway、账号库和共享写队列。 */
export interface WebIMCallSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies, Pick<IMCallControlSyncDependencies, 'createClientMessageID' | 'normalizeCallServerURL'> {
    readonly gatewayClient: GatewayHTTPClient;
    readonly enrichCalls?: (calls: readonly GatewayCall[]) => Promise<readonly GatewayCall[]>;
}
/** RN、Web 与 Desktop 共用的通话记录 facade 契约。 */
export type IMCallRecordSync = WebIMCallSync;
/** 跨端通话记录 facade 复用相同 runtime owner 依赖。 */
export type IMCallRecordSyncDependencies = WebIMCallSyncDependencies;
/** 创建 SQLite-first 通话记录 facade。 */
export declare function createIMCallRecordSync(dependencies: IMCallRecordSyncDependencies): IMCallRecordSync;
/** 兼容已发布的 Web 命名；实现与 createIMCallRecordSync 相同。 */
export declare const createWebIMCallSync: typeof createIMCallRecordSync;
/** 将平台无关终结信令映射为当前账号视角的缓存记录。 */
export declare function mapIMCallTerminalSignalToRecord(signal: IMCallTerminalSignal, selfID: string): GatewayCall | null;
//# sourceMappingURL=call-sync.d.ts.map