import type { IMCallControlSync } from '../../../sync/call-control.js';
import type { IMIncomingCall } from '../../../sync/incoming-call-lifecycle.js';
import type { WebIMCallMediaSession, WebIMCallMediaSnapshot } from './browser-call-session.js';
/** H5 接听页消费的无凭据来电媒体快照。 */
export interface WebIMIncomingCallSnapshot extends WebIMCallMediaSnapshot {
    readonly callID: string;
    readonly conversationID: string;
    readonly answering: boolean;
    readonly ending: boolean;
}
/** Web 接听编排只依赖 shared 控制面、已验证来电和延迟媒体工厂。 */
export interface WebIMIncomingCallDependencies {
    readonly calls: IMCallControlSync;
    readonly call: IMIncomingCall;
    readonly createMediaSession: () => WebIMCallMediaSession;
}
/** H5 全局 Provider 消费的单次接听生命周期。 */
export interface WebIMIncomingCallSession {
    answer(): Promise<void>;
    reject(): Promise<void>;
    retryMedia(): Promise<void>;
    setMicrophoneEnabled(enabled: boolean): Promise<void>;
    setCameraEnabled(enabled: boolean): Promise<void>;
    resumeAudioPlayback(): Promise<void>;
    handleRemoteTerminal(): Promise<void>;
    end(reason?: string): Promise<void>;
    getSnapshot(): WebIMIncomingCallSnapshot;
    subscribe(listener: () => void): () => void;
    dispose(): Promise<void>;
}
/** 创建接听编排，媒体凭据仅在 answer/retry 异步栈内流转。 */
export declare function createWebIMIncomingCall(dependencies: WebIMIncomingCallDependencies): WebIMIncomingCallSession;
//# sourceMappingURL=browser-incoming-call.d.ts.map