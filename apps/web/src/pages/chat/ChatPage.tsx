import { useEffect, useMemo, useRef, useState } from 'react';
import type { Conversation, IMMessageCard, Message, WebIMSync } from '@im28/im-sdk/web';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CallTypeActionSheet } from '../../components/call/CallTypeActionSheet.js';
import { useWebIMCall, useWebIMRuntime } from '../../runtime/index.js';
import { ChatComposer } from './ChatComposer.js';
import { ChatCardPickerDialog } from './ChatCardPickerDialog.js';
import { ChatHeader } from './ChatHeader.js';
import { ChatMediaInteractionProvider } from './ChatMediaInteractionProvider.js';
import { ChatMessageList } from './ChatMessageList.js';
import { ChatMessageDeleteSheet } from './ChatMessageDeleteSheet.js';
import { ChatPageFeedback } from './ChatPageFeedback.js';
import { ChatPageFooter } from './ChatPageFooter.js';
import { ChatGroupAnnouncementBanner } from './ChatGroupAnnouncementBanner.js';
import { ChatPageState, readChatPageError, readInitialChatMessageWindow, upsertVisibleMessage } from './chat-page-helpers.js';
import { useChatVoiceRecorder } from './useChatVoiceRecorder.js';
import { useChatCustomEmojiActions } from './useChatCustomEmojiActions.js';
import { useChatOutgoingMessageActions } from './useChatOutgoingMessageActions.js';
import { useChatForwardFlow } from './useChatForwardFlow.js';
import { useChatMessageDeleteFlow } from './useChatMessageDeleteFlow.js';
import { useChatMessageEditFlow } from './useChatMessageEditFlow.js';
import { useChatMentionMembers } from './useChatMentionMembers.js';
import { useChatGroupAnnouncement } from './useChatGroupAnnouncement.js';
import { useChatMessageClipboard } from './useChatMessageClipboard.js';
import { focusChatMessageRow, readFocusedChatMessageWindow } from './chat-message-focus.js';
import './chat-page.css';
/** RN chat detail 页面只编排 Web SDK cache/pull/send/realtime facade。 */
export function ChatPage() {
  // conversationID 由 React Router path param 管理并自动解码。
  const { conversationID = '' } = useParams();
  // searchParams 保留可刷新搜索结果定位身份。
  const [searchParams] = useSearchParams();
  // focusedMessageID 只接受稳定 client ID，不从 URL 恢复消息正文。
  const focusedMessageID = searchParams.get('messageID')?.trim() ?? '';
  // navigate 只负责 React Router SPA 管理页切换。
  const navigate = useNavigate();
  // runtime context 提供 auth guard、配置错误和聚合 sync facade。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // callOwner 是应用全局唯一 Web 通话生命周期 owner。
  const callOwner = useWebIMCall();
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
  // clipboardActions 统一消息与链接复制的真实浏览器结果反馈。
  const clipboardActions = useChatMessageClipboard({ setError, setNotice });
  // cardPickerVisible 控制当前聊天唯一名片选择弹层。
  const [cardPickerVisible, setCardPickerVisible] = useState(false);
  // callPickerVisible 只控制单聊语音/视频二次选择层。
  const [callPickerVisible, setCallPickerVisible] = useState(false);
  // callStarting 防止二次点击重复创建通话生命周期。
  const [callStarting, setCallStarting] = useState(false);
  // messageListRef 持有唯一消息滚动容器。
  const messageListRef = useRef<HTMLElement>(null);
  // outgoingActions 统一复用 SDK message facade 和页面 operation owner。
  const outgoingActions = useChatOutgoingMessageActions({
    conversationID,
    groupID: conversation?.type === 'group' ? conversation.targetID : '',
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
  // mentionMembers 只消费 shared 群成员 cache/sync facade。
  const mentionMembers = useChatMentionMembers(conversation, sync, setError);
  // groupAnnouncement 仅在 shared read-status 判定未读时投影 RN 横幅。
  const groupAnnouncement = useChatGroupAnnouncement({
    conversation,
    messages,
    sync,
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
    setQuoteMessage(null);
    setCardPickerVisible(false);
    setCallPickerVisible(false);
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
        // refreshedMessages 按普通或搜索目标模式读取当前账号 SQLite 窗口。
        const refreshedMessages = await readInitialChatMessageWindow(sync.messages, {
          conversationID,
          fromSeq: target.lastMsgSeq ?? '0',
          focusedMessageID,
          limit: 50,
        }, cached => { if (active) setMessages(cached); });
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
  }, [conversationID, focusedMessageID, snapshot.userID, sync]);
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
      focusedMessageID
        ? readFocusedChatMessageWindow(sync.messages, conversationID, focusedMessageID)
        : sync.messages.getCachedHistory({ conversationID, limit: 50 }),
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
  }, [conversationID, focusedMessageID, snapshot.dataVersion, snapshot.userID, sync]);
  useEffect(() => {
    // frame 等待新消息 DOM 完成布局后再保持列表底部可见。
    const frame = requestAnimationFrame(() => {
      // list 是页面唯一滚动 owner，避免 scrollIntoView 推动整个 viewport。
      const list = messageListRef.current;
      if (!focusChatMessageRow(list, focusedMessageID)) {
        list?.scrollTo({ top: list.scrollHeight });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [focusedMessageID, messages.length]);
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
  /** 通过 shared message facade 发送当前选择的 type108 名片。 */
  async function handleSendCard(card: IMMessageCard): Promise<boolean> {
    /** completed 只在 Gateway 和 SQLite 状态机完整成功后置为真。 */
    let completed = false;
    await runMessageOperation(async activeSync => {
      await activeSync.messages.sendCard({
        conversationID,
        card,
        onSending: handleLocalSendingMessage,
      });
      completed = true;
    });
    return completed;
  }
  /** 当前单聊直接复用 canonical conversation 身份启动全局通话 owner。 */
  async function handleStartCall(mediaType: 'audio' | 'video'): Promise<void> {
    if (!conversation || conversation.type !== 'single' || callStarting) return;
    setCallPickerVisible(false);
    setCallStarting(true);
    setError(null);
    try {
      await callOwner.startOutgoing({
        conversationID: conversation.conversationID,
        peerName: conversation.name?.trim() || conversation.targetID,
        peerAvatarURL: conversation.faceURL?.trim() || '',
        mediaType,
      });
    } catch (cause) {
      setError(readChatPageError(cause));
    } finally {
      setCallStarting(false);
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
        {groupAnnouncement.announcement ? (
          <ChatGroupAnnouncementBanner
            text={groupAnnouncement.announcement.text}
            onOpen={() => {
              groupAnnouncement.markRead();
              navigate(
                `/conversations/${encodeURIComponent(conversationID)}/settings/announcement?mode=view`,
              );
            }}
          />
        ) : null}
        <ChatMediaInteractionProvider>
          <ChatMessageList
            messages={messages}
            isGroup={isGroup}
            currentUserID={snapshot.userID}
            groupMembers={mentionMembers.members}
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
            onCopyMessage={clipboardActions.copyMessage}
            onCopyLink={clipboardActions.copyLink}
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
            onSendMention={outgoingActions.sendMention}
            mentionMembers={mentionMembers.members}
            canMentionAll={mentionMembers.canMentionAll}
            currentUserID={snapshot.userID}
            editingMessage={editFlow.editingMessage}
            onCancelEdit={editFlow.cancelEdit}
            onEditText={editFlow.submitEdit}
            onSendAlbum={outgoingActions.sendAlbum}
            onSendSubmission={outgoingActions.sendSubmission}
            showCallAction={conversation?.type === 'single'}
            onOpenCallPicker={() => {
              setError(null);
              setCallPickerVisible(true);
            }}
            onOpenCardPicker={() => {
              setError(null);
              setCardPickerVisible(true);
            }}
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
        <CallTypeActionSheet
          open={callPickerVisible && conversation?.type === 'single'}
          peerName={conversation?.name?.trim() || conversation?.targetID || ''}
          pending={callStarting}
          onClose={() => setCallPickerVisible(false)}
          onSelect={mediaType => { void handleStartCall(mediaType); }}
        />
        <ChatCardPickerDialog
          visible={cardPickerVisible}
          sync={sync}
          conversation={conversation}
          currentUserID={snapshot.userID}
          sending={sending}
          operationError={error}
          onClose={() => setCardPickerVisible(false)}
          onSend={handleSendCard}
        />
      </section>
    </main>
  );
}
