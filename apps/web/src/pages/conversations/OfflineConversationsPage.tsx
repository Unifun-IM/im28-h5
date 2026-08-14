import { useEffect, useMemo, useState } from 'react';
import type {
  WebIMConversationListItem,
  WebIMOfflineReader,
} from '@im28/im-sdk/web';

import emptyChatIconURL from '../../assets/rn/assets/icons/empty-chat.svg';
import { ConversationRow } from './ConversationRow.js';
import { getConversationUnreadTotal } from './conversation-list-view.js';
import './conversations-page.css';

/** 离线会话页只接收 runtime 授予的 cache-only reader。 */
interface OfflineConversationsPageProps {
  readonly reader: WebIMOfflineReader;
  readonly userID: string;
}

/** 呈现当前账号已有快照，不创建搜索、刷新或会话 mutation 入口。 */
export function OfflineConversationsPage({
  reader,
  userID,
}: OfflineConversationsPageProps) {
  // items 保存只读 SQLite 返回的未归档会话组合项。
  const [items, setItems] = useState<readonly WebIMConversationListItem[]>([]);
  // loading 只覆盖本次本地快照读取。
  const [loading, setLoading] = useState(true);
  // error 显式展示快照失效或读取失败。
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // active 防止退出或重连后旧 reader 结果写回已卸载页面。
    let active = true;
    setLoading(true);
    setError(null);
    void reader.conversations
      .listCachedItems({ archived: false, limit: 100 })
      .then(nextItems => {
        if (active) setItems(nextItems);
      })
      .catch(cause => {
        if (active) setError(readOfflineConversationError(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reader, userID]);

  // unreadTotal 仅投影缓存事实，不提交 mark-read。
  const unreadTotal = useMemo(() => getConversationUnreadTotal(items), [items]);
  // headerTitle 保持 RN 会话页未读标题格式。
  const headerTitle = unreadTotal
    ? `聊天(${unreadTotal > 999 ? '999+' : unreadTotal})`
    : '聊天';
  return (
    <main className="rn-conversation-page is-offline-readonly">
      <section className="rn-conversation-surface" aria-busy={loading}>
        <header className="rn-conversation-header">
          <div className="rn-conversation-header-top">
            <span className="rn-conversation-header-side" aria-hidden="true" />
            <h1>{headerTitle}</h1>
            <span className="rn-conversation-header-side" aria-hidden="true" />
          </div>
        </header>
        {error ? <p className="rn-conversation-error" role="status">{error}</p> : null}
        <section className="rn-conversation-list" aria-label="离线会话列表">
          {loading && items.length === 0 ? (
            <div className="rn-conversation-loading" aria-label="正在读取缓存会话"><span /></div>
          ) : items.length ? (
            items.map(item => (
              <ConversationRow
                key={item.conversation.conversationID}
                item={item}
                currentUserID={userID}
                online={false}
                actionsEnabled={false}
                onOpenActions={() => undefined}
              />
            ))
          ) : (
            <div className="rn-conversation-empty">
              <img src={emptyChatIconURL} width="72" height="56" alt="" />
              <p>暂无已缓存的会话</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

/** 将离线会话读取异常转换为稳定页面文案。 */
function readOfflineConversationError(cause: unknown): string {
  return cause instanceof Error && cause.message
    ? cause.message
    : '缓存会话读取失败';
}
