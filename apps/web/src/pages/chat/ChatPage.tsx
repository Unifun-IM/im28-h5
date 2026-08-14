import { useCallback, useMemo, useRef, useState } from 'react';
import type { IMMessageCard, Message, PresetEmojiDocument, WebIMGroupMember, WebIMSync } from '@im28/im-sdk/web';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CallTypeActionSheet } from '../../components/call/CallTypeActionSheet.js';
import {
  ChatTargetPickerModal,
  type ChatTargetPickerItem,
} from '../../components/chat-target-picker/index.js';
import { useWebIMCall, useWebIMRuntime } from '../../runtime/index.js';
import { ChatComposer } from './ChatComposer.js';
import { ChatHeader } from './ChatHeader.js';
import { ChatMediaInteractionProvider } from './ChatMediaInteractionProvider.js';
import { ChatMessageList } from './ChatMessageList.js';
import { ChatMessageDeleteSheet } from './ChatMessageDeleteSheet.js';
import { ChatPageFeedback } from './ChatPageFeedback.js';
import { ChatPageFooter } from './ChatPageFooter.js';
import { ChatGroupAnnouncementBanner } from './ChatGroupAnnouncementBanner.js';
import { ChatPageState, readChatPageError, upsertVisibleMessage } from './chat-page-helpers.js';
import { useChatVoiceRecorder } from './useChatVoiceRecorder.js';
import { useChatCustomEmojiActions } from './useChatCustomEmojiActions.js';
import { useChatOutgoingMessageActions } from './useChatOutgoingMessageActions.js';
import { useChatForwardFlow } from './useChatForwardFlow.js';
import { useChatMessageDeleteFlow } from './useChatMessageDeleteFlow.js';
import { useChatMessageEditFlow } from './useChatMessageEditFlow.js';
import { useChatMentionMembers } from './useChatMentionMembers.js';
import { useChatGroupAnnouncement } from './useChatGroupAnnouncement.js';
import { useChatMessageClipboard } from './useChatMessageClipboard.js';
import { useChatUnreadNavigation } from './useChatUnreadNavigation.js';
import { useChatHistoryPagination } from './useChatHistoryPagination.js';
import { useChatQuoteSources } from './useChatQuoteSources.js';
import { useChatMessageDeleteExit } from './useChatMessageDeleteExit.js';
import { useChatDirectRelationship } from './useChatDirectRelationship.js';
import { useObservedUserPresence } from './useObservedUserPresence.js';
import { buildChatHeaderPresenceView } from './chat-header-presence-view.js';
import { createChatGroupProfileRouteState } from './group-profile-route-state.js';
import { useChatGroupApplicationCount } from './useChatGroupApplicationCount.js';
import { createGroupApplicationChatRouteState } from '../contacts/group-application-route.js';
import { createGroupCardApplyRouteState } from '../groups/group-search-route.js';
import { getConversationTitle } from '../conversations/conversation-list-view.js';
import type { ChatComposerMentionRequest } from './chat-composer-types.js';
import { buildChatMessageFocusURL } from './chat-message-focus.js';
import { toIMMessageCard } from './chat-card-picker.js';
import { useChatPageCacheState } from './useChatPageCacheState.js';
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
  // sending 防止 composer 重复提交同一文本。
  const [sending, setSending] = useState(false);
  // notice 只呈现已完成的真实非消息 mutation 结果。
  const [notice, setNotice] = useState<string | null>(null);
  // cardPickerVisible 控制当前聊天唯一名片选择弹层。
  const [cardPickerVisible, setCardPickerVisible] = useState(false);
  // callPickerVisible 只控制单聊语音/视频二次选择层。
  const [callPickerVisible, setCallPickerVisible] = useState(false);
  // callStarting 防止二次点击重复创建通话生命周期。
  const [callStarting, setCallStarting] = useState(false);
  // mentionRequest 将头像长按翻译为 Composer 内部的一次性成员输入。
  const [mentionRequest, setMentionRequest] = useState<ChatComposerMentionRequest | null>(null);
  // mentionRequestSequenceRef 为连续提及生成稳定递增请求身份。
  const mentionRequestSequenceRef = useRef(0);
  // messageListRef 持有唯一消息滚动容器。
  const messageListRef = useRef<HTMLElement>(null);
  /** handleConversationReset 保证切换会话时关闭上一会话的瞬时弹层。 */
  const handleConversationReset = useCallback(() => {
    setCardPickerVisible(false);
    setCallPickerVisible(false);
  }, []);
  // cacheState 统一拥有 SQLite 首屏恢复、实时重读和搜索定位状态。
  const cacheState = useChatPageCacheState({
    conversationID,
    focusedMessageID,
    accountUserID: snapshot.userID,
    dataVersion: snapshot.dataVersion,
    sync,
    messageListRef,
    onReset: handleConversationReset,
  });
  // 页面 mutation 只消费 cache owner 暴露的稳定状态和 setter。
  const {
    conversation, setConversation, draftDocument, setDraftDocument,
    messages, setMessages, quoteMessage, setQuoteMessage,
    loading, error, setError, historyPage,
  } = cacheState;
  // clipboardActions 统一消息与链接复制的真实浏览器结果反馈。
  const clipboardActions = useChatMessageClipboard({ setError, setNotice });
  /** handleMarkConversationRead 只把可见边界交给现有 shared success-only facade。 */
  const handleMarkConversationRead = useCallback(async (readSeq: string) => {
    if (!sync) throw new Error('聊天服务尚未就绪');
    /** nextConversation 是 Gateway 成功并完成 SQLite 收敛后的真实快照。 */
    const nextConversation = await sync.conversations.markRead(conversationID, readSeq);
    setConversation(current => current?.conversationID === conversationID
      ? nextConversation
      : current);
  }, [conversationID, sync]);
  // unreadNavigation 管理初始边界、DOM 定位和 RN 门禁下的 shared 已读提交。
  const unreadNavigation = useChatUnreadNavigation({
    conversationID,
    ...(conversation?.lastReadSeq || (conversation?.unreadCount ?? 0) > 0
      ? { lastReadSeq: conversation?.lastReadSeq ?? '0' }
      : {}),
    messages,
    hasUnreadMessages: (conversation?.unreadCount ?? 0) > 0,
    ready: !focusedMessageID && !loading &&
      conversation?.conversationID === conversationID,
    listRef: messageListRef,
    onMarkRead: handleMarkConversationRead,
  });
  // historyPagination 只拥有 Web 顶部触发、位置补偿和悬浮日期投影。
  const historyPagination = useChatHistoryPagination({
    conversationID,
    enabled: Boolean(sync && !focusedMessageID && !loading),
    initialHasMore: historyPage.hasMore,
    ...(historyPage.nextCursor ? { initialNextCursor: historyPage.nextCursor } : {}),
    messages,
    sync,
    listRef: messageListRef,
    setMessages,
    onError: setError,
  });
  // quoteSources 只从当前账号 SQLite 补齐窗口外引用来源，不请求 Gateway。
  const quoteSources = useChatQuoteSources({
    conversationID,
    messages,
    sync: sync?.messages ?? null,
  });
  // deleteExit 仅冻结 SDK 已确认成功消息的短期展示窗口。
  const deleteExit = useChatMessageDeleteExit(conversationID, messages);
  /** handleDirectRelationshipError 统一使用页面现有错误归一化。 */
  const handleDirectRelationshipError = useCallback((cause: unknown) => {
    setError(readChatPageError(cause));
  }, []);
  // directRelationship 只消费 SDK 聚合事实，不解释 Gateway 或黑名单 payload。
  const directRelationship = useChatDirectRelationship(
    conversation,
    sync,
    snapshot.relationshipVersion,
    handleDirectRelationshipError,
  );
  // outgoingActions 统一复用 SDK message facade 和页面 operation owner。
  const outgoingActions = useChatOutgoingMessageActions({
    conversationID,
    groupID: conversation?.type === 'group' ? conversation.targetID : '',
    onSending: handleLocalSendingMessage,
    runMessageOperation: runComposerMessageOperation,
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
    currentUserID: snapshot.userID ?? '',
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
    onDeleteSucceeded: deleteExit.begin,
  });
  // editFlow 只持有瞬时编辑目标，mutation 仍由 shared facade 完成。
  const editFlow = useChatMessageEditFlow({
    conversationID, sync, runMessageOperation, onError: setError,
  });
  // mentionMembers 只消费 shared 群成员 cache/sync facade。
  const mentionMembers = useChatMentionMembers(conversation, sync, setError);
  // headerPresenceUserIDs 只观察当前单聊对端或普通群完整成员快照。
  const headerPresenceUserIDs = useMemo(() => {
    if (!conversation) return [];
    if (conversation.type === 'single') return conversation.targetID ? [conversation.targetID] : [];
    if (!mentionMembers.showOnlineStatus) return [];
    return mentionMembers.members.map(member => member.userID);
  }, [conversation, mentionMembers.members, mentionMembers.showOnlineStatus]);
  // headerOnlineByID 复用 shared presence 的初始查询与实时收敛。
  const headerOnlineByID = useObservedUserPresence({
    runtime,
    accountUserID: snapshot.userID,
    userIDs: headerPresenceUserIDs,
    visible: headerPresenceUserIDs.length > 0,
  });
  // headerPresence 严格复刻 RN 单聊与普通群头部展示规则。
  const headerPresence = useMemo(() => buildChatHeaderPresenceView({
    conversation,
    onlineByID: headerOnlineByID,
    groupMemberUserIDs: mentionMembers.members.map(member => member.userID),
    showGroupOnlineStatus: mentionMembers.showOnlineStatus,
  }), [conversation, headerOnlineByID, mentionMembers.members, mentionMembers.showOnlineStatus]);
  // groupApplicationCount 对齐 RN 群聊头部待审核角标，并随 runtime 事实刷新。
  const groupApplicationCount = useChatGroupApplicationCount(
    conversation,
    sync,
    snapshot.dataVersion,
  );
  // groupAnnouncement 仅在 shared read-status 判定未读时投影 RN 横幅。
  const groupAnnouncement = useChatGroupAnnouncement({
    conversation,
    messages,
    sync,
    onError: setError,
  });
  /** 接收 SDK 已落库的 sending 实体，不在页面生成消息身份。 */
  function handleLocalSendingMessage(message: Message) {
    setMessages(current => upsertVisibleMessage(current, message));
  }
  /** 统一管理 text/image/video/file operation 的 busy、error 与 cache 重读。 */
  async function runMessageOperation(
    operation: (activeSync: WebIMSync) => Promise<void>,
  ): Promise<void> {
    if (!sync || sending) return;
    setSending(true);
    setError(null);
    try {
      await operation(sync);
    } catch (cause) {
      directRelationship.markStrangerFromSendError(cause);
      setError(readChatPageError(cause));
    } finally {
      try {
        // cached 包含 facade 持久化的 sent 或 failed 消息状态。
        const cached = await sync.messages.getCachedHistory({
          conversationID,
          limit: Math.max(50, messages.length),
        });
        setMessages(cached);
      } catch (cause) {
        setError(readChatPageError(cause));
      } finally {
        setSending(false);
      }
    }
  }
  /** 为 Composer 发送提供明确成功结果，不扩大其他页面 hooks 的旧返回契约。 */
  async function runComposerMessageOperation(
    operation: (activeSync: WebIMSync) => Promise<void>,
  ): Promise<boolean> {
    /** completed 只在 shared operation 没有抛错时置为真。 */
    let completed = false;
    await runMessageOperation(async activeSync => {
      await operation(activeSync);
      completed = true;
    });
    return completed;
  }
  /** 将普通 Composer 文档保存到当前账号 SDK SQLite。 */
  function handleDraftDocumentChange(document: PresetEmojiDocument): void {
    setDraftDocument(document);
    if (!sync || !conversation) return;
    void sync.conversations.saveDraft(conversationID, document)
      .then(nextConversation => {
        setConversation(current => current?.conversationID === nextConversation.conversationID
          ? nextConversation
          : current);
      })
      .catch(cause => setError(readChatPageError(cause)));
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
  /** 全局弹窗单选后只在 type108 真实发送成功时关闭。 */
  async function handleSendSelectedCard(
    targets: readonly ChatTargetPickerItem[],
  ): Promise<void> {
    /** target 只接受单选模式交付的第一个真实目标。 */
    const target = targets[0];
    if (!target || sending) return;
    if (await handleSendCard(toIMMessageCard(target))) setCardPickerVisible(false);
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
        peerName: getConversationTitle(conversation),
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
  /** composerUnavailableText 在会话身份未知时保持 fail-closed，否则组合各 SDK 投影。 */
  const composerUnavailableText = !conversation
    ? loading
      ? '正在恢复会话'
      : '会话暂不可用，无法发消息'
    : mentionMembers.composerUnavailableReason ||
      directRelationship.presentation.composerUnavailableReason;
  /** 将当前群真实成员交给唯一 Composer 草稿 owner。 */
  function handleMentionGroupMember(member: WebIMGroupMember): void {
    if (!isGroup || !member.userID || member.userID === snapshot.userID) return;
    mentionRequestSequenceRef.current += 1;
    setMentionRequest({ id: mentionRequestSequenceRef.current, member });
  }
  /** 名片点击复刻 RN：用户进入资料，群聊按真实已加入状态分流。 */
  async function handleOpenCard(view: import('./chat-message-view.js').ChatMessageView): Promise<void> {
    /** targetID 只接受消息协议保存的稳定身份。 */
    const targetID = view.cardTargetID?.trim() ?? '';
    if (!targetID) {
      setError('名片身份不可用');
      return;
    }
    /** backHref 保证用户资料页返回当前聊天。 */
    const backHref = `/conversations/${encodeURIComponent(conversationID)}`;
    if (view.cardKind !== 'group') {
      navigate(`/contacts/users/${encodeURIComponent(targetID)}`, {
        state: { backHref },
      });
      return;
    }
    if (!sync) {
      setError('群聊服务尚未就绪');
      return;
    }
    try {
      /** groups 对齐 RN，每次点击都强制刷新当前账号已加入群列表。 */
      const groups = await sync.groups.sync({ pageSize: 100 });
      /** joinedGroup 必须精确匹配名片 groupID。 */
      const joinedGroup = groups.find(group => group.groupID === targetID);
      if (joinedGroup) {
        /** openedConversation 复用 shared owner 校验群身份并收敛会话缓存。 */
        const openedConversation = await sync.conversations.openGroup({
          groupID: targetID,
          conversationID: joinedGroup.conversationID,
        });
        navigate(`/conversations/${encodeURIComponent(openedConversation.conversationID)}`);
        return;
      }
      navigate(`/groups/${encodeURIComponent(targetID)}/apply`, {
        state: createGroupCardApplyRouteState(conversationID),
      });
    } catch (cause) {
      try {
        /** RN 刷新失败时仍由 openGroup 进行一次权威可进入性校验。 */
        const openedConversation = await sync.conversations.openGroup({ groupID: targetID });
        navigate(`/conversations/${encodeURIComponent(openedConversation.conversationID)}`);
      } catch {
        setError(readChatPageError(cause));
      }
    }
  }
  return (
    <main className="rn-chat-page">
      <section className="rn-chat-surface">
        <ChatHeader
          conversation={conversation}
          presence={headerPresence}
          groupApplicationCount={groupApplicationCount}
          multiSelecting={forwardFlow.multiSelecting}
          selectedCount={forwardFlow.selectedCount}
          onCancelMultiSelect={forwardFlow.cancelMultiSelect}
          onOpenProfile={() => {
            if (!conversation) return;
            /** conversationHref 保证资料页只返回当前真实会话。 */
            const conversationHref = `/conversations/${encodeURIComponent(conversation.conversationID)}`;
            if (conversation.type === 'group') {
              navigate(`${conversationHref}/settings/profile`, {
                state: createChatGroupProfileRouteState(conversation.conversationID),
              });
              return;
            }
            navigate(`/contacts/users/${encodeURIComponent(conversation.targetID)}`, {
              state: { backHref: conversationHref },
            });
          }}
          onOpenGroupApplications={() => {
            if (conversation?.type !== 'group' || !conversation.targetID) return;
            navigate(
              `/contacts/group-applications/${encodeURIComponent(conversation.targetID)}`,
              { state: createGroupApplicationChatRouteState(conversationID) },
            );
          }}
        />
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
        <ChatMediaInteractionProvider
          userID={snapshot.userID}
          conversationID={conversationID}
          messages={messages}
          isGroup={isGroup}
        >
          <ChatMessageList
            conversationID={conversationID}
            messages={deleteExit.displayMessages}
            quoteSourceMessages={quoteSources.messages}
            unavailableQuoteSourceIDs={quoteSources.unavailableIDs}
            isGroup={isGroup}
            currentUserID={snapshot.userID}
            groupMembers={mentionMembers.members}
            loading={loading}
            historyLoading={historyPagination.loadingMore}
            stickyDateLabel={historyPagination.stickyDateLabel}
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
            onOpenCard={view => { void handleOpenCard(view); }}
            {...(conversation?.type === 'single'
              ? { onStartCall: (mediaType: 'audio' | 'video') => { void handleStartCall(mediaType); } }
              : {})}
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
            onMentionGroupMember={handleMentionGroupMember}
            unreadNavigation={unreadNavigation.navigation}
            remainingUnreadCount={unreadNavigation.remainingUnreadCount}
            onScrollToNextUnread={unreadNavigation.scrollToNextUnread}
            onOpenQuotedMessage={message => {
              /** targetURL 只使用当前路由会话和 canonical client identity。 */
              const targetURL = buildChatMessageFocusURL(
                conversationID,
                message.clientMsgID,
              );
              if (targetURL) navigate(targetURL);
            }}
            exitingMessageIDs={deleteExit.exitingMessageIDs}
            onMessageExitComplete={deleteExit.finish}
            bottomNoticeText={directRelationship.presentation.noticeText}
            bottomNoticeActionLabel={directRelationship.presentation.noticeActionLabel}
            onBottomNoticeAction={() => {
              if (conversation?.type !== 'single' || !conversation.targetID) return;
              navigate(`/contacts/users/${encodeURIComponent(conversation.targetID)}/add`);
            }}
          />
        <ChatPageFooter
          forwardFlow={forwardFlow}
          unavailableText={composerUnavailableText}
          onDeleteSelected={() => deleteFlow.requestDelete(
            [...forwardFlow.selectedIDs], forwardFlow.cancelMultiSelect,
          )}
        >
          <ChatComposer
            key={conversationID}
            initialDraftDocument={draftDocument}
            onDraftDocumentChange={handleDraftDocumentChange}
            forwardDraft={forwardFlow.pending ? {
              pending: forwardFlow.pending,
              recipientName: conversation ? getConversationTitle(conversation) : '',
              onCancel: forwardFlow.clearPendingForward,
              onChangeTarget: forwardFlow.changeForwardTarget,
              onSubmit: forwardFlow.submitForward,
            } : null}
            sending={sending}
            quoteMessage={quoteMessage}
            isGroup={isGroup}
            onCancelQuote={() => setQuoteMessage(null)}
            onSendQuote={outgoingActions.sendQuote}
            voiceRecordingStatus={voiceRecorder.status}
            voiceRecordingSeconds={voiceRecorder.seconds}
            voiceRecordingLevel={voiceRecorder.level}
            onSendText={outgoingActions.sendText}
            onSendMention={outgoingActions.sendMention}
            mentionMembers={mentionMembers.members}
            canMentionAll={mentionMembers.canMentionAll}
            currentUserID={snapshot.userID}
            mentionRequest={mentionRequest}
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
        </ChatMediaInteractionProvider>
        <ChatMessageDeleteSheet flow={deleteFlow} />
        <ChatTargetPickerModal
          open={forwardFlow.targetPickerOpen}
          sync={sync}
          selectionMode="single"
          excludeUserIDs={[snapshot.userID]}
          actionLabel="转发"
          pending={forwardFlow.targetSubmitting}
          operationError={error}
          onClose={forwardFlow.closeTargetPicker}
          onConfirm={targets => { void forwardFlow.continueForwardToTarget(targets); }}
        />
        <CallTypeActionSheet
          open={callPickerVisible && conversation?.type === 'single'}
          peerName={conversation ? getConversationTitle(conversation) : ''}
          pending={callStarting}
          onClose={() => setCallPickerVisible(false)}
          onSelect={mediaType => { void handleStartCall(mediaType); }}
        />
        <ChatTargetPickerModal
          open={cardPickerVisible}
          sync={sync}
          selectionMode="single"
          excludeUserIDs={conversation?.type === 'single'
            ? [snapshot.userID, conversation.targetID]
            : [snapshot.userID]}
          actionLabel="分享"
          pending={sending}
          operationError={error}
          onClose={() => setCardPickerVisible(false)}
          onConfirm={targets => { void handleSendSelectedCard(targets); }}
        />
      </section>
    </main>
  );
}
