import type { Message } from '@im28/im-sdk/core';
import { type IMPreparedMediaUpload, type WebIMMediaSendDependencies, type WebIMMediaSourceOptions } from './message-media-send.js';
import type { WebIMSyncContext } from '../sync-context.js';
/** 视频消息允许的单文件最大字节数，与 RN 生产约束一致。 */
export declare const WEB_IM_VIDEO_MAX_BYTES: number;
/** 视频发送参数由平台提供真实媒体元数据，不携带平台文件类型。 */
export interface WebIMSendVideoMessageOptions extends WebIMMediaSourceOptions {
    readonly durationSeconds: number;
    readonly width: number;
    readonly height: number;
}
/** 视频上传定义只保存跨客户端一致的媒体元数据。 */
export type WebIMVideoUploadOptions = Omit<WebIMSendVideoMessageOptions, 'conversationID' | 'onSending'>;
/** 发送视频并复用媒体上传和 optimistic SQLite 状态机。 */
export declare function sendWebIMVideoMessage(context: WebIMSyncContext, options: WebIMSendVideoMessageOptions, dependencies: WebIMMediaSendDependencies): Promise<Message>;
/** 构造可由单聊或群发复用的视频上传定义。 */
export declare function prepareWebIMVideoUpload(options: WebIMVideoUploadOptions): IMPreparedMediaUpload;
/** 构造与 RN 一致的 OSS 7 秒视频快照 URL。 */
export declare function buildWebIMVideoSnapshotURL(videoURL: string, dimensions: {
    readonly width?: number;
    readonly height?: number;
}): string;
//# sourceMappingURL=message-video-send.d.ts.map