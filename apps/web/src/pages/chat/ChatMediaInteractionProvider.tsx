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
import {
  findNextIMUnplayedIncomingAudioMessage,
  getIMAudioMessageIdentity,
  isIMAudioMessagePlayedLocally,
  type Message,
} from '@im28/im-sdk/web';

import { ChatMediaPreviewOverlay } from './ChatMediaPreviewOverlay.js';
import type { ChatMessageView } from './chat-message-view.js';
import {
  getChatAudioURL,
  getChatMediaPreview,
  type ChatMediaPreview,
} from './chat-media-view.js';
import { getChatMessageView } from './chat-message-view.js';
import {
  readChatAudioPlayedMessageIDs,
  writeChatAudioPlayedMessageIDs,
} from './chat-audio-played-preference.js';
import './chat-media-interaction.css';

/** 浏览器音频元素的真实生命周期状态。 */
export type ChatAudioPlaybackState = 'idle' | 'loading' | 'playing' | 'error';

/** 消息气泡可调用的唯一媒体交互接口。 */
interface ChatMediaInteractionValue {
  readonly activeAudioMessageID: string;
  readonly audioState: ChatAudioPlaybackState;
  readonly openPreview: (view: ChatMessageView) => void;
  readonly isAudioPlayed: (message: Message) => boolean;
  readonly toggleAudio: (message: Message, view: ChatMessageView) => void;
}

/** Provider 属性只包含当前聊天路由的消息树。 */
interface ChatMediaInteractionProviderProps {
  readonly children: ReactNode;
  readonly userID?: string;
  readonly conversationID?: string;
  readonly messages?: readonly Message[];
  readonly isGroup?: boolean;
}

/** 未挂载 Provider 时保持 fail-closed 的空交互上下文。 */
const ChatMediaInteractionContext = createContext<ChatMediaInteractionValue | null>(
  null,
);

/** 为单个聊天路由提供唯一音频实例和全屏媒体层。 */
export function ChatMediaInteractionProvider({
  children,
  userID = '',
  conversationID = '',
  messages = [],
  isGroup = false,
}: ChatMediaInteractionProviderProps) {
  // audioRef 持有页面内唯一 HTML 音频实例。
  const audioRef = useRef<HTMLAudioElement>(null);
  // playbackSequence 使较早的异步 play 结果不能覆盖新操作。
  const playbackSequence = useRef(0);
  // messagesRef 保存从旧到新的当前可见消息窗口供自动连播选择。
  const messagesRef = useRef<readonly Message[]>([]);
  // playedMessageIDsRef 为 ended 回调提供同步更新后的本地已播放集合。
  const playedMessageIDsRef = useRef<ReadonlySet<string>>(new Set());
  // playAudioMessageRef 允许 ended 回调复用唯一真实播放 owner。
  const playAudioMessageRef = useRef<((message: Message, view?: ChatMessageView) => void) | null>(null);
  // preview 是当前短生命周期全屏媒体状态。
  const [preview, setPreview] = useState<ChatMediaPreview | null>(null);
  // activeAudioMessageID 标识唯一正在加载或播放的语音气泡。
  const [activeAudioMessageID, setActiveAudioMessageID] = useState('');
  // audioState 只反映真实音频元素状态，不制造成功态。
  const [audioState, setAudioState] = useState<ChatAudioPlaybackState>('idle');
  // playedMessageIDs 投影当前账号会话的本地语音已播放偏好。
  const [playedMessageIDs, setPlayedMessageIDs] = useState<ReadonlySet<string>>(
    () => readChatAudioPlayedMessageIDs(userID, conversationID),
  );

  useEffect(() => {
    /** restored 在路由或账号变化时切换到对应偏好。 */
    const restored = readChatAudioPlayedMessageIDs(userID, conversationID);
    playedMessageIDsRef.current = restored;
    setPlayedMessageIDs(restored);
  }, [conversationID, userID]);

  useEffect(() => {
    /** ordered 把 Repository newest-first 窗口转换为 RN 阅读顺序。 */
    const ordered = [...messages].reverse();
    messagesRef.current = ordered;
  }, [messages]);

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

  useEffect(() => {
    stopAudio();
  }, [conversationID, stopAudio, userID]);

  /** 打开合法图片或视频预览，缺失地址时不改变状态。 */
  const openPreview = useCallback((view: ChatMessageView) => {
    // nextPreview 只可能来自安全 URL 投影。
    const nextPreview = getChatMediaPreview(view);
    if (nextPreview) setPreview(nextPreview);
  }, []);

  /** 判断语音消息是否已由当前平台偏好或 RN 兼容 localEx 标记。 */
  const isAudioPlayed = useCallback((message: Message): boolean => {
    if (message.direction === 'outgoing' || isIMAudioMessagePlayedLocally(message)) return true;
    return playedMessageIDs.has(message.clientMsgID.trim()) ||
      Boolean(message.serverMsgID?.trim() && playedMessageIDs.has(message.serverMsgID.trim()));
  }, [playedMessageIDs]);

  /** 记录本地播放尝试并保持账号会话隔离。 */
  const markAudioPlayed = useCallback((message: Message): void => {
    /** messageID 与 RN 一致优先使用服务端稳定身份。 */
    const messageID = getIMAudioMessageIdentity(message);
    if (!messageID) return;
    setPlayedMessageIDs(current => {
      if (current.has(messageID)) return current;
      /** next 立即同步 ref，供同次 ended 自动连播判断。 */
      const next = new Set(current).add(messageID);
      playedMessageIDsRef.current = next;
      writeChatAudioPlayedMessageIDs(userID, conversationID, next);
      return next;
    });
  }, [conversationID, userID]);

  /** 播放单条真实语音并复用当前页面唯一 HTMLAudioElement。 */
  const playAudioMessage = useCallback((message: Message, view?: ChatMessageView): void => {
    /** messageView 在自动连播时从同一 core message 恢复。 */
    const messageView = view ?? getChatMessageView(message, isGroup, userID);
    /** url 只接受 chat media owner 已验证的 HTTP(S) 地址。 */
    const url = getChatAudioURL(messageView);
    /** messageID 统一当前播放态与自动连播定位身份。 */
    const messageID = getIMAudioMessageIdentity(message);
    /** audio 是页面内唯一播放 owner。 */
    const audio = audioRef.current;
    if (!messageID || !url || !audio) return;
    playbackSequence.current += 1;
    /** sequence 锁定本次异步播放结果所有权。 */
    const sequence = playbackSequence.current;
    audio.pause();
    audio.currentTime = 0;
    audio.src = url;
    markAudioPlayed(message);
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
  }, [isGroup, markAudioPlayed, userID]);

  useEffect(() => {
    playAudioMessageRef.current = playAudioMessage;
  }, [playAudioMessage]);

  /** 切换单条语音，切换消息时先停止上一条再播放。 */
  const toggleAudio = useCallback(
    (message: Message, view: ChatMessageView) => {
      // messageID 与播放 owner 使用同一稳定身份。
      const messageID = getIMAudioMessageIdentity(message);
      if (!messageID) return;
      if (
        activeAudioMessageID === messageID &&
        (audioState === 'loading' || audioState === 'playing')
      ) {
        stopAudio();
        return;
      }
      playAudioMessage(message, view);
    },
    [activeAudioMessageID, audioState, playAudioMessage, stopAudio],
  );

  /** 自然播放结束后查找并播放下一条未播放 incoming 语音。 */
  const handleAudioEnded = useCallback(() => {
    /** completedMessageID 在 stop 前冻结本次完成身份。 */
    const completedMessageID = activeAudioMessageID;
    stopAudio();
    if (!completedMessageID || !conversationID) return;
    /** nextMessage 只由 shared RN-compatible 规则选择。 */
    const nextMessage = findNextIMUnplayedIncomingAudioMessage({
      messages: messagesRef.current,
      currentMessageID: completedMessageID,
      playedMessageIDs: playedMessageIDsRef.current,
      isPlayable: message => Boolean(
        getChatAudioURL(getChatMessageView(message, isGroup, userID)),
      ),
    });
    if (nextMessage) playAudioMessageRef.current?.(nextMessage);
  }, [activeAudioMessageID, conversationID, isGroup, stopAudio, userID]);

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
      isAudioPlayed,
      toggleAudio,
    }),
    [activeAudioMessageID, audioState, isAudioPlayed, openPreview, toggleAudio],
  );

  return (
    <ChatMediaInteractionContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        className="rn-chat-audio-runtime"
        preload="none"
        onEnded={handleAudioEnded}
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
