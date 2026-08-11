import type { Message } from '@im28/im-sdk/web';
import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';

import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { getChatMessageView } from './chat-message-view.js';
import { formatChatMessageSearchDate, splitChatMessageSearchText } from './chat-message-search-view.js';

/** RN 关键词结果页允许全部和文件两种真实查询 tab。 */
export type ChatSearchTextTab = 'all' | 'file';

/** 关键词结果页属性保持查询状态和展示模型分离。 */
interface ChatSearchTextResultsProps {
  readonly loading: boolean;
  readonly error: string | null;
  readonly searched: boolean;
  readonly query: string;
  readonly activeTab: ChatSearchTextTab;
  readonly results: readonly Message[];
  readonly isGroup: boolean;
  readonly conversationTitle: string;
  readonly currentUserID: string;
  readonly chatURL: string;
  readonly onTabChange: (tab: ChatSearchTextTab) => void;
  readonly onOpenMedia: () => void;
}

/** 复刻 RN 全部/图片与视频/文件 tab 和关键词结果列表。 */
export function ChatSearchTextResults({
  loading,
  error,
  searched,
  query,
  activeTab,
  results,
  isGroup,
  conversationTitle,
  currentUserID,
  chatURL,
  onTabChange,
  onOpenMedia,
}: ChatSearchTextResultsProps) {
  /** needsKeyword 约束全部和文件 tab 不能执行空关键词查询。 */
  const needsKeyword = !query.trim();
  return (
    <section className="rn-chat-search-text-page">
      <div className="rn-chat-search-tabs" role="tablist" aria-label="聊天记录类型">
        <button type="button" role="tab" aria-selected={activeTab === 'all'} onClick={() => onTabChange('all')}>全部</button>
        <button type="button" role="tab" aria-selected="false" onClick={onOpenMedia}>图片与视频</button>
        <button type="button" role="tab" aria-selected={activeTab === 'file'} onClick={() => onTabChange('file')}>文件</button>
      </div>
      <section className="rn-chat-search-results" aria-live="polite" aria-busy={loading}>
        {loading ? <ChatMessageSearchState label="搜索中" compact /> : null}
        {!loading && error ? <ChatMessageSearchState label={error} compact /> : null}
        {!loading && !error && needsKeyword ? <ChatMessageSearchState label="输入关键词查找聊天记录" compact /> : null}
        {!loading && !error && !needsKeyword && !searched ? <ChatMessageSearchState label="点击键盘搜索查找聊天记录" compact /> : null}
        {!loading && !error && !needsKeyword && searched && results.length === 0 ? <ChatMessageSearchState label="没有找到相关聊天记录" compact /> : null}
        {!loading && !error && !needsKeyword ? results.map(message => (
          <ChatMessageSearchResult
            key={message.clientMsgID}
            message={message}
            query={query}
            isGroup={isGroup}
            conversationTitle={conversationTitle}
            currentUserID={currentUserID}
            chatURL={chatURL}
          />
        )) : null}
      </section>
    </section>
  );
}

/** 单条搜索结果复刻 RN 40px 头像、发送人、日期和高亮摘要。 */
function ChatMessageSearchResult({
  message,
  query,
  isGroup,
  conversationTitle,
  currentUserID,
  chatURL,
}: {
  readonly message: Message;
  readonly query: string;
  readonly isGroup: boolean;
  readonly conversationTitle: string;
  readonly currentUserID: string;
  readonly chatURL: string;
}) {
  /** view 复用聊天气泡对 Gateway payload 的唯一可见正文投影。 */
  const view = getChatMessageView(message, isGroup);
  /** sender 对齐本人、单聊会话名和群发送人身份回退。 */
  const sender = message.senderID === currentUserID
    ? '我'
    : (!isGroup && conversationTitle) || message.senderID || '聊天记录';
  /** avatarStyle 复用 RN fallback 头像颜色算法。 */
  const avatarStyle = { '--chat-search-avatar-gradient': getRNAvatarGradient(message.senderID) } as CSSProperties;
  /** segments 保留摘要原文并突出所有关键词命中。 */
  const segments = splitChatMessageSearchText(view.text, query);
  /** targetURL 只携带稳定 client ID，刷新后由当前账号 SQLite 重读。 */
  const targetURL = `${chatURL}?messageID=${encodeURIComponent(message.clientMsgID)}`;
  return (
    <Link className="rn-chat-search-result" to={targetURL}>
      <span className="rn-chat-search-avatar" style={avatarStyle}>{getRNAvatarInitial(sender)}</span>
      <span className="rn-chat-search-result-copy">
        <span className="rn-chat-search-result-meta"><strong>{sender}</strong><time>{formatChatMessageSearchDate(message.sendTime)}</time></span>
        <span className="rn-chat-search-preview">
          {segments.map((segment, index) => (
            <span key={`${segment.text}-${index}`} className={segment.highlighted ? 'is-highlighted' : undefined}>{segment.text}</span>
          ))}
        </span>
      </span>
    </Link>
  );
}

/** 搜索页启动、加载、空和错误状态使用同一稳定布局。 */
export function ChatMessageSearchState({ label, detail, compact = false }: {
  readonly label: string;
  readonly detail?: string | null;
  readonly compact?: boolean;
}) {
  return (
    <div className={`rn-chat-search-state${compact ? ' is-compact' : ''}`} role="status">
      <strong>{label}</strong>
      {detail ? <span>{detail}</span> : null}
    </div>
  );
}
