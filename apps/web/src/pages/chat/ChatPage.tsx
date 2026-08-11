import { useEffect, useMemo, useRef, useState } from 'react';
import type { Conversation, Message, WebIMSync } from '@im28/im-sdk/web';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useWebIMRuntime } from '../../runtime/index.js';
import { ChatComposer } from './ChatComposer.js';
import { ChatHeader } from './ChatHeader.js';
import { ChatMediaInteractionProvider } from './ChatMediaInteractionProvider.js';
import { ChatMessageList } from './ChatMessageList.js';
import { ChatMessageDeleteSheet } from './ChatMessageDeleteSheet.js';
import { ChatPageFeedback } from './ChatPageFeedback.js';
import { ChatPageFooter } from './ChatPageFooter.js';
import { copyChatMessage } from './chat-message-copy.js';
import type { ChatMessageView } from './chat-message-view.js';
import { ChatPageState, pullAndReadChatHistory, readChatPageError, upsertVisibleMessage } from './chat-page-helpers.js';
import { useChatVoiceRecorder } from './useChatVoiceRecorder.js';
import { useChatCustomEmojiActions } from './useChatCustomEmojiActions.js';
import { useChatOutgoingMessageActions } from './useChatOutgoingMessageActions.js';
import { useChatForwardFlow } from './useChatForwardFlow.js';
import { useChatMessageDeleteFlow } from './useChatMessageDeleteFlow.js';
import { useChatMessageEditFlow } from './useChatMessageEditFlow.js';
import './chat-page.css';
/** RN chat detail 页面只编排 Web SDK cache/pull/send/realtime facade。 */
export function ChatPage() {
  // conversationID 由 React Router path param 管理并自动解码。
  const { conversationID = '' } = useParams();
  // navigate 只负责 React Router SPA 管理页切换。
  const navigate = useNavigate();
  // runtime context 提供 auth guard、配置错误和聚合 sync facade。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // sync 与 runtime 生命周期一致，页面不实例化 Gateway 或 Repository。
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  // conversation 为 RN header 提供会话缓存身份。
  const [conversation, setConversation] = useState<Conversation | null>(null);
  // messages 保持 Repository newest-first 结果。
  const [messages, setMessages] = useState<readonly Message[]>([]);
  // quoteMessage 保存当前 composer 唯一引用来源，不复制到浏览器存储。
  const [quoteMessage, setQuoteMessage] = useState<Message | null>(null);
  // loading 标记首次 cache 与 remote history 窗口恢复。
  const [loading, setLoading] = useState(true);
  // sending 防止 composer 重复提交同一文本。
  const [sending, setSending] = useState(false);
  // error 显式展示 history/send failure，不回退 fake-success。
  const [error, setError] = useState<string | null>(null);
  // notice 只呈现已完成的真实非消息 mutation 结果。
  const [notice, setNotice] = useState<string | null>(null);
  // messageListRef 持有唯一消息滚动容器。
  const messageListRef = useRef<HTMLElement>(null);
  // outgoingActions 统一复用 SDK message facade 和页面 operation owner。
  const outgoingActions = useChatOutgoingMessageActions({
    conversationID,
    onSending: handleLocalSendingMessage,
    runMessageOperation,
  });
  // voiceRecorder 管理浏览器麦克风会话，页面只接收最终 File。
  const voiceRecorder = useChatVoiceRecorder({
    disabled: sending || !sync,
    onSend: outgoingActions.sendAudio,
    onError: setError,
  });
  // customEmojiActions 保持 cache/sync callback 稳定并复用唯一发送状态机。
  const customEmojiActions = useChatCustomEmojiActions({
    conversationID,
    sync,
    runMessageOperation,
    onError: setError,
    onNotice: setNotice,
  });
  // forwardFlow 统一管理单条、多选、路由预览和 shared facade 提交。
  const forwardFlow = useChatForwardFlow({
    conversation,
    messages,
    sync,
    sending,
    onSending: handleLocalSendingMessage,
    runMessageOperation,
    onError: setError,
    onNotice: setNotice,
  });
  // deleteFlow 统一管理单条/多选确认、群权限和 shared facade 提交。
  const deleteFlow = useChatMessageDeleteFlow({
    conversation, messages, sync, runMessageOperation,
    onError: setError, onNotice: setNotice,
  });
  // editFlow 只持有瞬时编辑目标，mutation 仍由 shared facade 完成。
  const editFlow = useChatMessageEditFlow({
    conversationID, sync, runMessageOperation, onError: setError,
  });
  useEffect(() => {
    if (!sync || !snapshot.userID || !conversationID) return;
    // active 阻止路由切换后的旧请求回写。
    let active = true;
    setLoading(true);
    setError(null);
    setConversation(null);
    setMessages([]);
    setQuoteMessage(null);
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
        // refreshedMessages 从 pull 后 SQLite 重读，包含并发发送或实时写入。
        const refreshedMessages = await pullAndReadChatHistory(sync.messages, {
          conversationID,
          fromSeq: target.lastMsgSeq ?? '0',
          limit: 50,
        });
        if (active) setMessages(refreshedMessages);
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
  /** 复制真实消息投影，并只在 clipboard 完成后展示成功反馈。 */
  async function handleCopyMessage(view: ChatMessageView): Promise<boolean> {
    setError(null);
    setNotice(null);
    try {
      await copyChatMessage(view);
      setNotice('复制成功');
      return true;
    } catch (cause) {
      setError(readChatPageError(cause));
      return false;
    }
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
  if (restoring) return <ChatPageState label="正在恢复会话" />;
  if (!runtime) return <ChatPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  // isGroup 只由真实 Conversation type 决定群消息排列。
  const isGroup = conversation?.type === 'group';
  return (
    <main className="rn-chat-page">
      <section className="rn-chat-surface">
        <ChatHeader conversation={conversation} />
        <ChatPageFeedback error={error} notice={notice} />
        <ChatMediaInteractionProvider>
          <ChatMessageList
            messages={messages}
            isGroup={isGroup}
            loading={loading}
            listRef={messageListRef}
            customEmojiActionDisabled={customEmojiActions.mutating}
            onAddCustomEmoji={customEmojiActions.add}
            retryDisabled={sending}
            onRetryMessage={outgoingActions.retry}
            onQuoteMessage={message => {
              editFlow.cancelEdit();
              setQuoteMessage(message);
            }}
            onCopyMessage={handleCopyMessage}
            multiSelecting={forwardFlow.multiSelecting}
            selectedMessageIDs={forwardFlow.selectedIDs}
            onToggleSelectedMessage={forwardFlow.toggleSelectedMessage}
            onForwardMessage={forwardFlow.forwardMessage}
            onBeginMultiSelect={forwardFlow.beginMultiSelect}
            onDeleteMessage={message => deleteFlow.requestDelete([message.clientMsgID])}
            onEditMessage={message => {
              setQuoteMessage(null);
              editFlow.beginEdit(message);
            }}
          />
        </ChatMediaInteractionProvider>
        <ChatPageFooter
          forwardFlow={forwardFlow}
          sending={sending}
          onDeleteSelected={() => deleteFlow.requestDelete(
            [...forwardFlow.selectedIDs], forwardFlow.cancelMultiSelect,
          )}
        >
          <ChatComposer
            sending={sending}
            quoteMessage={quoteMessage}
            isGroup={isGroup}
            onCancelQuote={() => setQuoteMessage(null)}
            onSendQuote={outgoingActions.sendQuote}
            voiceRecordingStatus={voiceRecorder.status}
            voiceRecordingSeconds={voiceRecorder.seconds}
            onSendText={outgoingActions.sendText}
            editingMessage={editFlow.editingMessage}
            onCancelEdit={editFlow.cancelEdit}
            onEditText={editFlow.submitEdit}
            onSendAlbum={outgoingActions.sendAlbum}
            onSendFile={outgoingActions.sendFile}
            loadCachedCustomEmojis={customEmojiActions.loadCached}
            syncCustomEmojis={customEmojiActions.refresh}
            onSendCustomEmoji={customEmojiActions.send}
            onManageCustomEmojis={() => navigate(
              `/conversations/${encodeURIComponent(conversationID)}/emojis`,
            )}
            onVoiceRecordStart={voiceRecorder.start}
            onVoiceRecordSend={voiceRecorder.send}
            onVoiceRecordCancel={voiceRecorder.cancel}
            onError={setError}
          />
        </ChatPageFooter>
        <ChatMessageDeleteSheet flow={deleteFlow} />
      </section>
    </main>
  );
}
