import type { Message } from '@im28/im-sdk/core';
import { type WebIMMediaSendDependencies, type WebIMMediaSourceOptions } from './message-media-send.js';
import { type WebIMSyncContext } from './sync-context.js';
/** 语音消息最长时长，与 RN 自动停止规则一致。 */
export declare const WEB_IM_AUDIO_MAX_DURATION_SECONDS = 60;
/** 语音发送参数由平台提供真实录音文件和时长。 */
export interface WebIMSendAudioMessageOptions extends WebIMMediaSourceOptions {
    readonly durationSeconds: number;
}
/** 发送语音并复用媒体上传和 optimistic SQLite 状态机。 */
export declare function sendWebIMAudioMessage(context: WebIMSyncContext, options: WebIMSendAudioMessageOptions, dependencies: WebIMMediaSendDependencies): Promise<Message>;
//# sourceMappingURL=message-audio-send.d.ts.map