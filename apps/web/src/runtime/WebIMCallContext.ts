import { createContext, useContext } from 'react';
import type {
  LiveKitCallMediaElements,
  WebIMIncomingCallSnapshot,
  WebIMOutgoingCallSnapshot,
} from '@im28/im-sdk/web';

/** H5 当前单次通话需要展示的非敏感资料。 */
export interface WebIMActiveCallView {
  readonly conversationID: string;
  readonly peerName: string;
  readonly peerAvatarURL: string;
  readonly mediaType: 'audio' | 'video';
  readonly direction: 'incoming' | 'outgoing';
}

/** 从 RN 已有入口发起 Web 通话所需的展示参数。 */
export interface WebIMStartOutgoingCallOptions extends Omit<WebIMActiveCallView, 'direction'> {}

/** 活动通话页面消费的呼入或呼出无凭据媒体快照。 */
export type WebIMActiveCallSnapshot = WebIMOutgoingCallSnapshot | WebIMIncomingCallSnapshot;

/** 页面消费的全局 Web 通话上下文。 */
export interface WebIMCallContextValue {
  readonly activeCall: WebIMActiveCallView | null;
  readonly snapshot: WebIMActiveCallSnapshot | null;
  readonly error: string | null;
  startOutgoing(options: WebIMStartOutgoingCallOptions): Promise<void>;
  retryMedia(): Promise<void>;
  setMicrophoneEnabled(enabled: boolean): Promise<void>;
  setCameraEnabled(enabled: boolean): Promise<void>;
  resumeAudioPlayback(): Promise<void>;
  setMediaElements(elements: LiveKitCallMediaElements): void;
  end(): Promise<void>;
}

/** Context 缺省值只用于识别 Provider 漏装。 */
export const WebIMCallContext = createContext<WebIMCallContextValue | null>(null);

/** 读取全局 Web 通话 owner。 */
export function useWebIMCall(): WebIMCallContextValue {
  /** context 缺失表示 App composition 错误。 */
  const context = useContext(WebIMCallContext);
  if (!context) throw new Error('useWebIMCall must be used inside WebIMCallProvider.');
  return context;
}
