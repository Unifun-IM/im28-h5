import { useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import {
  buildConversationHomeSearchSections,
  updateConversationSearchHistory,
  type ConversationHomeSearchItem,
  type ConversationHomeSearchSection,
} from './conversation-home-search.js';
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
  /** loading 覆盖一次本地 SQLite 聚合读取。 */
  const [loading, setLoading] = useState(false);
  /** error 只展示真实 auth/cache 失败。 */
  const [error, setError] = useState('');

  /** runSearch 从当前账号四个共享 cache owner 读取并聚合结果。 */
  async function runSearch(nextQuery = query, saveHistory = true) {
    if (!sync || loading) return;
    /** normalizedQuery 禁止空白查询进入 SDK。 */
    const normalizedQuery = nextQuery.trim();
    setQuery(nextQuery);
    setSearchedQuery(normalizedQuery);
    setError('');
    setVisibleLimits({});
    if (!normalizedQuery) {
      setSections([]);
      return;
    }
    setLoading(true);
    try {
      /** sources 全部来自当前账号 SQLite，不触发远端搜索或页面 SQL。 */
      const [contacts, groups, conversations, messages] = await Promise.all([
        sync.contacts.listCached(),
        sync.groups.listCached(),
        sync.conversations.listCachedItems({ limit: 500 }),
        sync.messages.searchCached({ keyword: normalizedQuery, limit: 100 }),
      ]);
      setSections(buildConversationHomeSearchSections({
        query: normalizedQuery,
        contacts,
        groups,
        conversations,
        messages,
      }));
      if (saveHistory) {
        /** nextHistory 维护 RN 同款最近优先和十条上限。 */
        const nextHistory = updateConversationSearchHistory(history, normalizedQuery);
        setHistory(nextHistory);
        writeSearchHistory(nextHistory);
      }
    } catch (cause) {
      setSections([]);
      setError(readConversationSearchError(cause));
    } finally {
      setLoading(false);
    }
  }

  /** submitSearch 阻止浏览器表单导航并执行本地搜索。 */
  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch();
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
    <main className="rn-conversation-search-page">
      <section className="rn-conversation-search-surface">
        <form className="rn-conversation-search-header" onSubmit={submitSearch}>
          <label className="rn-conversation-search-input">
            <span className="sr-only">搜索</span>
            <RNAssetIcon assetURL={searchIconURL} />
            <input
              type="search"
              autoFocus
              value={query}
              placeholder="搜索"
              onChange={event => {
                setQuery(event.target.value);
                setSearchedQuery('');
                setSections([]);
                setError('');
              }}
              onKeyDown={event => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                void runSearch();
              }}
            />
          </label>
          <button type="button" onClick={() => navigate(-1)}>取消</button>
        </form>
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
            const visibleLimit = visibleLimits[section.key] ?? CONVERSATION_SEARCH_SECTION_STEP;
            /** visibleItems 保持共享缓存和聚合后的原始顺序。 */
            const visibleItems = section.items.slice(0, visibleLimit);
            return (
              <section className="rn-conversation-search-section" key={section.key}>
                <h2>{section.title}</h2>
                {visibleItems.map(item => (
                  <ConversationSearchResultRow key={item.key} item={item} onOpen={() => openResult(item)} />
                ))}
                {visibleItems.length < section.items.length ? (
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
function ConversationSearchResultRow({ item, onOpen }: {
  readonly item: ConversationHomeSearchItem;
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
        <strong>{item.title}</strong>
        <span>{item.subtitle}</span>
      </span>
    </button>
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
