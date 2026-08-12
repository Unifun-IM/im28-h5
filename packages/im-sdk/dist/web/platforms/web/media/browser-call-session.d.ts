import type { IMCallCredential } from '../../../sync/call-control.js';
/** 描述浏览器通话会话需要发布的媒体类型。 */
export type WebIMCallMediaType = 'audio' | 'video';
/** 描述浏览器通话会话的连接阶段。 */
export type WebIMCallMediaState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'failed';
/** 描述具体媒体引擎向会话层上报的事件。 */
export type WebIMCallMediaPortEvent = {
    type: 'participant_connected';
    participantID: string;
} | {
    type: 'participant_disconnected';
    participantID: string;
} | {
    type: 'reconnecting';
} | {
    type: 'reconnected';
} | {
    type: 'disconnected';
    reason?: string;
} | {
    type: 'media_devices_error';
    cause: unknown;
} | {
    type: 'audio_playback_blocked';
} | {
    type: 'audio_playback_ready';
};
/** 隔离 livekit-client 等浏览器媒体引擎的最小端口。 */
export interface WebIMCallMediaPort {
    connect(credential: IMCallCredential): Promise<void>;
    disconnect(): Promise<void>;
    setMicrophoneEnabled(enabled: boolean): Promise<void>;
    setCameraEnabled(enabled: boolean): Promise<void>;
    startAudioPlayback(): Promise<void>;
    subscribe(listener: (event: WebIMCallMediaPortEvent) => void): () => void;
}
/** 暴露给 H5 UI 的浏览器通话只读快照。 */
export interface WebIMCallMediaSnapshot {
    state: WebIMCallMediaState;
    mediaType: WebIMCallMediaType | null;
    microphoneEnabled: boolean;
    cameraEnabled: boolean;
    participantIDs: readonly string[];
    audioPlaybackBlocked: boolean;
    error: unknown;
}
/** 描述启动浏览器媒体会话所需的鉴权结果与媒体类型。 */
export interface WebIMCallMediaStartOptions {
    credential: IMCallCredential;
    mediaType: WebIMCallMediaType;
}
/** 定义 H5 UI 消费的浏览器通话媒体会话。 */
export interface WebIMCallMediaSession {
    start(options: WebIMCallMediaStartOptions): Promise<void>;
    stop(): Promise<void>;
    setMicrophoneEnabled(enabled: boolean): Promise<void>;
    setCameraEnabled(enabled: boolean): Promise<void>;
    resumeAudioPlayback(): Promise<void>;
    getSnapshot(): WebIMCallMediaSnapshot;
    subscribe(listener: () => void): () => void;
    dispose(): Promise<void>;
}
/** 创建与具体媒体引擎解耦的浏览器通话会话状态机。 */
export declare const createWebIMCallMediaSession: (port: WebIMCallMediaPort) => WebIMCallMediaSession;
//# sourceMappingURL=browser-call-session.d.ts.map