import { useEffect, useMemo, useState } from 'react';
import type { Conversation, Message, MessageSearchOptions } from '@im28/im-sdk/web';
import { Link, Navigate, useParams } from 'react-router-dom';

import backIconURL from '../../assets/rn/components/navbar/nav-arrow-left.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { ChatMediaInteractionProvider, useChatMediaInteraction } from './ChatMediaInteractionProvider.js';
import { ChatSearchHomePanel } from './ChatSearchHomePanel.js';
import { ChatSearchDatePage, ChatSearchFilePage, ChatSearchMediaPage } from './ChatSearchIndexedPages.js';
import { ChatMessageSearchState, ChatSearchTextResults, type ChatSearchTextTab } from './ChatSearchTextResults.js';
import {
  CHAT_SEARCH_FILE_TYPE,
  CHAT_SEARCH_IMAGE_TYPE,
  CHAT_SEARCH_VIDEO_TYPE,
  buildChatSearchCalendarMonths,
  getChatSearchCalendarRange,
  type ChatSearchMediaFilter,
  type ChatSearchPage,
} from './chat-search-indexed-view.js';
import './chat-message-search.css';
import './chat-search-indexed.css';

/** 日期页默认显示当前月和前两个月。 */
const CHAT_SEARCH_DEFAULT_MONTH_COUNT = 3;
/** RN 日期单月最多十二页、每页六十条的读取上限。 */
const CHAT_SEARCH_DATE_LIMIT = 720;
/** RN 媒体和文件索引读取上限。 */
const CHAT_SEARCH_INDEX_LIMIT = 300;

/** RN 聊天记录搜索路由挂载唯一媒体预览 Provider。 */
export function ChatMessageSearchPage() {
  return <ChatMediaInteractionProvider><ChatMessageSearchContent /></ChatMediaInteractionProvider>;
}

/** 搜索页内容只编排 React Router、shared cache facade 和 RN 展示组件。 */
function ChatMessageSearchContent() {
  /** conversationID 来自可刷新 React Router path。 */
  const { conversationID = '' } = useParams();
  /** runtime context 提供认证状态和唯一聚合 sync facade。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** sync 与 runtime 生命周期一致，不在页面实例化 Repository。 */
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  /** mediaInteraction 复用聊天路由图片、视频和文件预览 owner。 */
  const mediaInteraction = useChatMediaInteraction();
  /** page 保存 RN 搜索页内部的可恢复展示分支。 */
  const [page, setPage] = useState<ChatSearchPage>('home');
  /** query 保留输入中的原字符，提交时由 SDK 统一 trim。 */
  const [query, setQuery] = useState('');
  /** textTab 区分全部和带关键词文件结果。 */
  const [textTab, setTextTab] = useState<ChatSearchTextTab>('all');
  /** mediaFilter 保存媒体页全部/图片/视频筛选。 */
  const [mediaFilter, setMediaFilter] = useState<ChatSearchMediaFilter>('all');
  /** conversation 保存搜索标题和会话类型。 */
  const [conversation, setConversation] = useState<Conversation | null>(null);
  /** results 保存关键词搜索结果。 */
  const [results, setResults] = useState<readonly Message[]>([]);
  /** indexedMessages 保存日期、媒体或文件当前缓存结果。 */
  const [indexedMessages, setIndexedMessages] = useState<readonly Message[]>([]);
  /** calendarBaseMonth 固定本次路由打开时的当前月。 */
  const [calendarBaseMonth] = useState(() => new Date());
  /** calendarMonthCount 控制向前扩展的月份数量。 */
  const [calendarMonthCount, setCalendarMonthCount] = useState(CHAT_SEARCH_DEFAULT_MONTH_COUNT);
  /** selectedDayKey 保留日期点击时的短生命周期选中态。 */
  const [selectedDayKey, setSelectedDayKey] = useState('');
  /** loading 防止重复提交。 */
  const [loading, setLoading] = useState(false);
  /** searched 区分初始提示和真实空结果。 */
  const [searched, setSearched] = useState(false);
  /** error 只展示真实 cache/auth 失败。 */
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sync) return;
    /** active 防止离开路由后异步结果写回。 */
    let active = true;
    void sync.conversations.listCached({ limit: 500 }).then(items => {
      if (!active) return;
      /** target 必须是当前账号已缓存会话。 */
      const target = items.find(item => item.conversationID === conversationID) ?? null;
      setConversation(target);
      if (!target) setError('会话不存在或尚未同步');
    }, cause => {
      if (active) setError(readChatSearchError(cause));
    });
    return () => { active = false; };
  }, [conversationID, sync]);

  /** 执行全部或文件关键词搜索。 */
  async function runTextSearch(nextTab: ChatSearchTextTab = textTab) {
    if (!sync || loading) return;
    /** keyword 与 RN 一样拒绝纯空白输入。 */
    const keyword = query.trim();
    if (!keyword) {
      setResults([]); setSearched(false); setError('请输入关键词'); setPage('text'); return;
    }
    /** options 只在文件 tab 追加 type105。 */
    const options: MessageSearchOptions = {
      conversationID, keyword, limit: 100,
      ...(nextTab === 'file' ? { contentTypes: [CHAT_SEARCH_FILE_TYPE] } : {}),
    };
    setPage('text'); setTextTab(nextTab); setLoading(true); setError(null);
    try {
      setResults(await sync.messages.searchCached(options));
      setSearched(true);
    } catch (cause) {
      setResults([]); setSearched(true); setError(readChatSearchError(cause));
    } finally { setLoading(false); }
  }

  /** 打开媒体或文件分类并只读当前账号 SQLite。 */
  async function openTypedIndex(nextPage: 'media' | 'file') {
    if (!sync || loading) return;
    setPage(nextPage); setLoading(true); setError(null);
    try {
      /** contentTypes 严格复用 RN 102/104 和 105 集合。 */
      const contentTypes = nextPage === 'media'
        ? [CHAT_SEARCH_IMAGE_TYPE, CHAT_SEARCH_VIDEO_TYPE]
        : [CHAT_SEARCH_FILE_TYPE];
      setIndexedMessages(await sync.messages.searchCached({ conversationID, contentTypes, limit: CHAT_SEARCH_INDEX_LIMIT }));
    } catch (cause) {
      setIndexedMessages([]); setError(readChatSearchError(cause));
    } finally { setLoading(false); }
  }

  /** 打开或扩展日期页并读取显式 SQLite 时间窗口。 */
  async function openDateIndex(monthCount = CHAT_SEARCH_DEFAULT_MONTH_COUNT) {
    if (!sync || loading) return;
    /** range 与日历月份数量使用同一 base month。 */
    const range = getChatSearchCalendarRange(calendarBaseMonth, monthCount);
    setPage('date'); setLoading(true); setError(null);
    try {
      setIndexedMessages(await sync.messages.searchCached({ conversationID, ...range, limit: CHAT_SEARCH_DATE_LIMIT }));
      setCalendarMonthCount(monthCount);
    } catch (cause) {
      setError(readChatSearchError(cause));
    } finally { setLoading(false); }
  }

  if (restoring) return <ChatMessageSearchState label="正在恢复会话" />;
  if (!runtime) return <ChatMessageSearchState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  /** chatURL 是取消和结果返回的稳定会话路由。 */
  const chatURL = `/conversations/${encodeURIComponent(conversationID)}`;
  /** isGroup 控制系统消息正文投影。 */
  const isGroup = conversation?.type === 'group';
  /** calendarMonths 仅从 shared 时间窗口结果构造。 */
  const calendarMonths = buildChatSearchCalendarMonths(indexedMessages, calendarBaseMonth, calendarMonthCount, selectedDayKey);
  return (
    <main className="rn-chat-search-page"><section className="rn-chat-search-surface">
      {page === 'home' || page === 'text' ? (
        <form className="rn-chat-search-header" onSubmit={event => { event.preventDefault(); void runTextSearch(); }}>
          <div className="rn-chat-search-input"><button type="submit" aria-label="提交搜索" disabled={loading}><RNAssetIcon assetURL={searchIconURL} /></button><label className="sr-only" htmlFor="chat-message-search-input">搜索聊天记录</label><input id="chat-message-search-input" type="search" autoFocus value={query} disabled={loading} placeholder="搜索" onChange={event => { setQuery(event.target.value); setError(null); setSearched(false); }} /></div>
          <Link to={chatURL}>取消</Link>
        </form>
      ) : (
        <PageNavbar className="rn-chat-search-nav"><button type="button" aria-label="返回搜索" onClick={() => { setPage('home'); setError(null); }}><RNAssetIcon assetURL={backIconURL} /></button><h1>{page === 'date' ? '按日期查找' : page === 'media' ? '图片与视频' : '按文件查找'}</h1><span /></PageNavbar>
      )}
      {page === 'home' ? <ChatSearchHomePanel query={query} loading={loading} error={error} onSearchText={() => void runTextSearch('all')} onOpenDate={() => void openDateIndex()} onOpenMedia={() => void openTypedIndex('media')} onOpenFile={() => void openTypedIndex('file')} /> : null}
      {page === 'text' ? <ChatSearchTextResults loading={loading} error={error} searched={searched} query={query} activeTab={textTab} results={results} isGroup={isGroup} conversationTitle={conversation?.name?.trim() ?? ''} currentUserID={snapshot.userID} chatURL={chatURL} onTabChange={tab => void runTextSearch(tab)} onOpenMedia={() => void openTypedIndex('media')} /> : null}
      {page === 'date' ? <ChatSearchDatePage months={calendarMonths} chatURL={chatURL} loading={loading} error={error} onLoadPreviousMonth={() => void openDateIndex(calendarMonthCount + 1)} onSelectDay={setSelectedDayKey} /> : null}
      {page === 'media' ? <ChatSearchMediaPage messages={indexedMessages} filter={mediaFilter} loading={loading} error={error} onFilterChange={setMediaFilter} onOpenPreview={mediaInteraction.openPreview} /> : null}
      {page === 'file' ? <ChatSearchFilePage messages={indexedMessages} loading={loading} error={error} onOpenPreview={mediaInteraction.openPreview} /> : null}
    </section></main>
  );
}

/** 将 cache/runtime 异常转换为稳定搜索页错误。 */
function readChatSearchError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '聊天记录搜索失败';
}

export default ChatMessageSearchPage;
