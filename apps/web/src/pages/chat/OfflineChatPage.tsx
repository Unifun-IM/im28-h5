import { useEffect, useRef, useState } from 'react';
import type {
  Conversation,
  Message,
  WebIMOfflineReader,
} from '@im28/im-sdk/web';
import { useParams } from 'react-router-dom';

import { ChatMediaInteractionProvider } from './ChatMediaInteractionProvider.js';
import { ChatHeader } from './ChatHeader.js';
import { ChatMessageList } from './ChatMessageList.js';
import { ChatPageFeedback } from './ChatPageFeedback.js';
import { ChatUnavailableComposerBar } from './ChatUnavailableComposerBar.js';
import type { ChatMessageView } from './chat-message-view.js';
import './chat-page.css';

/** 离线聊天页只接收 runtime 授予的 cache-only reader。 */
interface OfflineChatPageProps {
  readonly reader: WebIMOfflineReader;
  readonly userID: string;
}

/** 只读呈现缓存会话身份和最近消息窗口，不挂载任何 mutation hook。 */
export function OfflineChatPage({ reader, userID }: OfflineChatPageProps) {
  // conversationID 只来自 React Router SPA 参数。
  const { conversationID = '' } = useParams();
  // conversation 保存缓存列表中与路由精确匹配的会话。
  const [conversation, setConversation] = useState<Conversation | null>(null);
  // messages 保持 Repository newest-first 结果供现有列表投影。
  const [messages, setMessages] = useState<readonly Message[]>([]);
  // loading 仅覆盖两个 cache query。
  const [loading, setLoading] = useState(true);
  // error 显式展示缺失会话、快照失效或读取失败。
  const [error, setError] = useState<string | null>(null);
  // listRef 保持现有消息列表的底部布局与滚动容器。
  const listRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!conversationID) {
      setError('会话地址无效');
      setLoading(false);
      return;
    }
    // active 防止重连或退出后旧 reader 回写已卸载页面。
    let active = true;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        // items 只来自当前账号 SQLite 的既有未归档会话。
        const [activeItems, archivedItems] = await Promise.all([
          reader.conversations.listCachedItems({ archived: false, limit: 500 }),
          reader.conversations.listCachedItems({ archived: true, limit: 500 }),
        ]);
        // items 合并两类只读缓存，使归档会话直达仍可恢复身份。
        const items = [...activeItems, ...archivedItems];
        // target 必须与当前路由会话身份精确匹配。
        const target = items.find(
          item => item.conversation.conversationID === conversationID,
        )?.conversation ?? null;
        if (!target) throw new Error('该会话没有可用的离线缓存');
        // cachedMessages 是合同允许的唯一消息历史读取。
        const cachedMessages = await reader.messages.getCachedHistory({
          conversationID,
          limit: 50,
        });
        if (active) {
          setConversation(target);
          setMessages(cachedMessages);
        }
      } catch (cause) {
        if (active) setError(readOfflineChatError(cause));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [conversationID, reader]);

  return (
    <main className="rn-chat-page is-offline-readonly">
      <section className="rn-chat-surface">
        <ChatHeader
          conversation={conversation}
          presence={{ text: '离线', dot: 'offline' }}
          groupApplicationCount={0}
          readOnly
          onOpenProfile={() => undefined}
          onOpenGroupApplications={() => undefined}
        />
        <ChatPageFeedback error={error} notice={null} />
        <ChatMediaInteractionProvider
          userID={userID}
          conversationID={conversationID}
          messages={messages}
          isGroup={conversation?.type === 'group'}
        >
          <div className="im-offline-chat-history">
            <ChatMessageList
              conversationID={conversationID}
              messages={messages}
              quoteSourceMessages={[]}
              unavailableQuoteSourceIDs={new Set<string>()}
              isGroup={conversation?.type === 'group'}
              currentUserID={userID}
              groupMembers={[]}
              readOnly
              loading={loading}
              historyLoading={false}
              stickyDateLabel=""
              listRef={listRef}
              customEmojiActionDisabled
              onAddCustomEmoji={async () => false}
              retryDisabled
              onRetryMessage={async () => undefined}
              onQuoteMessage={() => undefined}
              onCopyMessage={async (_view: ChatMessageView) => false}
              onCopyLink={async () => false}
              multiSelecting={false}
              selectedMessageIDs={new Set<string>()}
              onToggleSelectedMessage={() => undefined}
              onForwardMessage={() => undefined}
              onBeginMultiSelect={() => undefined}
              onDeleteMessage={() => undefined}
              onEditMessage={() => undefined}
              onMentionGroupMember={() => undefined}
              unreadNavigation={{ unreadMessageIDs: [] }}
              remainingUnreadCount={0}
              onScrollToNextUnread={() => undefined}
              onOpenQuotedMessage={() => undefined}
              exitingMessageIDs={new Set<string>()}
              onMessageExitComplete={() => undefined}
              bottomNoticeText=""
              bottomNoticeActionLabel=""
              onBottomNoticeAction={() => undefined}
            />
          </div>
        </ChatMediaInteractionProvider>
        <ChatUnavailableComposerBar text="离线只读，恢复连接后可发送消息" />
      </section>
    </main>
  );
}

/** 将离线聊天读取异常转换为稳定页面文案。 */
function readOfflineChatError(cause: unknown): string {
  return cause instanceof Error && cause.message
    ? cause.message
    : '缓存消息读取失败';
}
