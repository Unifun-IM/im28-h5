import type { GatewayClientMessageBody } from '@im28/im-sdk/core';
import type { IMPreparedMediaUpload, WebIMMediaSendDependencies } from './message-media-send.js';
/** 媒体群发只依赖平台上传端口，不创建单会话 optimistic 消息。 */
export type IMBroadcastMediaUploadDependencies = Pick<WebIMMediaSendDependencies, 'mediaUploadPort'>;
/** 上传一次群发媒体并返回通过严格重放校验的 Gateway body。 */
export declare function uploadIMBroadcastMedia(definition: IMPreparedMediaUpload, dependencies: IMBroadcastMediaUploadDependencies): Promise<GatewayClientMessageBody>;
//# sourceMappingURL=message-broadcast-media.d.ts.map