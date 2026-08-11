import type { GatewayClientMessageBody, Message } from '@im28/im-sdk/core';
/** 已上传且可直接重放 Gateway body 的媒体消息类型。 */
export declare const WEB_IM_UPLOADED_MEDIA_RETRY_CONTENT_TYPES: readonly [102, 103, 104, 105];
/** 判断失败消息是否保存了完整且安全的已上传媒体 checkpoint。 */
export declare function canRetryWebIMUploadedMediaMessage(message: Message): boolean;
/** 从 SQLite payload 严格恢复可直接交给 Gateway 的媒体 body。 */
export declare function normalizeWebIMUploadedMediaBody(contentType: number, payload: unknown): GatewayClientMessageBody;
//# sourceMappingURL=message-media-retry.d.ts.map