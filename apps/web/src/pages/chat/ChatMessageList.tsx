import { useMemo, type RefObject } from 'react';
import type { Message } from '@im28/im-sdk/web';

import { ChatMessageBubble } from './ChatMessageBubble.js';
import { buildChatMessageListEntries } from './chat-message-list-view.js';
import type { ChatMessageView } from './chat-message-view.js';
import {
  resolveChatQuoteSource,
} from './chat-quote-view.js';

/** RN 消息列表只消费 Repository 消息和页面加载状态。 */
interface ChatMessageListProps {
  readonly messages: readonly Message[];
  readonly isGroup: boolean;
  readonly loading: boolean;
  readonly listRef: RefObject<HTMLElement | null>;
  readonly customEmojiActionDisabled: boolean;
  readonly onAddCustomEmoji: (emojiID: string) => Promise<boolean>;
  readonly retryDisabled: boolean;
  readonly onRetryMessage: (clientMsgID: string) => Promise<void>;
  readonly onQuoteMessage: (message: Message) => void;
  readonly onCopyMessage: (view: ChatMessageView) => Promise<boolean>;
  readonly multiSelecting: boolean;
  readonly selectedMessageIDs: ReadonlySet<string>;
  readonly onToggleSelectedMessage: (message: Message) => void;
  readonly onForwardMessage: (message: Message) => void;
  readonly onBeginMultiSelect: (message: Message) => void;
  readonly onDeleteMessage: (message: Message) => void;
  readonly onEditMessage: (message: Message) => void;
}

/** 呈现 RN 日期行、连续气泡、骨架与空状态。 */
export function ChatMessageList({
  messages,
  isGroup,
  loading,
  listRef,
  customEmojiActionDisabled,
  onAddCustomEmoji,
  retryDisabled,
  onRetryMessage,
  onQuoteMessage,
  onCopyMessage,
  multiSelecting,
  selectedMessageIDs,
  onToggleSelectedMessage,
  onForwardMessage,
  onBeginMultiSelect,
  onDeleteMessage,
  onEditMessage,
}: ChatMessageListProps) {
  // entries 只在消息窗口或会话类型变化时重新计算。
  const entries = useMemo(
    () => buildChatMessageListEntries(messages, isGroup),
    [isGroup, messages],
  );

  /** 将已解析引用来源滚动到列表中央并短暂聚焦。 */
  function handleOpenQuotedMessage(message: Message) {
    // list 是唯一允许滚动的消息容器。
    const list = listRef.current;
    if (!list) return;
    // nodes 只在当前可见缓存窗口查找真实来源行。
    const nodes = list.querySelectorAll<HTMLElement>('.rn-chat-message-row');
    // target 同时匹配 source 的 server/client ID。
    const target = Array.from(nodes).find(
      node =>
        node.dataset.clientMessageId === message.clientMsgID ||
        Boolean(
          message.serverMsgID &&
          node.dataset.serverMessageId === message.serverMsgID,
        ),
    );
    target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    target?.animate(
      [
        { backgroundColor: 'transparent' },
        { backgroundColor: 'var(--im-bg-pressed)' },
        { backgroundColor: 'transparent' },
      ],
      { duration: 900 },
    );
  }

  return (
    <section
      ref={listRef}
      className="rn-chat-message-list"
      aria-label="消息记录"
      aria-busy={loading}
    >
      {loading && messages.length === 0 ? <ChatMessageSkeleton /> : null}
      {!loading && entries.length === 0 ? (
        <p className="rn-chat-message-empty">暂无消息记录</p>
      ) : null}
      {entries.map(entry =>
        entry.kind === 'date' ? (
          <time className="rn-chat-date-separator" key={entry.key}>
            {entry.label}
          </time>
        ) : (
          <ChatMessageBubble
            key={entry.key}
            entry={entry}
            isGroup={isGroup}
            customEmojiActionDisabled={customEmojiActionDisabled}
            onAddCustomEmoji={onAddCustomEmoji}
            retryDisabled={retryDisabled}
            onRetryMessage={onRetryMessage}
            quoteSource={
              entry.view.kind === 'quote'
                ? resolveChatQuoteSource(
                    messages,
                    entry.view.quoteMessageID ?? '',
                    isGroup,
                  )
                : null
            }
            onQuoteMessage={onQuoteMessage}
            onCopyMessage={onCopyMessage}
            onOpenQuotedMessage={handleOpenQuotedMessage}
            multiSelecting={multiSelecting}
            selected={selectedMessageIDs.has(entry.message.clientMsgID)}
            onToggleSelection={onToggleSelectedMessage}
            onForwardMessage={onForwardMessage}
            onBeginMultiSelect={onBeginMultiSelect}
            onDeleteMessage={onDeleteMessage}
            onEditMessage={onEditMessage}
          />
        ),
      )}
    </section>
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
