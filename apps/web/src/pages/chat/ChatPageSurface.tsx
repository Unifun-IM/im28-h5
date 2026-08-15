import type { RefObject } from 'react';
import type { WebIMSync } from '@im28/im-sdk/web';

import { CallTypeActionSheet } from '../../components/call/CallTypeActionSheet.js';
import { ChatTargetPickerModal } from '../../components/chat-target-picker/index.js';
import { getConversationTitle } from '../conversations/conversation-list-view.js';
import { ChatComposer } from './ChatComposer.js';
import { ChatGroupAnnouncementBanner } from './ChatGroupAnnouncementBanner.js';
import { ChatHeader } from './ChatHeader.js';
import { ChatMediaInteractionProvider } from './ChatMediaInteractionProvider.js';
import { ChatMessageDeleteSheet } from './ChatMessageDeleteSheet.js';
import { ChatMessageList } from './ChatMessageList.js';
import { ChatPageFeedback } from './ChatPageFeedback.js';
import { ChatPageFooter } from './ChatPageFooter.js';
import type { useChatCustomEmojiActions } from './useChatCustomEmojiActions.js';
import type { useChatDirectRelationship } from './useChatDirectRelationship.js';
import type { useChatForwardFlow } from './useChatForwardFlow.js';
import type { useChatGroupAnnouncement } from './useChatGroupAnnouncement.js';
import type { useChatHistoryPagination } from './useChatHistoryPagination.js';
import type { useChatMentionMembers } from './useChatMentionMembers.js';
import type { useChatMessageClipboard } from './useChatMessageClipboard.js';
import type { useChatMessageDeleteExit } from './useChatMessageDeleteExit.js';
import type { useChatMessageDeleteFlow } from './useChatMessageDeleteFlow.js';
import type { useChatMessageEditFlow } from './useChatMessageEditFlow.js';
import type { useChatOutgoingMessageActions } from './useChatOutgoingMessageActions.js';
import type { useChatPageCacheState } from './useChatPageCacheState.js';
import type { useChatPageComposerState } from './useChatPageComposerState.js';
import type { useChatPageHeaderState } from './useChatPageHeaderState.js';
import type { useChatPageNavigationActions } from './useChatPageNavigationActions.js';
import type { useChatPageTransientActions } from './useChatPageTransientActions.js';
import type { useChatQuoteSources } from './useChatQuoteSources.js';
import type { useChatUnreadNavigation } from './useChatUnreadNavigation.js';
import type { useChatVoiceRecorder } from './useChatVoiceRecorder.js';

/** 聊天页展示层只接收页面已编排完成的状态和动作 owner。 */
export interface ChatPageSurfaceProps {
  readonly conversationID: string;
  readonly currentUserID: string;
  readonly sync: WebIMSync | null;
  readonly notice: string | null;
  readonly sending: boolean;
  readonly composerUnavailableText: string;
  readonly messageListRef: RefObject<HTMLElement | null>;
  readonly cacheState: ReturnType<typeof useChatPageCacheState>;
  readonly clipboardActions: ReturnType<typeof useChatMessageClipboard>;
  readonly unreadNavigation: ReturnType<typeof useChatUnreadNavigation>;
  readonly historyPagination: ReturnType<typeof useChatHistoryPagination>;
  readonly quoteSources: ReturnType<typeof useChatQuoteSources>;
  readonly deleteExit: ReturnType<typeof useChatMessageDeleteExit>;
  readonly directRelationship: ReturnType<typeof useChatDirectRelationship>;
  readonly outgoingActions: ReturnType<typeof useChatOutgoingMessageActions>;
  readonly voiceRecorder: ReturnType<typeof useChatVoiceRecorder>;
  readonly customEmojiActions: ReturnType<typeof useChatCustomEmojiActions>;
  readonly forwardFlow: ReturnType<typeof useChatForwardFlow>;
  readonly deleteFlow: ReturnType<typeof useChatMessageDeleteFlow>;
  readonly editFlow: ReturnType<typeof useChatMessageEditFlow>;
  readonly mentionMembers: ReturnType<typeof useChatMentionMembers>;
  readonly headerState: ReturnType<typeof useChatPageHeaderState>;
  readonly groupAnnouncement: ReturnType<typeof useChatGroupAnnouncement>;
  readonly navigationActions: ReturnType<typeof useChatPageNavigationActions>;
  readonly transientActions: ReturnType<typeof useChatPageTransientActions>;
  readonly composerState: ReturnType<typeof useChatPageComposerState>;
}

/** 渲染聊天页稳定壳层，业务状态仍由 ChatPage 的 hooks 唯一持有。 */
export function ChatPageSurface(props: ChatPageSurfaceProps) {
  /** conversation 是所有展示分支的同一缓存会话事实。 */
  const { conversation, error } = props.cacheState;
  return (
    <main className="rn-chat-page">
      <section className="rn-chat-surface">
        <ChatHeader
          conversation={conversation}
          presence={props.headerState.presence}
          groupApplicationCount={props.headerState.groupApplicationCount}
          multiSelecting={props.forwardFlow.multiSelecting}
          selectedCount={props.forwardFlow.selectedCount}
          onCancelMultiSelect={props.forwardFlow.cancelMultiSelect}
          onOpenProfile={props.navigationActions.openProfile}
          onOpenGroupApplications={props.navigationActions.openGroupApplications}
        />
        <ChatPageFeedback error={error} notice={props.notice} />
        <ChatPageAnnouncement {...props} />
        <ChatPageConversationBody {...props} />
        <ChatPageOverlays {...props} />
      </section>
    </main>
  );
}

/** 只在 shared 公告投影存在时渲染可点击横幅。 */
function ChatPageAnnouncement(props: ChatPageSurfaceProps) {
  /** announcement 保留 shared read-status 判定后的唯一展示结果。 */
  const { announcement, markRead } = props.groupAnnouncement;
  if (!announcement) return null;
  return (
    <ChatGroupAnnouncementBanner
      text={announcement.text}
      onOpen={() => props.navigationActions.openGroupAnnouncement(markRead)}
    />
  );
}

/** 保持消息列表、转发预览与 Composer 共享同一媒体交互 owner。 */
function ChatPageConversationBody(props: ChatPageSurfaceProps) {
  /** isGroup 只由缓存 Conversation 类型决定布局。 */
  const isGroup = props.cacheState.conversation?.type === 'group';
  return (
    <ChatMediaInteractionProvider
      userID={props.currentUserID}
      conversationID={props.conversationID}
      messages={props.cacheState.messages}
      isGroup={isGroup}
    >
      <ChatPageMessageTimeline {...props} />
      <ChatPageComposerArea {...props} />
    </ChatMediaInteractionProvider>
  );
}

/** 将消息列表属性映射限制在纯展示层，不解析消息或权限 payload。 */
function ChatPageMessageTimeline(props: ChatPageSurfaceProps) {
  /** cacheState 提供列表渲染所需的稳定 SQLite 快照。 */
  const { cacheState } = props;
  /** isGroup 控制群发送者投影和群头像交互。 */
  const isGroup = cacheState.conversation?.type === 'group';
  return (
    <ChatMessageList
      conversationID={props.conversationID}
      messages={props.deleteExit.displayMessages}
      quoteSourceMessages={props.quoteSources.messages}
      unavailableQuoteSourceIDs={props.quoteSources.unavailableIDs}
      isGroup={isGroup}
      currentUserID={props.currentUserID}
      groupMembers={props.mentionMembers.members}
      loading={cacheState.loading}
      historyLoading={props.historyPagination.loadingMore}
      stickyDateLabel={props.historyPagination.stickyDateLabel}
      listRef={props.messageListRef}
      customEmojiActionDisabled={props.customEmojiActions.mutating}
      onAddCustomEmoji={props.customEmojiActions.add}
      retryDisabled={props.sending}
      onRetryMessage={props.outgoingActions.retry}
      onQuoteMessage={message => { props.editFlow.cancelEdit(); cacheState.setQuoteMessage(message); }}
      onCopyMessage={props.clipboardActions.copyMessage}
      onCopyLink={props.clipboardActions.copyLink}
      onOpenCard={view => { void props.navigationActions.openCard(view); }}
      {...(isGroup ? {} : { onStartCall: (mediaType: 'audio' | 'video') => { void props.transientActions.startCall(mediaType); } })}
      multiSelecting={props.forwardFlow.multiSelecting}
      selectedMessageIDs={props.forwardFlow.selectedIDs}
      onToggleSelectedMessage={props.forwardFlow.toggleSelectedMessage}
      onForwardMessage={props.forwardFlow.forwardMessage}
      onBeginMultiSelect={props.forwardFlow.beginMultiSelect}
      onDeleteMessage={message => props.deleteFlow.requestDelete([message.clientMsgID])}
      onEditMessage={message => { cacheState.setQuoteMessage(null); props.editFlow.beginEdit(message); }}
      onMentionGroupMember={props.composerState.requestMention}
      unreadNavigation={props.unreadNavigation.navigation}
      remainingUnreadCount={props.unreadNavigation.remainingUnreadCount}
      onScrollToNextUnread={props.unreadNavigation.scrollToNextUnread}
      onOpenQuotedMessage={props.navigationActions.openQuotedMessage}
      exitingMessageIDs={props.deleteExit.exitingMessageIDs}
      onMessageExitComplete={props.deleteExit.finish}
      bottomNoticeText={props.directRelationship.presentation.noticeText}
      bottomNoticeActionLabel={props.directRelationship.presentation.noticeActionLabel}
      onBottomNoticeAction={props.navigationActions.openDirectContactApplication}
    />
  );
}

/** 在多选、不可用和普通 Composer 三态之间复用既有底部 owner。 */
function ChatPageComposerArea(props: ChatPageSurfaceProps) {
  /** cacheState 提供草稿、引用和会话展示事实。 */
  const { cacheState } = props;
  /** isGroup 控制群提及和单聊通话入口。 */
  const isGroup = cacheState.conversation?.type === 'group';
  return (
    <ChatPageFooter
      forwardFlow={props.forwardFlow}
      unavailableText={props.composerUnavailableText}
      onDeleteSelected={() => props.deleteFlow.requestDelete([...props.forwardFlow.selectedIDs], props.forwardFlow.cancelMultiSelect)}
    >
      <ChatComposer
        key={props.conversationID}
        initialDraftDocument={cacheState.draftDocument}
        onDraftDocumentChange={props.composerState.changeDraftDocument}
        forwardDraft={props.forwardFlow.pending ? {
          pending: props.forwardFlow.pending,
          recipientName: cacheState.conversation ? getConversationTitle(cacheState.conversation) : '',
          onCancel: props.forwardFlow.clearPendingForward,
          onChangeTarget: props.forwardFlow.changeForwardTarget,
          onSubmit: props.forwardFlow.submitForward,
        } : null}
        sending={props.sending} quoteMessage={cacheState.quoteMessage}
        isGroup={isGroup}
        onCancelQuote={() => cacheState.setQuoteMessage(null)}
        onSendQuote={props.outgoingActions.sendQuote}
        voiceRecordingStatus={props.voiceRecorder.status} voiceRecordingSeconds={props.voiceRecorder.seconds}
        voiceRecordingLevel={props.voiceRecorder.level}
        onSendText={props.outgoingActions.sendText} onSendMention={props.outgoingActions.sendMention}
        mentionMembers={props.mentionMembers.members} canMentionAll={props.mentionMembers.canMentionAll}
        currentUserID={props.currentUserID}
        mentionRequest={props.composerState.mentionRequest}
        editingMessage={props.editFlow.editingMessage} onCancelEdit={props.editFlow.cancelEdit}
        onEditText={props.editFlow.submitEdit}
        onSendAlbum={props.outgoingActions.sendAlbum} onSendSubmission={props.outgoingActions.sendSubmission}
        showCallAction={!isGroup}
        onOpenCallPicker={props.transientActions.openCallPicker}
        onOpenCardPicker={props.transientActions.openCardPicker}
        loadCachedCustomEmojis={props.customEmojiActions.loadCached} syncCustomEmojis={props.customEmojiActions.refresh}
        onSendCustomEmoji={props.customEmojiActions.send}
        onManageCustomEmojis={props.navigationActions.openCustomEmojiManager}
        onVoiceRecordStart={props.voiceRecorder.start}
        onVoiceRecordSend={props.voiceRecorder.send}
        onVoiceRecordCancel={props.voiceRecorder.cancel}
        onError={cacheState.setError}
      />
    </ChatPageFooter>
  );
}

/** 集中渲染删除、转发、通话和名片选择弹层，不持有弹层状态。 */
function ChatPageOverlays(props: ChatPageSurfaceProps) {
  /** conversation 为弹层提供目标名称和排除身份。 */
  const { conversation, error } = props.cacheState;
  /** excludedCardUserIDs 防止把本人或单聊对端作为名片发送目标。 */
  const excludedCardUserIDs = conversation?.type === 'single'
    ? [props.currentUserID, conversation.targetID]
    : [props.currentUserID];
  return (
    <>
      <ChatMessageDeleteSheet flow={props.deleteFlow} />
      <ChatTargetPickerModal open={props.forwardFlow.targetPickerOpen} sync={props.sync}
        selectionMode="single" excludeUserIDs={[props.currentUserID]} actionLabel="转发"
        pending={props.forwardFlow.targetSubmitting} operationError={error}
        onClose={props.forwardFlow.closeTargetPicker}
        onConfirm={targets => { void props.forwardFlow.continueForwardToTarget(targets); }} />
      <CallTypeActionSheet open={props.transientActions.callPickerVisible && conversation?.type === 'single'}
        peerName={conversation ? getConversationTitle(conversation) : ''}
        pending={props.transientActions.callStarting} onClose={props.transientActions.closeCallPicker}
        onSelect={mediaType => { void props.transientActions.startCall(mediaType); }} />
      <ChatTargetPickerModal open={props.transientActions.cardPickerVisible} sync={props.sync}
        selectionMode="single" excludeUserIDs={excludedCardUserIDs} actionLabel="分享"
        pending={props.sending} operationError={error} onClose={props.transientActions.closeCardPicker}
        onConfirm={targets => { void props.transientActions.sendSelectedCard(targets); }} />
    </>
  );
}
