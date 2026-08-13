import type { Message } from '../../core/types.js';
/** 查找下一条未播放 incoming 语音所需的平台中立输入。 */
export interface IMNextAudioMessageOptions {
    readonly messages: readonly Message[];
    readonly currentMessageID: string;
    readonly playedMessageIDs: ReadonlySet<string>;
    readonly isPlayable: (message: Message) => boolean;
}
/** 返回消息可用于播放偏好的稳定身份，服务端 ID 优先。 */
export declare function getIMAudioMessageIdentity(message: Message): string;
/** 判断消息 localEx 是否带有 RN 兼容的本地已播放标记。 */
export declare function isIMAudioMessagePlayedLocally(message: Message): boolean;
/** 按消息阅读顺序查找当前语音后的下一条未播放 incoming 语音。 */
export declare function findNextIMUnplayedIncomingAudioMessage(options: IMNextAudioMessageOptions): Message | null;
//# sourceMappingURL=audio-playback.d.ts.map