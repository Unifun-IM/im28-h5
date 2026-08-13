import { useCallback, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { PullRefreshIndicator } from '../../components/interaction/index.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { usePullRefresh } from '../../hooks/use-pull-refresh.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import {
  buildConversationHomeSearchSections,
  isCurrentConversationSearchRequest,
  mergeConversationHomeSearchMessageSections,
  splitConversationSearchHighlightedText,
  updateConversationSearchHistory,
  type ConversationHomeSearchItem,
  type ConversationHomeSearchSection,
} from './conversation-home-search.js';
import { ConversationSearchInput } from './ConversationSearchInput.js';
import './conversation-search-page.css';

/** 搜索历史沿用 RN AsyncStorage 的业务 key。 */
const CONVERSATION_SEARCH_HISTORY_KEY = 'im28.homeSearch.history.v1';
/** 每个分区初始和单次展开数量与 RN 一致。 */
const CONVERSATION_SEARCH_SECTION_STEP = 8;

/** RN 首页全局搜索页只编排共享缓存读取和 React Router。 */
export function ConversationSearchPage() {
  /** runtime context 是页面唯一 SDK facade owner。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** navigate 负责取消、会话和消息定位路由。 */
  const navigate = useNavigate();
  /** sync 只在 runtime 已装配时存在。 */
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  /** query 保留输入原文，提交时统一 trim。 */
  const [query, setQuery] = useState('');
  /** searchedQuery 区分输入态和已提交结果态。 */
  const [searchedQuery, setSearchedQuery] = useState('');
  /** history 只保存非敏感搜索偏好。 */
  const [history, setHistory] = useState<readonly string[]>(readSearchHistory);
  /** sections 是当前账号缓存聚合后的真实结果。 */
  const [sections, setSections] = useState<readonly ConversationHomeSearchSection[]>([]);
  /** visibleLimits 保存各分区“查看更多”的展示进度。 */
  const [visibleLimits, setVisibleLimits] = useState<Record<string, number>>({});
  /** messageOffset 保存 SDK 下一页基于原始消息结果的偏移。 */
  const [messageOffset, setMessageOffset] = useState(0);
  /** messageHasMore 只由完整八条 SDK 页决定。 */
  const [messageHasMore, setMessageHasMore] = useState(false);
  /** loadingMoreMessage 区分首次搜索和聊天记录增量页。 */
  const [loadingMoreMessage, setLoadingMoreMessage] = useState(false);
  /** loading 覆盖一次本地 SQLite 聚合读取。 */
  const [loading, setLoading] = useState(false);
  /** error 只展示真实 auth/cache 失败。 */
  const [error, setError] = useState('');
  /** searchRequestIDRef 使输入变化和后续提交能隔离过期异步结果。 */
  const searchRequestIDRef = useRef(0);

  /** runSearch 从当前账号四个共享 cache owner 读取并聚合结果。 */
  async function runSearch(nextQuery = query, saveHistory = true, preserveResults = false) {
    if (!sync || loading) return;
    /** requestID 标识本次提交，后续输入或搜索会使旧结果失效。 */
    const requestID = searchRequestIDRef.current + 1;
    searchRequestIDRef.current = requestID;
    /** normalizedQuery 禁止空白查询进入 SDK。 */
    const normalizedQuery = nextQuery.trim();
    setQuery(nextQuery);
    setSearchedQuery(normalizedQuery);
    setError('');
    setVisibleLimits({});
    setLoadingMoreMessage(false);
    if (!normalizedQuery) {
      setSections([]);
      setMessageOffset(0);
      setMessageHasMore(false);
      return;
    }
    setLoading(true);
    if (!preserveResults) setSections([]);
    try {
      /** sources 全部来自当前账号 SQLite，不触发远端搜索或页面 SQL。 */
      const [contacts, groups, conversations, messages] = await Promise.all([
        sync.contacts.listCached(),
        sync.groups.listCached(),
        sync.conversations.listCachedItems({ limit: 500 }),
        sync.messages.searchCached({
          keyword: normalizedQuery,
          limit: CONVERSATION_SEARCH_SECTION_STEP,
          offset: 0,
        }),
      ]);
      if (!isCurrentConversationSearchRequest(searchRequestIDRef.current, requestID)) return;
      setSections(buildConversationHomeSearchSections({
        query: normalizedQuery,
        contacts,
        groups,
        conversations,
        messages,
      }));
      setMessageOffset(messages.length);
      setMessageHasMore(messages.length === CONVERSATION_SEARCH_SECTION_STEP);
      if (saveHistory) {
        setHistory(current => {
          /** nextHistory 维护 RN 同款最近优先和十条上限。 */
          const nextHistory = updateConversationSearchHistory(current, normalizedQuery);
          writeSearchHistory(nextHistory);
          return nextHistory;
        });
      }
    } catch (cause) {
      if (!isCurrentConversationSearchRequest(searchRequestIDRef.current, requestID)) return;
      setSections([]);
      setMessageOffset(0);
      setMessageHasMore(false);
      setError(readConversationSearchError(cause));
    } finally {
      if (isCurrentConversationSearchRequest(searchRequestIDRef.current, requestID)) setLoading(false);
    }
  }

  /** loadMoreMessages 按 RN 八条步长读取并合并下一页聊天记录。 */
  async function loadMoreMessages(): Promise<void> {
    if (!sync || !searchedQuery || !messageHasMore || loadingMoreMessage || loading) return;
    /** requestID 绑定当前已提交查询，输入变化会丢弃本页结果。 */
    const requestID = searchRequestIDRef.current;
    /** offset 冻结本次 SDK 分页起点。 */
    const offset = messageOffset;
    setLoadingMoreMessage(true);
    setError('');
    try {
      /** messages 由 shared facade 按可见正文和结果偏移分页。 */
      const messages = await sync.messages.searchCached({
        keyword: searchedQuery,
        limit: CONVERSATION_SEARCH_SECTION_STEP,
        offset,
      });
      if (!isCurrentConversationSearchRequest(searchRequestIDRef.current, requestID)) return;
      /** conversations 为下一页消息提供规范路由和会话标题。 */
      const conversations = await sync.conversations.listCachedItems({ limit: 500 });
      if (!isCurrentConversationSearchRequest(searchRequestIDRef.current, requestID)) return;
      /** incoming 只构建聊天记录分区，不重复加载好友和群资料。 */
      const incoming = buildConversationHomeSearchSections({
        query: searchedQuery,
        contacts: [],
        groups: [],
        conversations,
        messages,
      });
      setSections(current => mergeConversationHomeSearchMessageSections(current, incoming));
      setMessageOffset(offset + messages.length);
      setMessageHasMore(messages.length === CONVERSATION_SEARCH_SECTION_STEP);
    } catch (cause) {
      if (isCurrentConversationSearchRequest(searchRequestIDRef.current, requestID)) setError(readConversationSearchError(cause));
    } finally {
      if (isCurrentConversationSearchRequest(searchRequestIDRef.current, requestID)) setLoadingMoreMessage(false);
    }
  }

  /** refreshSearch 对齐 RN 下拉刷新，只重读当前提交关键词且不重复写历史。 */
  const refreshSearch = useCallback(async (): Promise<void> => {
    if (!searchedQuery) return;
    await runSearch(searchedQuery, false, true);
  }, [searchedQuery, sync, loading]);
  /** pullRefresh 只翻译浏览器手势，搜索和缓存规则仍由页面/facade 持有。 */
  const pullRefresh = usePullRefresh({ refreshing: loading, onRefresh: refreshSearch });

  /** submitSearch 阻止浏览器表单导航并执行本地搜索。 */
  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch();
  }

  /** updateQuery 与 RN onChangeText 一致清除旧提交、分页和错误状态。 */
  function updateQuery(nextQuery: string): void {
    searchRequestIDRef.current += 1;
    setQuery(nextQuery);
    setSearchedQuery('');
    setSections([]);
    setMessageOffset(0);
    setMessageHasMore(false);
    setLoadingMoreMessage(false);
    setError('');
    setLoading(false);
  }

  /** openResult 将稳定会话和消息 ID 写入现有 SPA route。 */
  function openResult(item: ConversationHomeSearchItem) {
    /** baseURL 是好友、群聊和聊天记录共用的会话路由。 */
    const baseURL = `/conversations/${encodeURIComponent(item.conversationID)}`;
    navigate(item.type === 'message'
      ? `${baseURL}?messageID=${encodeURIComponent(item.messageID)}`
      : baseURL);
  }

  if (restoring) return <ConversationSearchState label="正在恢复会话" />;
  if (!runtime) return <ConversationSearchState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  /** hasResults 区分真实空结果和含至少一个分区。 */
  const hasResults = sections.some(section => section.items.length > 0);
  return (
    <main
      className="rn-conversation-search-page"
      onTouchStart={pullRefresh.onTouchStart}
      onTouchMove={pullRefresh.onTouchMove}
      onTouchEnd={pullRefresh.onTouchEnd}
      onTouchCancel={pullRefresh.onTouchCancel}
    >
      <section className="rn-conversation-search-surface">
        <form className="rn-conversation-search-header" onSubmit={submitSearch}>
          <ConversationSearchInput
            value={query}
            onChange={updateQuery}
            onSubmit={() => { void runSearch(); }}
          />
          <button type="button" onClick={() => navigate(-1)}>取消</button>
        </form>
        <PullRefreshIndicator
          refreshing={loading && Boolean(searchedQuery)}
          armed={pullRefresh.armed}
          pullDistance={pullRefresh.pullDistance}
        />
        <section className="rn-conversation-search-content" aria-busy={loading} aria-live="polite">
          {error ? <ConversationSearchState label={error} compact /> : null}
          {!error && !searchedQuery ? (
            history.length ? (
              <div className="rn-conversation-search-history" aria-label="搜索记录">
                {history.map(item => (
                  <button type="button" key={item} onClick={() => void runSearch(item)}>{item}</button>
                ))}
              </div>
            ) : <ConversationSearchState label="暂无搜索记录" compact />
          ) : null}
          {!error && searchedQuery && loading ? <ConversationSearchState label="搜索中" compact /> : null}
          {!error && searchedQuery && !loading && !hasResults ? (
            <ConversationSearchState label="没有找到相关内容" compact />
          ) : null}
          {!error && searchedQuery && !loading ? sections.map(section => {
            /** visibleLimit 是当前分区稳定的已展开数量。 */
            const visibleLimit = section.key === 'message'
              ? section.items.length
              : visibleLimits[section.key] ?? CONVERSATION_SEARCH_SECTION_STEP;
            /** visibleItems 保持共享缓存和聚合后的原始顺序。 */
            const visibleItems = section.items.slice(0, visibleLimit);
            return (
              <section className="rn-conversation-search-section" key={section.key}>
                <h2>{section.title}</h2>
                {visibleItems.map(item => (
                  <ConversationSearchResultRow
                    key={item.key}
                    item={item}
                    keyword={searchedQuery}
                    onOpen={() => openResult(item)}
                  />
                ))}
                {section.key === 'message' ? (messageHasMore || loadingMoreMessage ? (
                  <button
                    type="button"
                    className="rn-conversation-search-more"
                    disabled={loadingMoreMessage}
                    onClick={() => { void loadMoreMessages(); }}
                  >{loadingMoreMessage ? '加载中...' : '查看更多'}</button>
                ) : null) : visibleItems.length < section.items.length ? (
                  <button
                    type="button"
                    className="rn-conversation-search-more"
                    onClick={() => setVisibleLimits(current => ({
                      ...current,
                      [section.key]: visibleLimit + CONVERSATION_SEARCH_SECTION_STEP,
                    }))}
                  >查看更多</button>
                ) : null}
              </section>
            );
          }) : null}
        </section>
      </section>
    </main>
  );
}

/** 单条搜索结果复用 RN 40px 头像和两行信息层级。 */
function ConversationSearchResultRow({ item, keyword, onOpen }: {
  readonly item: ConversationHomeSearchItem;
  readonly keyword: string;
  readonly onOpen: () => void;
}) {
  /** avatarStyle 复用 RN fallback 头像渐变。 */
  const avatarStyle = {
    '--conversation-search-avatar-gradient': getRNAvatarGradient(item.key),
  } as CSSProperties;
  return (
    <button type="button" className="rn-conversation-search-row" onClick={onOpen}>
      <span className="rn-conversation-search-avatar" style={avatarStyle}>
        <span>{getRNAvatarInitial(item.title)}</span>
        {item.avatarURL ? <img src={item.avatarURL} alt="" loading="lazy" /> : null}
      </span>
      <span className="rn-conversation-search-copy">
        {item.type === 'message' ? (
          <>
            <strong>{item.title}</strong>
            <span>{item.subtitle}</span>
          </>
        ) : (
          <>
            <ConversationSearchHighlightedText text={item.title} keyword={keyword} title />
            <ConversationSearchHighlightedText text={item.subtitle} keyword={keyword} />
          </>
        )}
      </span>
    </button>
  );
}

/** 好友和群聊搜索结果按 RN 规则为命中片段着品牌色。 */
function ConversationSearchHighlightedText({ text, keyword, title = false }: {
  readonly text: string;
  readonly keyword: string;
  readonly title?: boolean;
}) {
  /** segments 来自与 RN 同构的纯文本切片规则。 */
  const segments = splitConversationSearchHighlightedText(text, keyword);
  /** Tag 保持标题与副标题原有语义和字体层级。 */
  const Tag = title ? 'strong' : 'span';
  return (
    <Tag>
      {segments.map((segment, index) => (
        <mark key={`${segment.text}-${index}`} className={segment.highlighted ? 'is-highlighted' : undefined}>
          {segment.text}
        </mark>
      ))}
    </Tag>
  );
}

/** 搜索页启动、加载、空和错误状态使用同一稳定布局。 */
function ConversationSearchState({ label, detail, compact = false }: {
  readonly label: string;
  readonly detail?: string | null;
  readonly compact?: boolean;
}) {
  return (
    <main className={`rn-conversation-search-state${compact ? ' is-compact' : ''}`} role="status">
      <strong>{label}</strong>
      {detail ? <span>{detail}</span> : null}
    </main>
  );
}

/** 安全读取浏览器中的非敏感搜索历史。 */
function readSearchHistory(): readonly string[] {
  try {
    /** raw 是与 RN key 对应的 JSON preference。 */
    const raw = globalThis.localStorage?.getItem(CONVERSATION_SEARCH_HISTORY_KEY);
    /** parsed 只接受字符串数组。 */
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).slice(0, 10)
      : [];
  } catch {
    return [];
  }
}

/** 成功搜索后写入非敏感浏览器 preference。 */
function writeSearchHistory(history: readonly string[]): void {
  try {
    globalThis.localStorage?.setItem(CONVERSATION_SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // 浏览器拒绝 preference 时搜索主链仍可工作。
  }
}

/** 将未知缓存异常转换为稳定中文提示。 */
function readConversationSearchError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '搜索失败，请稍后重试';
}

export default ConversationSearchPage;
