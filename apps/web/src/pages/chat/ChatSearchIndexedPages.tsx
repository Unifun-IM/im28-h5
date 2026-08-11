import type { Message } from '@im28/im-sdk/web';
import { Link } from 'react-router-dom';

import fileIconURL from '../../assets/rn/assets/icons/imm28/doc.svg';
import playIconURL from '../../assets/rn/assets/icons/imm28/play.solid.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { getChatMediaPreview, normalizeChatMediaURL } from './chat-media-view.js';
import { getChatMessageView, type ChatMessageView } from './chat-message-view.js';
import { formatChatMessageSearchDate } from './chat-message-search-view.js';
import {
  CHAT_SEARCH_IMAGE_TYPE,
  CHAT_SEARCH_VIDEO_TYPE,
  getChatSearchFileExtension,
  groupChatSearchMessagesByMonth,
  type ChatSearchCalendarMonth,
  type ChatSearchMediaFilter,
} from './chat-search-indexed-view.js';

/** RN 日历使用周一到周日标题。 */
const CHAT_SEARCH_WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

/** 日期页消费预先构造的月份模型和稳定聊天路由。 */
interface ChatSearchDatePageProps {
  readonly months: readonly ChatSearchCalendarMonth[];
  readonly chatURL: string;
  readonly loading: boolean;
  readonly error: string | null;
  readonly onLoadPreviousMonth: () => void;
  readonly onSelectDay: (dayKey: string) => void;
}

/** 复刻 RN 周一开头的按日期查找页面。 */
export function ChatSearchDatePage({
  months,
  chatURL,
  loading,
  error,
  onLoadPreviousMonth,
  onSelectDay,
}: ChatSearchDatePageProps) {
  return (
    <section className="rn-chat-search-indexed-page rn-chat-search-calendar-page">
      <button type="button" className="rn-chat-search-load-month" disabled={loading} onClick={onLoadPreviousMonth}>
        {loading ? '加载聊天日期' : '加载更早月份'}
      </button>
      {error ? <p className="rn-chat-search-error" role="alert">{error}</p> : null}
      {months.map(month => (
        <section className="rn-chat-search-calendar-month" key={month.key}>
          <h2>{month.title}</h2>
          <div className="rn-chat-search-calendar-week" aria-hidden="true">
            {CHAT_SEARCH_WEEKDAYS.map(label => <span key={label}>{label}</span>)}
          </div>
          <div className="rn-chat-search-calendar-grid">
            {month.days.map(day => {
              /** disabled 与 RN 一样阻止跨月或无消息日期。 */
              const disabled = !day.isCurrentMonth || !day.firstMessage;
              /** href 只携带当天最早缓存消息的稳定 ID。 */
              const href = day.firstMessage
                ? `${chatURL}?messageID=${encodeURIComponent(day.firstMessage.clientMsgID)}`
                : '';
              /** className 聚合日历单元格的可见状态。 */
              const className = [
                'rn-chat-search-calendar-day',
                !day.isCurrentMonth ? 'is-outside' : '',
                day.isToday ? 'is-today' : '',
                day.isSelected ? 'is-selected' : '',
                disabled ? 'is-disabled' : '',
              ].filter(Boolean).join(' ');
              return disabled ? (
                <span className={className} key={day.key} aria-hidden={!day.isCurrentMonth}>
                  <strong>{day.day}</strong>
                  {day.isToday ? <small>今日</small> : null}
                </span>
              ) : (
                <Link
                  className={className}
                  key={day.key}
                  to={href}
                  aria-label={`${day.key}，${day.messageCount}条聊天记录`}
                  onClick={() => onSelectDay(day.key)}
                >
                  <strong>{day.day}</strong>
                  {day.isToday ? <small>今日</small> : null}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </section>
  );
}

/** 媒体页属性保持查询、筛选和预览职责分离。 */
interface ChatSearchMediaPageProps {
  readonly messages: readonly Message[];
  readonly filter: ChatSearchMediaFilter;
  readonly loading: boolean;
  readonly error: string | null;
  readonly onFilterChange: (filter: ChatSearchMediaFilter) => void;
  readonly onOpenPreview: (view: ChatMessageView) => void;
}

/** 复刻 RN 图片/视频按月三列索引。 */
export function ChatSearchMediaPage({
  messages,
  filter,
  loading,
  error,
  onFilterChange,
  onOpenPreview,
}: ChatSearchMediaPageProps) {
  /** filteredMessages 按当前媒体筛选保留 SDK 顺序。 */
  const filteredMessages = messages.filter(message => filter === 'all'
    || (filter === 'image' && message.contentType === CHAT_SEARCH_IMAGE_TYPE)
    || (filter === 'video' && message.contentType === CHAT_SEARCH_VIDEO_TYPE));
  /** sections 按 RN 月份标题分组。 */
  const sections = groupChatSearchMessagesByMonth(filteredMessages);
  return (
    <section className="rn-chat-search-indexed-page">
      <div className="rn-chat-search-media-filters" role="tablist" aria-label="媒体类型">
        {(['all', 'image', 'video'] as const).map(value => (
          <button
            type="button"
            role="tab"
            aria-selected={filter === value}
            className={filter === value ? 'is-active' : ''}
            key={value}
            onClick={() => onFilterChange(value)}
          >
            {value === 'all' ? '全部' : value === 'image' ? '图片' : '视频'}
          </button>
        ))}
      </div>
      <ChatSearchIndexedState loading={loading} error={error} empty={!sections.length} emptyLabel="暂无图片与视频" />
      {!loading && !error ? sections.map(section => (
        <section className="rn-chat-search-month-section" key={section.key}>
          <h2>{section.title}</h2>
          <div className="rn-chat-search-media-grid">
            {section.messages.map(message => (
              <ChatSearchMediaThumb key={message.clientMsgID} message={message} onOpenPreview={onOpenPreview} />
            ))}
          </div>
        </section>
      )) : null}
    </section>
  );
}

/** 单个媒体缩略图只消费安全消息投影。 */
function ChatSearchMediaThumb({ message, onOpenPreview }: {
  readonly message: Message;
  readonly onOpenPreview: (view: ChatMessageView) => void;
}) {
  /** view 复用聊天气泡唯一 payload 投影。 */
  const view = getChatMessageView(message, false);
  /** preview 决定按钮是否存在真实可打开地址。 */
  const preview = getChatMediaPreview(view);
  /** thumbnailURL 优先使用缩略图，图片允许回退原图。 */
  const thumbnailURL = normalizeChatMediaURL(
    view.thumbnailURL || (view.kind === 'image' ? view.mediaURL : ''),
  );
  return (
    <button type="button" disabled={!preview} aria-label={view.kind === 'video' ? '打开视频' : '打开图片'} onClick={() => onOpenPreview(view)}>
      {thumbnailURL ? <img src={thumbnailURL} alt="" /> : <span>暂无预览</span>}
      {view.kind === 'video' ? <i><RNAssetIcon assetURL={playIconURL} /></i> : null}
    </button>
  );
}

/** 文件页属性只包含缓存结果和现有媒体预览动作。 */
interface ChatSearchFilePageProps {
  readonly messages: readonly Message[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly onOpenPreview: (view: ChatMessageView) => void;
}

/** 复刻 RN 文件按月分组列表。 */
export function ChatSearchFilePage({ messages, loading, error, onOpenPreview }: ChatSearchFilePageProps) {
  /** sections 保持文件 newest-first 月份分组。 */
  const sections = groupChatSearchMessagesByMonth(messages);
  return (
    <section className="rn-chat-search-indexed-page rn-chat-search-file-page">
      <ChatSearchIndexedState loading={loading} error={error} empty={!sections.length} emptyLabel="暂无文件" />
      {!loading && !error ? sections.map(section => (
        <section className="rn-chat-search-month-section" key={section.key}>
          <h2>{section.title}</h2>
          {section.messages.map(message => {
            /** view 复用聊天气泡的文件名、大小和 URL 投影。 */
            const view = getChatMessageView(message, false);
            /** preview 缺失时保留真实文件摘要但禁用动作。 */
            const preview = getChatMediaPreview(view);
            return (
              <button type="button" className="rn-chat-search-file-row" disabled={!preview} key={message.clientMsgID} onClick={() => onOpenPreview(view)}>
                <span className="rn-chat-search-file-icon"><RNAssetIcon assetURL={fileIconURL} /><small>{getChatSearchFileExtension(view.text)}</small></span>
                <span><strong>{view.text || '文件'}</strong><small>{view.detail} {formatChatMessageSearchDate(message.sendTime)}</small></span>
              </button>
            );
          })}
        </section>
      )) : null}
    </section>
  );
}

/** 分类页统一呈现加载、错误和空态。 */
function ChatSearchIndexedState({ loading, error, empty, emptyLabel }: {
  readonly loading: boolean;
  readonly error: string | null;
  readonly empty: boolean;
  readonly emptyLabel: string;
}) {
  if (loading) return <p className="rn-chat-search-indexed-state" role="status">加载中</p>;
  if (error) return <p className="rn-chat-search-indexed-state rn-chat-search-error" role="alert">{error}</p>;
  return empty ? <p className="rn-chat-search-indexed-state" role="status">{emptyLabel}</p> : null;
}
