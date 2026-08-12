import type { WebIMCallMediaPort } from './browser-call-session.js';
/** H5 通话页提供的三个媒体承载元素。 */
export interface LiveKitCallMediaElements {
    readonly audioElement: HTMLAudioElement | null;
    readonly remoteVideoElement: HTMLVideoElement | null;
    readonly localVideoElement: HTMLVideoElement | null;
}
/** 在稳定媒体端口上增加浏览器元素绑定能力。 */
export interface LiveKitCallMediaPort extends WebIMCallMediaPort {
    setMediaElements(elements: LiveKitCallMediaElements): void;
}
/** 描述 LiveKit 远端成员对媒体端口开放的稳定身份。 */
export interface LiveKitParticipantPort {
    readonly identity: string;
}
/** 描述 LiveKit 本地成员的媒体开关能力。 */
export interface LiveKitLocalParticipantPort {
    setMicrophoneEnabled(enabled: boolean): Promise<unknown>;
    setCameraEnabled(enabled: boolean): Promise<unknown>;
}
/** 隔离 LiveKit Room 版本细节，测试无需创建真实 WebRTC 连接。 */
export interface LiveKitRoomPort {
    readonly localParticipant: LiveKitLocalParticipantPort;
    readonly remoteParticipants: ReadonlyMap<string, LiveKitParticipantPort>;
    readonly canPlaybackAudio: boolean;
    connect(serverURL: string, token: string): Promise<void>;
    disconnect(stopTracks?: boolean): Promise<void>;
    startAudio(): Promise<void>;
    on(event: string, listener: (...args: unknown[]) => void): unknown;
    off(event: string, listener: (...args: unknown[]) => void): unknown;
}
/** 允许测试注入 Room，同时生产默认创建真实 LiveKit Room。 */
export interface LiveKitCallMediaPortDependencies {
    readonly createRoom?: () => LiveKitRoomPort | Promise<LiveKitRoomPort>;
}
/** 创建只存在于 `/web` 构建入口的真实 LiveKit 媒体端口。 */
export declare function createLiveKitCallMediaPort(dependencies?: LiveKitCallMediaPortDependencies): LiveKitCallMediaPort;
//# sourceMappingURL=livekit-call-media-port.d.ts.map