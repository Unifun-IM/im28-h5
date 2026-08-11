import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { ChatMediaPreviewOverlay } from './ChatMediaPreviewOverlay.js';
import type { ChatMessageView } from './chat-message-view.js';
import {
  getChatAudioURL,
  getChatMediaPreview,
  type ChatMediaPreview,
} from './chat-media-view.js';
import './chat-media-interaction.css';

/** 浏览器音频元素的真实生命周期状态。 */
export type ChatAudioPlaybackState = 'idle' | 'loading' | 'playing' | 'error';

/** 消息气泡可调用的唯一媒体交互接口。 */
interface ChatMediaInteractionValue {
  readonly activeAudioMessageID: string;
  readonly audioState: ChatAudioPlaybackState;
  readonly openPreview: (view: ChatMessageView) => void;
  readonly toggleAudio: (messageID: string, view: ChatMessageView) => void;
}

/** Provider 属性只包含当前聊天路由的消息树。 */
interface ChatMediaInteractionProviderProps {
  readonly children: ReactNode;
}

/** 未挂载 Provider 时保持 fail-closed 的空交互上下文。 */
const ChatMediaInteractionContext = createContext<ChatMediaInteractionValue | null>(
  null,
);

/** 为单个聊天路由提供唯一音频实例和全屏媒体层。 */
export function ChatMediaInteractionProvider({
  children,
}: ChatMediaInteractionProviderProps) {
  // audioRef 持有页面内唯一 HTML 音频实例。
  const audioRef = useRef<HTMLAudioElement>(null);
  // playbackSequence 使较早的异步 play 结果不能覆盖新操作。
  const playbackSequence = useRef(0);
  // preview 是当前短生命周期全屏媒体状态。
  const [preview, setPreview] = useState<ChatMediaPreview | null>(null);
  // activeAudioMessageID 标识唯一正在加载或播放的语音气泡。
  const [activeAudioMessageID, setActiveAudioMessageID] = useState('');
  // audioState 只反映真实音频元素状态，不制造成功态。
  const [audioState, setAudioState] = useState<ChatAudioPlaybackState>('idle');

  /** 停止当前音频并重置可见状态。 */
  const stopAudio = useCallback(() => {
    // audio 是当前路由持有的唯一媒体元素。
    const audio = audioRef.current;
    playbackSequence.current += 1;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setActiveAudioMessageID('');
    setAudioState('idle');
  }, []);

  /** 打开合法图片或视频预览，缺失地址时不改变状态。 */
  const openPreview = useCallback((view: ChatMessageView) => {
    // nextPreview 只可能来自安全 URL 投影。
    const nextPreview = getChatMediaPreview(view);
    if (nextPreview) setPreview(nextPreview);
  }, []);

  /** 切换单条语音，切换消息时先停止上一条再播放。 */
  const toggleAudio = useCallback(
    (messageID: string, view: ChatMessageView) => {
      // url 是已通过协议白名单的真实语音地址。
      const url = getChatAudioURL(view);
      // audio 是页面内唯一播放 owner。
      const audio = audioRef.current;
      if (!messageID || !url || !audio) return;
      if (
        activeAudioMessageID === messageID &&
        (audioState === 'loading' || audioState === 'playing')
      ) {
        stopAudio();
        return;
      }
      playbackSequence.current += 1;
      // sequence 锁定本次异步播放结果的所有权。
      const sequence = playbackSequence.current;
      audio.pause();
      audio.currentTime = 0;
      audio.src = url;
      setActiveAudioMessageID(messageID);
      setAudioState('loading');
      void audio.play().then(
        () => {
          if (playbackSequence.current === sequence) setAudioState('playing');
        },
        () => {
          if (playbackSequence.current === sequence) setAudioState('error');
        },
      );
    },
    [activeAudioMessageID, audioState, stopAudio],
  );

  useEffect(() => {
    return () => {
      // audio 在路由卸载时必须停止并释放网络资源。
      const audio = audioRef.current;
      playbackSequence.current += 1;
      if (!audio) return;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, []);

  useEffect(() => {
    if (!preview) return;
    /** Escape 与 RN hardware back 一致地关闭短生命周期预览层。 */
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setPreview(null);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [preview]);

  // value 只在媒体状态或稳定操作发生变化时更新气泡消费者。
  const value = useMemo<ChatMediaInteractionValue>(
    () => ({
      activeAudioMessageID,
      audioState,
      openPreview,
      toggleAudio,
    }),
    [activeAudioMessageID, audioState, openPreview, toggleAudio],
  );

  return (
    <ChatMediaInteractionContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        className="rn-chat-audio-runtime"
        preload="none"
        onEnded={stopAudio}
        onError={() => setAudioState('error')}
      />
      {preview ? (
        <ChatMediaPreviewOverlay
          preview={preview}
          onClose={() => setPreview(null)}
        />
      ) : null}
    </ChatMediaInteractionContext.Provider>
  );
}

/** 供消息气泡读取当前聊天页唯一媒体交互 owner。 */
export function useChatMediaInteraction(): ChatMediaInteractionValue {
  // value 为 null 表示组件越过了聊天页 Provider 边界。
  const value = useContext(ChatMediaInteractionContext);
  if (!value) {
    throw new Error('Chat media interaction provider is unavailable.');
  }
  return value;
}
