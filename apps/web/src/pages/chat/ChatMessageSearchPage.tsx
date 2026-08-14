import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Conversation, Message, MessageSearchOptions } from '@im28/im-sdk/web';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';

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
  readChatSearchIndexedRouteState,
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
  /** searchParams 持久化关键词和文本 tab，保证浏览器返回后恢复 RN 搜索上下文。 */
  const [searchParams, setSearchParams] = useSearchParams();
  /** routeSearch 为恢复 effect 提供稳定的 query identity。 */
  const routeSearch = searchParams.toString();
  /** initialQuery 只读取当前 history entry 的已提交关键词。 */
  const initialQuery = searchParams.get('q')?.trim() ?? '';
  /** initialTextTab 将未知值收敛为全部结果。 */
  const initialTextTab: ChatSearchTextTab = searchParams.get('tab') === 'file' ? 'file' : 'all';
  /** initialIndexedRoute 从 URL 恢复日期、媒体或文件 presentation 状态。 */
  const initialIndexedRoute = useMemo(
    () => readChatSearchIndexedRouteState(new URLSearchParams(routeSearch), CHAT_SEARCH_DEFAULT_MONTH_COUNT),
    [routeSearch],
  );
  /** initialHomeRequested 区分带关键词的索引返回首页与文本结果页。 */
  const initialHomeRequested = searchParams.get('view') === 'home';
  /** runtime context 提供认证状态和唯一聚合 sync facade。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** sync 与 runtime 生命周期一致，不在页面实例化 Repository。 */
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  /** mediaInteraction 复用聊天路由图片、视频和文件预览 owner。 */
  const mediaInteraction = useChatMediaInteraction();
  /** page 保存 RN 搜索页内部的可恢复展示分支。 */
  const [page, setPage] = useState<ChatSearchPage>(
    initialIndexedRoute?.page ?? (initialQuery && !initialHomeRequested ? 'text' : 'home'),
  );
  /** query 保留输入中的原字符，提交时由 SDK 统一 trim。 */
  const [query, setQuery] = useState(initialQuery);
  /** textTab 区分全部和带关键词文件结果。 */
  const [textTab, setTextTab] = useState<ChatSearchTextTab>(initialTextTab);
  /** restoredTextSearch 防止同一页面实例重复恢复 history 查询。 */
  const restoredTextSearch = useRef(false);
  /** mediaFilter 保存媒体页全部/图片/视频筛选。 */
  const [mediaFilter, setMediaFilter] = useState<ChatSearchMediaFilter>(initialIndexedRoute?.mediaFilter ?? 'all');
  /** conversation 保存搜索标题和会话类型。 */
  const [conversation, setConversation] = useState<Conversation | null>(null);
  /** results 保存关键词搜索结果。 */
  const [results, setResults] = useState<readonly Message[]>([]);
  /** indexedMessages 保存日期、媒体或文件当前缓存结果。 */
  const [indexedMessages, setIndexedMessages] = useState<readonly Message[]>([]);
  /** calendarBaseMonth 固定本次路由打开时的当前月。 */
  const [calendarBaseMonth] = useState(() => new Date());
  /** calendarMonthCount 控制向前扩展的月份数量。 */
  const [calendarMonthCount, setCalendarMonthCount] = useState(
    initialIndexedRoute?.monthCount ?? CHAT_SEARCH_DEFAULT_MONTH_COUNT,
  );
  /** selectedDayKey 保留日期点击时的短生命周期选中态。 */
  const [selectedDayKey, setSelectedDayKey] = useState('');
  /** loading 防止重复提交。 */
  const [loading, setLoading] = useState(false);
  /** searched 区分初始提示和真实空结果。 */
  const [searched, setSearched] = useState(false);
  /** error 只展示真实 cache/auth 失败。 */
  const [error, setError] = useState<string | null>(null);
  /** restoredIndexedSearch 防止同一页面实例重复恢复索引查询。 */
  const restoredIndexedSearch = useRef(false);

  /** executeTextSearch 统一主动提交与 history 恢复的缓存查询和状态收敛。 */
  const executeTextSearch = useCallback(async (
    keyword: string,
    nextTab: ChatSearchTextTab,
    isActive: () => boolean = () => true,
  ) => {
    if (!sync) return;
    /** options 只在文件 tab 追加 type105。 */
    const options: MessageSearchOptions = {
      conversationID, keyword, limit: 100,
      ...(nextTab === 'file' ? { contentTypes: [CHAT_SEARCH_FILE_TYPE] } : {}),
    };
    setPage('text'); setTextTab(nextTab); setLoading(true); setError(null);
    try {
      /** items 始终来自当前账号 shared cache facade。 */
      const items = await sync.messages.searchCached(options);
      if (!isActive()) return;
      setResults(items); setSearched(true);
    } catch (cause) {
      if (!isActive()) return;
      setResults([]); setSearched(true); setError(readChatSearchError(cause));
    } finally {
      if (isActive()) setLoading(false);
    }
  }, [conversationID, sync]);

  /** executeTypedIndex 统一媒体、文件主动进入与 history 恢复。 */
  const executeTypedIndex = useCallback(async (
    nextPage: 'media' | 'file',
    nextFilter: ChatSearchMediaFilter,
    isActive: () => boolean = () => true,
  ) => {
    if (!sync) return;
    /** contentTypes 严格复用 RN 102/104 和 105 集合。 */
    const contentTypes = nextPage === 'media'
      ? [CHAT_SEARCH_IMAGE_TYPE, CHAT_SEARCH_VIDEO_TYPE]
      : [CHAT_SEARCH_FILE_TYPE];
    setPage(nextPage); setMediaFilter(nextFilter); setLoading(true); setError(null);
    try {
      /** items 只从 shared 当前账号缓存读取。 */
      const items = await sync.messages.searchCached({ conversationID, contentTypes, limit: CHAT_SEARCH_INDEX_LIMIT });
      if (isActive()) setIndexedMessages(items);
    } catch (cause) {
      if (!isActive()) return;
      setIndexedMessages([]); setError(readChatSearchError(cause));
    } finally {
      if (isActive()) setLoading(false);
    }
  }, [conversationID, sync]);

  /** executeDateIndex 统一日期主动进入、扩月与 history 恢复。 */
  const executeDateIndex = useCallback(async (
    monthCount: number,
    isActive: () => boolean = () => true,
  ) => {
    if (!sync) return;
    /** range 与 URL 月份数量使用同一 base month。 */
    const range = getChatSearchCalendarRange(calendarBaseMonth, monthCount);
    setPage('date'); setLoading(true); setError(null);
    try {
      /** items 是显式时间窗口内的当前账号缓存。 */
      const items = await sync.messages.searchCached({ conversationID, ...range, limit: CHAT_SEARCH_DATE_LIMIT });
      if (!isActive()) return;
      setIndexedMessages(items); setCalendarMonthCount(monthCount);
    } catch (cause) {
      if (isActive()) setError(readChatSearchError(cause));
    } finally {
      if (isActive()) setLoading(false);
    }
  }, [calendarBaseMonth, conversationID, sync]);

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

  useEffect(() => {
    if (!sync || !initialQuery || restoredTextSearch.current) return;
    restoredTextSearch.current = true;
    /** active 防止恢复请求在再次离开搜索路由后写回。 */
    let active = true;
    void executeTextSearch(initialQuery, initialTextTab, () => active);
    return () => { active = false; restoredTextSearch.current = false; };
  }, [executeTextSearch, initialQuery, initialTextTab, sync]);

  useEffect(() => {
    if (!sync || !initialIndexedRoute || restoredIndexedSearch.current) return;
    restoredIndexedSearch.current = true;
    /** active 防止 history 恢复请求在再次离开后写回。 */
    let active = true;
    if (initialIndexedRoute.page === 'date') {
      void executeDateIndex(initialIndexedRoute.monthCount, () => active);
    } else {
      void executeTypedIndex(initialIndexedRoute.page, initialIndexedRoute.mediaFilter, () => active);
    }
    return () => { active = false; restoredIndexedSearch.current = false; };
  }, [executeDateIndex, executeTypedIndex, initialIndexedRoute, sync]);

  /** 执行全部或文件关键词搜索。 */
  async function runTextSearch(nextTab: ChatSearchTextTab = textTab) {
    if (!sync || loading) return;
    /** keyword 与 RN 一样拒绝纯空白输入。 */
    const keyword = query.trim();
    if (!keyword) {
      setResults([]); setSearched(false); setError('请输入关键词'); setPage('text'); return;
    }
    restoredTextSearch.current = true;
    setSearchParams({ q: keyword, tab: nextTab }, { replace: true });
    await executeTextSearch(keyword, nextTab);
  }

  /** 打开媒体或文件分类并只读当前账号 SQLite。 */
  async function openTypedIndex(nextPage: 'media' | 'file') {
    if (!sync || loading) return;
    restoredIndexedSearch.current = true;
    /** params 只保存索引 presentation，query 仅用于返回首页建议。 */
    const params = new URLSearchParams({ view: nextPage });
    if (query.trim()) params.set('q', query.trim());
    if (nextPage === 'media') params.set('filter', 'all');
    setSearchParams(params, { replace: true });
    await executeTypedIndex(nextPage, 'all');
  }

  /** 打开或扩展日期页并读取显式 SQLite 时间窗口。 */
  async function openDateIndex(monthCount = CHAT_SEARCH_DEFAULT_MONTH_COUNT) {
    if (!sync || loading) return;
    restoredIndexedSearch.current = true;
    /** params 让扩展月份在刷新和 history 返回后保持一致。 */
    const params = new URLSearchParams({ view: 'date', months: String(monthCount) });
    if (query.trim()) params.set('q', query.trim());
    setSearchParams(params, { replace: true });
    await executeDateIndex(monthCount);
  }

  /** returnToSearchHome 对齐 RN 索引 Nav 返回并保留输入建议。 */
  function returnToSearchHome() {
    /** params 仅在存在草稿时显式声明 home，避免刷新误进文本结果。 */
    const params = new URLSearchParams();
    if (query.trim()) { params.set('view', 'home'); params.set('q', query.trim()); }
    setSearchParams(params, { replace: true });
    setPage('home'); setError(null);
  }

  /** changeMediaFilter 同步媒体筛选到当前 history entry。 */
  function changeMediaFilter(nextFilter: ChatSearchMediaFilter) {
    /** params 保持媒体页身份和可选搜索草稿。 */
    const params = new URLSearchParams({ view: 'media', filter: nextFilter });
    if (query.trim()) params.set('q', query.trim());
    setSearchParams(params, { replace: true });
    setMediaFilter(nextFilter);
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
        <PageNavbar className="rn-chat-search-nav"><button type="button" aria-label="返回搜索" onClick={returnToSearchHome}><RNAssetIcon assetURL={backIconURL} /></button><h1>{page === 'date' ? '按日期查找' : page === 'media' ? '图片与视频' : '按文件查找'}</h1><span /></PageNavbar>
      )}
      {page === 'home' ? <ChatSearchHomePanel query={query} loading={loading} error={error} onSearchText={() => void runTextSearch('all')} onOpenDate={() => void openDateIndex()} onOpenMedia={() => void openTypedIndex('media')} onOpenFile={() => void openTypedIndex('file')} /> : null}
      {page === 'text' ? <ChatSearchTextResults loading={loading} error={error} searched={searched} query={query} activeTab={textTab} results={results} isGroup={isGroup} conversationTitle={conversation?.name?.trim() ?? ''} currentUserID={snapshot.userID} chatURL={chatURL} onTabChange={tab => void runTextSearch(tab)} onOpenMedia={() => void openTypedIndex('media')} /> : null}
      {page === 'date' ? <ChatSearchDatePage months={calendarMonths} chatURL={chatURL} loading={loading} error={error} onLoadPreviousMonth={() => void openDateIndex(calendarMonthCount + 1)} onSelectDay={setSelectedDayKey} /> : null}
      {page === 'media' ? <ChatSearchMediaPage messages={indexedMessages} filter={mediaFilter} loading={loading} error={error} onFilterChange={changeMediaFilter} onOpenPreview={mediaInteraction.openPreview} /> : null}
      {page === 'file' ? <ChatSearchFilePage messages={indexedMessages} loading={loading} error={error} onOpenPreview={mediaInteraction.openPreview} /> : null}
    </section></main>
  );
}

/** 将 cache/runtime 异常转换为稳定搜索页错误。 */
function readChatSearchError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '聊天记录搜索失败';
}

export default ChatMessageSearchPage;
