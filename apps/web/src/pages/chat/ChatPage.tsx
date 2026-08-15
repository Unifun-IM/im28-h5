import { useCallback, useMemo, useRef, useState } from 'react';
import type { Message } from '@im28/im-sdk/web';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useWebIMCall, useWebIMRuntime } from '../../runtime/index.js';
import { ChatPageSurface } from './ChatPageSurface.js';
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
import { useChatPageCacheState } from './useChatPageCacheState.js';
import { useChatPageNavigationActions } from './useChatPageNavigationActions.js';
import { useChatPageMessageOperations } from './useChatPageMessageOperations.js';
import { useChatPageTransientActions } from './useChatPageTransientActions.js';
import { useChatPageComposerState } from './useChatPageComposerState.js';
import { useChatPageHeaderState } from './useChatPageHeaderState.js';
import './chat-page.css';
/** RN chat detail 页面只编排 Web SDK cache/pull/send/realtime facade。 */
export function ChatPage() {
  // conversationID 由 React Router path param 管理并自动解码。
  const { conversationID = '' } = useParams();
  // searchParams 保留可刷新搜索结果定位身份。
  const [searchParams] = useSearchParams();
  // focusedMessageID 只接受稳定 client ID，不从 URL 恢复消息正文。
  const focusedMessageID = searchParams.get('messageID')?.trim() ?? '';
  // runtime context 提供 auth guard、配置错误和聚合 sync facade。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // callOwner 是应用全局唯一 Web 通话生命周期 owner。
  const callOwner = useWebIMCall();
  // sync 与 runtime 生命周期一致，页面不实例化 Gateway 或 Repository。
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  // notice 只呈现已完成的真实非消息 mutation 结果。
  const [notice, setNotice] = useState<string | null>(null);
  // messageListRef 持有唯一消息滚动容器。
  const messageListRef = useRef<HTMLElement>(null);
  // cacheState 统一拥有 SQLite 首屏恢复、实时重读和搜索定位状态。
  const cacheState = useChatPageCacheState({
    conversationID,
    focusedMessageID,
    accountUserID: snapshot.userID,
    dataVersion: snapshot.dataVersion,
    sync,
    messageListRef,
  });
  // 页面 mutation 只消费 cache owner 暴露的稳定状态和 setter。
  const {
    conversation, setConversation, setDraftDocument,
    messages, setMessages, loading, setError, historyPage,
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
  // messageOperations 统一发送 busy、失败关系投影和 SQLite 权威回读。
  const { sending, runMessageOperation, runComposerMessageOperation } = useChatPageMessageOperations({
    conversationID,
    messageCount: messages.length,
    sync,
    onMessagesReloaded: setMessages,
    onSendError: directRelationship.markStrangerFromSendError,
    onError: setError,
  });
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
  // headerState 统一投影在线状态和群待审核角标。
  const headerState = useChatPageHeaderState({
    runtime,
    accountUserID: snapshot.userID,
    conversation,
    dataVersion: snapshot.dataVersion,
    members: mentionMembers.members,
    showGroupOnlineStatus: mentionMembers.showOnlineStatus,
    sync,
  });
  // groupAnnouncement 仅在 shared read-status 判定未读时投影 RN 横幅。
  const groupAnnouncement = useChatGroupAnnouncement({
    conversation,
    messages,
    sync,
    onError: setError,
  });
  // navigationActions 集中持有资料、名片、公告和消息定位的 SPA 路由动作。
  const navigationActions = useChatPageNavigationActions({
    conversationID,
    conversation,
    sync,
    onError: setError,
  });
  // transientActions 统一拥有通话与名片选择弹层及其真实提交动作。
  const transientActions = useChatPageTransientActions({
    conversationID,
    conversation,
    sending,
    runMessageOperation,
    onSendingMessage: handleLocalSendingMessage,
    startOutgoingCall: callOwner.startOutgoing,
    onError: setError,
  });
  // composerState 统一草稿持久化和群头像长按提及请求。
  const composerState = useChatPageComposerState({
    conversationID,
    conversation,
    currentUserID: snapshot.userID,
    sync,
    setConversation,
    setDraftDocument,
    onError: setError,
  });
  /** 接收 SDK 已落库的 sending 实体，不在页面生成消息身份。 */
  function handleLocalSendingMessage(message: Message) {
    setMessages(current => upsertVisibleMessage(current, message));
  }
  if (restoring) return <ChatPageState label="正在恢复会话" />;
  if (!runtime) return <ChatPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  /** composerUnavailableText 在会话身份未知时保持 fail-closed，否则组合各 SDK 投影。 */
  const composerUnavailableText = !conversation
    ? loading
      ? '正在恢复会话'
      : '会话暂不可用，无法发消息'
    : mentionMembers.composerUnavailableReason ||
      directRelationship.presentation.composerUnavailableReason;
  return <ChatPageSurface
    conversationID={conversationID}
    currentUserID={snapshot.userID}
    sync={sync}
    notice={notice}
    sending={sending}
    composerUnavailableText={composerUnavailableText}
    messageListRef={messageListRef}
    cacheState={cacheState}
    clipboardActions={clipboardActions}
    unreadNavigation={unreadNavigation}
    historyPagination={historyPagination}
    quoteSources={quoteSources}
    deleteExit={deleteExit}
    directRelationship={directRelationship}
    outgoingActions={outgoingActions}
    voiceRecorder={voiceRecorder}
    customEmojiActions={customEmojiActions}
    forwardFlow={forwardFlow}
    deleteFlow={deleteFlow}
    editFlow={editFlow}
    mentionMembers={mentionMembers}
    headerState={headerState}
    groupAnnouncement={groupAnnouncement}
    navigationActions={navigationActions}
    transientActions={transientActions}
    composerState={composerState}
  />;
}
