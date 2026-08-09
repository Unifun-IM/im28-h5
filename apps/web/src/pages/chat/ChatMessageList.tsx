import { useMemo, type RefObject } from 'react';
import type { Message } from '@im28/im-sdk-web';

import { ChatMessageBubble } from './ChatMessageBubble.js';
import { buildChatMessageListEntries } from './chat-message-list-view.js';

/** RN 消息列表只消费 Repository 消息和页面加载状态。 */
interface ChatMessageListProps {
  readonly messages: readonly Message[];
  readonly isGroup: boolean;
  readonly loading: boolean;
  readonly listRef: RefObject<HTMLElement | null>;
}

/** 呈现 RN 日期行、连续气泡、骨架与空状态。 */
export function ChatMessageList({
  messages,
  isGroup,
  loading,
  listRef,
}: ChatMessageListProps) {
  // entries 只在消息窗口或会话类型变化时重新计算。
  const entries = useMemo(
    () => buildChatMessageListEntries(messages, isGroup),
    [isGroup, messages],
  );

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
