import type { GatewayClientMessageBody, Message } from '@im28/im-sdk/core';
import { type WebIMMessageSendDependencies } from './message-send-state.js';
import { type WebIMSyncContext } from '../sync-context.js';
import type { WebIMSyncMutationQueue } from '../sync-mutation-queue.js';
/** 图片消息允许的单文件最大字节数。 */
export declare const WEB_IM_IMAGE_MAX_BYTES: number;
/** 普通文件消息允许的单文件最大字节数。 */
export declare const WEB_IM_FILE_MAX_BYTES: number;
/** 平台上传端口消费的 opaque source 与稳定文件元数据。 */
export interface IMMediaUploadInput {
    readonly source: unknown;
    readonly name: string;
    readonly mimeType: string;
    readonly size: number;
    readonly extension: string;
}
/** 平台上传成功后返回 Gateway message body 所需对象身份。 */
export interface IMMediaUploadResult {
    readonly objectKey: string;
    readonly url: string;
}
/** RN/Web/Desktop 分别实现本地文件到远端对象的 I/O。 */
export interface IMMediaUploadPort {
    upload(input: IMMediaUploadInput): Promise<IMMediaUploadResult>;
}
/** 图片、视频和普通文件共用的 opaque source 元数据。 */
export interface WebIMMediaSourceOptions {
    readonly conversationID: string;
    readonly source: unknown;
    readonly name: string;
    readonly mimeType: string;
    readonly size: number;
    readonly onSending?: (message: Message) => void;
}
/** 图片发送参数不泄漏浏览器 File 类型到 shared sync。 */
export interface WebIMSendImageMessageOptions extends WebIMMediaSourceOptions {
    readonly width?: number;
    readonly height?: number;
}
/** 图片上传定义不要求单会话身份，可供普通发送和批量发送共同消费。 */
export type WebIMImageUploadOptions = Omit<WebIMSendImageMessageOptions, 'conversationID' | 'onSending'>;
/** 普通文件发送参数保留原始名称、MIME 与精确字节数。 */
export type WebIMSendFileMessageOptions = WebIMMediaSourceOptions;
/** 文件上传定义不携带单会话状态回调。 */
export type WebIMFileUploadOptions = Omit<WebIMSendFileMessageOptions, 'conversationID' | 'onSending'>;
/** 媒体发送复用的账号、队列、上传与 Gateway owners。 */
export interface WebIMMediaSendDependencies extends WebIMMessageSendDependencies {
    readonly mutationQueue: WebIMSyncMutationQueue;
    readonly mediaUploadPort?: IMMediaUploadPort;
}
/** 共享媒体种类只用于 MIME 与错误语义校验。 */
export type WebIMMediaKind = 'image' | 'audio' | 'video' | 'file';
/** 单聊发送和群发共同消费的已校验媒体上传定义。 */
export interface IMPreparedMediaUpload {
    readonly contentType: 102 | 103 | 104 | 105;
    readonly input: IMMediaUploadInput;
    readonly localBody: GatewayClientMessageBody;
    readonly createRemoteBody: (result: IMMediaUploadResult) => GatewayClientMessageBody;
}
/** 发送一张图片并跨上传阶段收敛本地消息状态。 */
export declare function sendWebIMImageMessage(context: WebIMSyncContext, options: WebIMSendImageMessageOptions, dependencies: WebIMMediaSendDependencies): Promise<Message>;
/** 构造可由单聊或群发复用的图片上传定义。 */
export declare function prepareWebIMImageUpload(options: WebIMImageUploadOptions): IMPreparedMediaUpload;
/** 发送一个普通文件并保留可重读的本地元数据。 */
export declare function sendWebIMFileMessage(context: WebIMSyncContext, options: WebIMSendFileMessageOptions, dependencies: WebIMMediaSendDependencies): Promise<Message>;
/** 构造可由单聊或群发复用的普通文件上传定义。 */
export declare function prepareWebIMFileUpload(options: WebIMFileUploadOptions): IMPreparedMediaUpload;
/** 归一化文件元数据并执行种类对应的大小约束。 */
export declare function normalizeWebIMMediaInput(options: Omit<WebIMMediaSourceOptions, 'conversationID' | 'onSending'>, maxBytes: number, kind: WebIMMediaKind): IMMediaUploadInput;
/** 判断图片尺寸是否可安全写入 Gateway body。 */
export declare function isPositiveMediaDimension(value: number | undefined): value is number;
//# sourceMappingURL=message-media-send.d.ts.map