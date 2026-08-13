import { type WebIMAudioUploadOptions } from './message-audio-send.js';
import { type GatewayHTTPClient, type Message } from '@im28/im-sdk/core';
import { type IMMediaUploadPort, type WebIMFileUploadOptions, type WebIMImageUploadOptions } from './message-media-send.js';
import { type WebIMVideoUploadOptions } from './message-video-send.js';
import { type WebIMSyncContextDependencies } from './sync-context.js';
import type { WebIMSyncMutationQueueDependencies } from './sync-mutation-queue.js';
/** Gateway 批量发送允许的最大目标数。 */
export declare const IM_BROADCAST_MAX_TARGETS = 50;
/** 群发目标只保存服务端可识别的稳定身份。 */
export interface IMBroadcastTarget {
    readonly kind: 'friend' | 'group';
    readonly targetID: string;
    /** 显式重试时复用同一目标的消息幂等 ID。 */
    readonly clientMsgID?: string;
}
/** 当前群发主链只接收文本和稳定批次身份。 */
export interface IMBroadcastTextOptions {
    readonly targets: readonly IMBroadcastTarget[];
    readonly text: string;
    /** 显式重试时必须复用首次请求的批次 ID。 */
    readonly batchID?: string;
}
/** 图片群发参数复用普通图片发送的 MIME、大小和尺寸约束。 */
export interface IMBroadcastImageOptions extends WebIMImageUploadOptions {
    readonly targets: readonly IMBroadcastTarget[];
    /** 显式重试时必须复用首次请求的批次 ID。 */
    readonly batchID?: string;
}
/** 视频群发参数复用普通视频发送的时长、尺寸和大小约束。 */
export interface IMBroadcastVideoOptions extends WebIMVideoUploadOptions {
    readonly targets: readonly IMBroadcastTarget[];
    /** 显式重试时必须复用首次请求的批次 ID。 */
    readonly batchID?: string;
}
/** 文件群发参数复用普通文件发送的名称、MIME 和大小约束。 */
export interface IMBroadcastFileOptions extends WebIMFileUploadOptions {
    readonly targets: readonly IMBroadcastTarget[];
    /** 显式重试时必须复用首次请求的批次 ID。 */
    readonly batchID?: string;
}
/** 语音群发参数复用普通语音的 MIME、大小和 1–60 秒约束。 */
export interface IMBroadcastAudioOptions extends WebIMAudioUploadOptions {
    readonly targets: readonly IMBroadcastTarget[];
    /** 显式重试时必须复用首次请求的批次 ID。 */
    readonly batchID?: string;
}
/** 单个目标的远端结果和本地缓存完成状态。 */
export interface IMBroadcastTargetResult {
    readonly target: IMBroadcastTarget;
    readonly clientMsgID: string;
    readonly conversationID?: string;
    readonly status: 'sent' | 'failed' | 'unknown';
    readonly cacheState: 'local' | 'remote-only' | 'none';
    readonly message?: Message;
    readonly error?: string;
}
/** 整批结果保留逐目标状态，禁止用顶层成功覆盖 partial failure。 */
export interface IMBroadcastTextResult {
    readonly batchID: string;
    readonly successCount: number;
    readonly failedCount: number;
    readonly unknownCount: number;
    readonly results: readonly IMBroadcastTargetResult[];
}
/** RN、Web 与 Desktop 可共同消费的文本群发 facade。 */
export interface IMMessageBroadcastSync {
    sendText(options: IMBroadcastTextOptions): Promise<IMBroadcastTextResult>;
    sendImage(options: IMBroadcastImageOptions): Promise<IMBroadcastTextResult>;
    sendVideo(options: IMBroadcastVideoOptions): Promise<IMBroadcastTextResult>;
    sendFile(options: IMBroadcastFileOptions): Promise<IMBroadcastTextResult>;
    sendAudio(options: IMBroadcastAudioOptions): Promise<IMBroadcastTextResult>;
}
/** 文本群发依赖当前账号、Gateway、稳定 ID 和共享写队列。 */
export interface IMMessageBroadcastSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly mediaUploadPort?: IMMediaUploadPort;
    readonly createClientMessageID?: () => string;
}
/** 创建绑定当前认证账号的文本群发状态机。 */
export declare function createIMMessageBroadcastSync(dependencies: IMMessageBroadcastSyncDependencies): IMMessageBroadcastSync;
//# sourceMappingURL=message-broadcast.d.ts.map