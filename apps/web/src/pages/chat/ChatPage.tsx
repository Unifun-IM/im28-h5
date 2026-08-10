import { useEffect, useMemo, useRef, useState } from 'react';
import type { Conversation, Message, WebIMSync } from '@im28/im-sdk/web';
import { Navigate, useParams } from 'react-router-dom';

import { useWebIMRuntime } from '../../runtime/index.js';
import { ChatComposer } from './ChatComposer.js';
import { ChatHeader } from './ChatHeader.js';
import { ChatMediaInteractionProvider } from './ChatMediaInteractionProvider.js';
import { ChatMessageList } from './ChatMessageList.js';
import {
  ChatPageState,
  readChatPageError,
  upsertVisibleMessage,
} from './chat-page-helpers.js';
import type { ChatAlbumSelectionItem } from './chat-attachment-selection.js';
import { readChatVideoMetadata } from './chat-video-metadata.js';
import { useChatVoiceRecorder } from './useChatVoiceRecorder.js';
import './chat-page.css';

/** RN chat detail 页面只编排 Web SDK cache/pull/send/realtime facade。 */
export function ChatPage() {
  // conversationID 由 React Router path param 管理并自动解码。
  const { conversationID = '' } = useParams();
  // runtime context 提供 auth guard、配置错误和聚合 sync facade。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // sync 与 runtime 生命周期一致，页面不实例化 Gateway 或 Repository。
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  // conversation 为 RN header 提供会话缓存身份。
  const [conversation, setConversation] = useState<Conversation | null>(null);
  // messages 保持 Repository newest-first 结果。
  const [messages, setMessages] = useState<readonly Message[]>([]);
  // loading 标记首次 cache 与 remote history 窗口恢复。
  const [loading, setLoading] = useState(true);
  // sending 防止 composer 重复提交同一文本。
  const [sending, setSending] = useState(false);
  // error 显式展示 history/send failure，不回退 fake-success。
  const [error, setError] = useState<string | null>(null);
  // messageListRef 持有唯一消息滚动容器。
  const messageListRef = useRef<HTMLElement>(null);
  // voiceRecorder 管理浏览器麦克风会话，页面只接收最终 File。
  const voiceRecorder = useChatVoiceRecorder({
    disabled: sending || !sync,
    onSend: handleSendAudio,
    onError: setError,
  });

  useEffect(() => {
    if (!sync || !snapshot.userID || !conversationID) return;
    // active 阻止路由切换后的旧请求回写。
    let active = true;
    setLoading(true);
    setError(null);
    setConversation(null);
    setMessages([]);
    void (async () => {
      try {
        // cachedConversations 确认目标属于当前认证账号 SQLite。
        const cachedConversations = await sync.conversations.listCached({
          limit: 500,
        });
        // target 是当前路由对应的真实缓存会话。
        const target = cachedConversations.find(
          item => item.conversationID === conversationID,
        );
        if (!target) throw new Error('会话不存在或尚未同步');
        if (active) setConversation(target);
        // cachedMessages 先呈现当前账号本地历史。
        const cachedMessages = await sync.messages.getCachedHistory({
          conversationID,
          limit: 50,
        });
        if (active) setMessages(cachedMessages);
        // remoteMessages 从会话最新 seq 拉取并由 facade 落库后返回。
        const remoteMessages = await sync.messages.pullHistory({
          conversationID,
          fromSeq: target.lastMsgSeq ?? '0',
          limit: 50,
        });
        if (active) setMessages(remoteMessages);
      } catch (cause) {
        if (active) setError(readChatPageError(cause));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [conversationID, snapshot.userID, sync]);

  useEffect(() => {
    if (
      !sync ||
      !snapshot.userID ||
      !conversationID ||
      snapshot.dataVersion === 0
    ) {
      return;
    }
    // active 阻止实时 cache 读取在路由切换后回写旧会话。
    let active = true;
    void Promise.all([
      sync.conversations.listCached({ limit: 500 }),
      sync.messages.getCachedHistory({ conversationID, limit: 50 }),
    ])
      .then(([cachedConversations, cachedMessages]) => {
        if (!active) return;
        // target 用当前 cache 刷新 header 的会话资料。
        const target = cachedConversations.find(
          item => item.conversationID === conversationID,
        );
        if (target) setConversation(target);
        setMessages(cachedMessages);
      })
      .catch(cause => {
        if (active) setError(readChatPageError(cause));
      });
    return () => {
      active = false;
    };
  }, [conversationID, snapshot.dataVersion, snapshot.userID, sync]);

  useEffect(() => {
    // frame 等待新消息 DOM 完成布局后再保持列表底部可见。
    const frame = requestAnimationFrame(() => {
      // list 是页面唯一滚动 owner，避免 scrollIntoView 推动整个 viewport。
      const list = messageListRef.current;
      list?.scrollTo({ top: list.scrollHeight });
    });
    return () => cancelAnimationFrame(frame);
  }, [messages.length]);

  /** 发送真实文本并从账号 SQLite 重读 sent/failed 最终状态。 */
  async function handleSendText(text: string) {
    await runMessageOperation(async activeSync => {
      await activeSync.messages.sendText({ conversationID, text });
    });
  }

  /** 按浏览器选择顺序逐张执行真实图片上传和 Gateway send。 */
  async function handleSendAlbum(items: readonly ChatAlbumSelectionItem[]) {
    await runMessageOperation(async activeSync => {
      for (const item of items) {
        // file 保留浏览器选择顺序和原始 Blob 身份。
        const { file } = item;
        if (item.kind === 'image') {
          await activeSync.messages.sendImage({
            conversationID,
            source: file,
            name: file.name,
            mimeType: file.type,
            size: file.size,
            onSending: handleLocalSendingMessage,
          });
          continue;
        }
        // metadata 在 SDK I/O 前由浏览器标准 video decoder 读取。
        const metadata = await readChatVideoMetadata(file);
        await activeSync.messages.sendVideo({
          conversationID,
          source: file,
          name: file.name,
          mimeType: file.type,
          size: file.size,
          ...metadata,
          onSending: handleLocalSendingMessage,
        });
      }
    });
  }

  /** 发送一个普通文件并保留浏览器报告的 MIME 与精确字节数。 */
  async function handleSendFile(file: File) {
    await runMessageOperation(async activeSync => {
      await activeSync.messages.sendFile({
        conversationID,
        source: file,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        onSending: handleLocalSendingMessage,
      });
    });
  }

  /** 发送浏览器录音文件并复用 shared audio 上传和状态 owner。 */
  async function handleSendAudio(file: File, durationSeconds: number) {
    await runMessageOperation(async activeSync => {
      await activeSync.messages.sendAudio({
        conversationID,
        source: file,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        durationSeconds,
        onSending: handleLocalSendingMessage,
      });
    });
  }

  /** 接收 SDK 已落库的 sending 实体，不在页面生成消息身份。 */
  function handleLocalSendingMessage(message: Message) {
    setMessages(current => upsertVisibleMessage(current, message));
  }

  /** 统一管理 text/image/video/file operation 的 busy、error 与 cache 重读。 */
  async function runMessageOperation(
    operation: (activeSync: WebIMSync) => Promise<void>,
  ) {
    if (!sync || sending) return;
    setSending(true);
    setError(null);
    try {
      await operation(sync);
    } catch (cause) {
      setError(readChatPageError(cause));
    } finally {
      try {
        // cached 包含 facade 持久化的 sent 或 failed 消息状态。
        const cached = await sync.messages.getCachedHistory({
          conversationID,
          limit: 50,
        });
        setMessages(cached);
      } catch (cause) {
        setError(readChatPageError(cause));
      } finally {
        setSending(false);
      }
    }
  }

  if (restoring) {
    return <ChatPageState label="正在恢复会话" />;
  }
  if (!runtime) {
    return <ChatPageState label="运行配置不可用" detail={startupError} />;
  }
  if (!snapshot.userID) {
    return <Navigate to="/login" replace />;
  }

  // isGroup 只由真实 Conversation type 决定群消息排列。
  const isGroup = conversation?.type === 'group';
  return (
    <main className="rn-chat-page">
      <section className="rn-chat-surface">
        <ChatHeader conversation={conversation} />
        {error ? (
          <p className="rn-chat-error" role="status">
            {error}
          </p>
        ) : null}
        <ChatMediaInteractionProvider>
          <ChatMessageList
            messages={messages}
            isGroup={isGroup}
            loading={loading}
            listRef={messageListRef}
          />
        </ChatMediaInteractionProvider>
        <ChatComposer
          sending={sending}
          voiceRecordingStatus={voiceRecorder.status}
          voiceRecordingSeconds={voiceRecorder.seconds}
          onSendText={handleSendText}
          onSendAlbum={handleSendAlbum}
          onSendFile={handleSendFile}
          onVoiceRecordStart={voiceRecorder.start}
          onVoiceRecordSend={voiceRecorder.send}
          onVoiceRecordCancel={voiceRecorder.cancel}
          onError={setError}
        />
      </section>
    </main>
  );
}
