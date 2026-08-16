import type { IMCallControlSync, IMStartCallOptions } from '../../../sync/call/index.js';
import type { WebIMCallMediaSession, WebIMCallMediaSnapshot } from './browser-call-session.js';
/** 暴露给 H5 通话页且不含媒体 token 的呼出快照。 */
export interface WebIMOutgoingCallSnapshot extends WebIMCallMediaSnapshot {
    readonly callID: string | null;
    readonly conversationID: string | null;
    readonly ending: boolean;
}
/** Web 呼出生命周期只依赖 shared 控制面与浏览器媒体会话。 */
export interface WebIMOutgoingCallDependencies {
    readonly calls: IMCallControlSync;
    readonly mediaSession: WebIMCallMediaSession;
}
/** H5 页面消费的单次呼出生命周期。 */
export interface WebIMOutgoingCall {
    start(options: IMStartCallOptions): Promise<void>;
    retryMedia(): Promise<void>;
    setMicrophoneEnabled(enabled: boolean): Promise<void>;
    setCameraEnabled(enabled: boolean): Promise<void>;
    resumeAudioPlayback(): Promise<void>;
    handleRemoteTerminal(): Promise<void>;
    end(reason?: string): Promise<void>;
    getSnapshot(): WebIMOutgoingCallSnapshot;
    subscribe(listener: () => void): () => void;
    dispose(): Promise<void>;
}
/** 创建 Web-only 呼出编排，H5 页面不持有凭据或回滚分支。 */
export declare function createWebIMOutgoingCall(dependencies: WebIMOutgoingCallDependencies): WebIMOutgoingCall;
//# sourceMappingURL=browser-outgoing-call.d.ts.map