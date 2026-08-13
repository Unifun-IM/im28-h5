import { useMemo, type RefObject } from 'react';
import type {
  IMInitialUnreadNavigation,
  Message,
  WebIMGroupMember,
} from '@im28/im-sdk/web';

import { ChatMessageBubble } from './ChatMessageBubble.js';
import { buildChatMessageListEntries } from './chat-message-list-view.js';
import type { ChatMessageView } from './chat-message-view.js';
import {
  resolveChatQuoteSource,
} from './chat-quote-view.js';
import { focusChatMessageRow } from './chat-message-focus.js';
import { indexChatGroupMembers } from './chat-group-message-view.js';
import { useTailItemMotion } from '../../components/interaction/index.js';

/** RN 消息列表只消费 Repository 消息和页面加载状态。 */
interface ChatMessageListProps {
  readonly conversationID: string;
  readonly messages: readonly Message[];
  readonly quoteSourceMessages: readonly Message[];
  readonly unavailableQuoteSourceIDs: ReadonlySet<string>;
  readonly isGroup: boolean;
  readonly currentUserID: string;
  readonly groupMembers: readonly WebIMGroupMember[];
  readonly loading: boolean;
  readonly historyLoading: boolean;
  readonly stickyDateLabel: string;
  readonly listRef: RefObject<HTMLElement | null>;
  readonly customEmojiActionDisabled: boolean;
  readonly onAddCustomEmoji: (emojiID: string) => Promise<boolean>;
  readonly retryDisabled: boolean;
  readonly onRetryMessage: (clientMsgID: string) => Promise<void>;
  readonly onQuoteMessage: (message: Message) => void;
  readonly onCopyMessage: (view: ChatMessageView) => Promise<boolean>;
  readonly onCopyLink: (url: string) => Promise<boolean>;
  readonly multiSelecting: boolean;
  readonly selectedMessageIDs: ReadonlySet<string>;
  readonly onToggleSelectedMessage: (message: Message) => void;
  readonly onForwardMessage: (message: Message) => void;
  readonly onBeginMultiSelect: (message: Message) => void;
  readonly onDeleteMessage: (message: Message) => void;
  readonly onEditMessage: (message: Message) => void;
  readonly onMentionGroupMember: (member: WebIMGroupMember) => void;
  readonly unreadNavigation: IMInitialUnreadNavigation;
  readonly remainingUnreadCount: number;
  readonly onScrollToNextUnread: () => void;
  readonly onOpenQuotedMessage: (message: Message) => void;
  readonly exitingMessageIDs: ReadonlySet<string>;
  readonly onMessageExitComplete: (clientMsgID: string) => void;
}

/** 呈现 RN 日期行、连续气泡、骨架与空状态。 */
export function ChatMessageList({
  conversationID,
  messages,
  quoteSourceMessages,
  unavailableQuoteSourceIDs,
  isGroup,
  currentUserID,
  groupMembers,
  loading,
  historyLoading,
  stickyDateLabel,
  listRef,
  customEmojiActionDisabled,
  onAddCustomEmoji,
  retryDisabled,
  onRetryMessage,
  onQuoteMessage,
  onCopyMessage,
  onCopyLink,
  multiSelecting,
  selectedMessageIDs,
  onToggleSelectedMessage,
  onForwardMessage,
  onBeginMultiSelect,
  onDeleteMessage,
  onEditMessage,
  onMentionGroupMember,
  unreadNavigation,
  remainingUnreadCount,
  onScrollToNextUnread,
  onOpenQuotedMessage,
  exitingMessageIDs,
  onMessageExitComplete,
}: ChatMessageListProps) {
  useTailItemMotion({
    containerRef: listRef,
    itemSelector: '.rn-chat-message-row',
    motionClassName: 'im-message-enter',
    enabled: !loading,
  });
  // entries 只在消息窗口或会话类型变化时重新计算。
  const entries = useMemo(
    () => buildChatMessageListEntries(
      messages,
      isGroup,
      currentUserID,
      unreadNavigation,
    ),
    [currentUserID, isGroup, messages, unreadNavigation],
  );
  // membersByID 复用当前页面已同步的 SDK 群成员快照。
  const membersByID = useMemo(
    () => indexChatGroupMembers(groupMembers),
    [groupMembers],
  );
  // quoteLookupMessages 合并可见窗口和 SQLite 恢复来源，不改变消息列表条目。
  const quoteLookupMessages = useMemo(
    () => [...messages, ...quoteSourceMessages],
    [messages, quoteSourceMessages],
  );

  /** 将已解析引用来源滚动到列表中央并短暂聚焦。 */
  function handleOpenQuotedMessage(message: Message) {
    if (!focusChatMessageRow(listRef.current, message.clientMsgID)) {
      onOpenQuotedMessage(message);
    }
  }

  return (
    <div className="rn-chat-message-stage">
      <section
        ref={listRef}
        className="rn-chat-message-list"
        aria-label="消息记录"
        aria-busy={loading}
      >
        {historyLoading ? (
          <p className="rn-chat-history-loading" role="status">正在加载更早消息</p>
        ) : null}
        {loading && messages.length === 0 ? <ChatMessageSkeleton /> : null}
        {!loading && entries.length === 0 ? (
          <p className="rn-chat-message-empty">暂无消息记录</p>
        ) : null}
        {entries.map(entry =>
          entry.kind === 'date' ? (
            <time className="rn-chat-date-separator" key={entry.key}>
              {entry.label}
            </time>
          ) : entry.kind === 'unread' ? (
            <div className="rn-chat-unread-divider" key={entry.key}>
              <span />
              <strong>未读消息</strong>
              <span />
            </div>
          ) : (
            <ChatMessageBubble
            key={entry.key}
            entry={entry}
            isGroup={isGroup}
            conversationID={conversationID}
            membersByID={membersByID}
            customEmojiActionDisabled={customEmojiActionDisabled}
            onAddCustomEmoji={onAddCustomEmoji}
            retryDisabled={retryDisabled}
            onRetryMessage={onRetryMessage}
            quoteSource={
              entry.view.kind === 'quote'
                ? resolveChatQuoteSource(
                    quoteLookupMessages,
                    entry.view.quoteMessageID ?? '',
                    isGroup,
                    membersByID,
                    unavailableQuoteSourceIDs,
                  )
                : null
            }
            onQuoteMessage={onQuoteMessage}
            onCopyMessage={onCopyMessage}
            onCopyLink={onCopyLink}
            onOpenQuotedMessage={handleOpenQuotedMessage}
            multiSelecting={multiSelecting}
            selected={selectedMessageIDs.has(entry.message.clientMsgID)}
            onToggleSelection={onToggleSelectedMessage}
            onForwardMessage={onForwardMessage}
            onBeginMultiSelect={onBeginMultiSelect}
            onDeleteMessage={onDeleteMessage}
            onEditMessage={onEditMessage}
            onMentionGroupMember={onMentionGroupMember}
            exiting={exitingMessageIDs.has(entry.message.clientMsgID)}
            onExitComplete={onMessageExitComplete}
            />
          ),
        )}
      </section>
      {stickyDateLabel ? (
        <time className="rn-chat-sticky-date" aria-live="off">
          {stickyDateLabel}
        </time>
      ) : null}
      {remainingUnreadCount > 0 ? (
        <button
          className="rn-chat-unread-indicator"
          type="button"
          aria-label={`定位下一条未读消息，共${remainingUnreadCount}条`}
          onClick={onScrollToNextUnread}
        >
          {remainingUnreadCount > 99 ? '99+' : remainingUnreadCount}条未读
        </button>
      ) : null}
    </div>
  );
}

/** 复刻 RN 冷首屏交错气泡骨架，避免加载期空白。 */
function ChatMessageSkeleton() {
  return (
    <div className="rn-chat-message-skeleton" aria-label="正在加载消息">
      <span className="is-peer is-short" />
      <span className="is-mine is-medium" />
      <span className="is-peer is-long" />
      <span className="is-mine is-short" />
    </div>
  );
}
