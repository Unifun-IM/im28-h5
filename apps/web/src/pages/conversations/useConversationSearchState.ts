import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { WebIMSync } from '@im28/im-sdk/web';

import { isCurrentInteractionRequest } from '../../components/interaction/index.js';
import {
  buildConversationHomeSearchSections,
  mergeConversationHomeSearchMessageSections,
  updateConversationSearchHistory,
  type ConversationHomeSearchSection,
} from './conversation-home-search.js';

/** 搜索历史沿用 RN AsyncStorage 的业务 key。 */
const CONVERSATION_SEARCH_HISTORY_KEY = 'im28.homeSearch.history.v1';
/** 每个分区初始和单次展开数量与 RN 一致。 */
const CONVERSATION_SEARCH_SECTION_STEP = 8;

/** 会话搜索状态 hook 只接收当前账号的共享同步 facade。 */
interface UseConversationSearchStateOptions {
  readonly sync: WebIMSync | null;
}

/** 会话搜索页面消费的状态、请求和展示分页投影。 */
interface ConversationSearchStateBinding {
  readonly query: string;
  readonly searchedQuery: string;
  readonly history: readonly string[];
  readonly sections: readonly ConversationHomeSearchSection[];
  readonly messageHasMore: boolean;
  readonly loadingMoreMessage: boolean;
  readonly loading: boolean;
  readonly error: string;
  readonly runSearch: (
    nextQuery?: string,
    saveHistory?: boolean,
    preserveResults?: boolean,
  ) => Promise<void>;
  readonly loadMoreMessages: () => Promise<void>;
  readonly refreshSearch: () => Promise<void>;
  readonly updateQuery: (nextQuery: string) => void;
  readonly getVisibleLimit: (section: ConversationHomeSearchSection) => number;
  readonly showMoreSection: (sectionKey: string) => void;
}

/** 统一拥有会话首页搜索的 cache 聚合、竞态、消息分页和非敏感历史偏好。 */
export function useConversationSearchState({
  sync,
}: UseConversationSearchStateOptions): ConversationSearchStateBinding {
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
  /** searchRequestIDRef 使输入变化和后续提交隔离过期异步结果。 */
  const searchRequestIDRef = useRef(0);

  /** runSearch 从当前账号四个共享 cache owner 读取并聚合结果。 */
  const runSearch = useCallback(async (
    nextQuery = query,
    saveHistory = true,
    preserveResults = false,
  ): Promise<void> => {
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
      resetSearchResults(setSections, setMessageOffset, setMessageHasMore);
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
      if (!isCurrentInteractionRequest(searchRequestIDRef.current, requestID)) return;
      setSections(buildConversationHomeSearchSections({
        query: normalizedQuery,
        contacts,
        groups,
        conversations,
        messages,
      }));
      setMessageOffset(messages.length);
      setMessageHasMore(messages.length === CONVERSATION_SEARCH_SECTION_STEP);
      if (saveHistory) updateSearchHistory(setHistory, normalizedQuery);
    } catch (cause) {
      if (!isCurrentInteractionRequest(searchRequestIDRef.current, requestID)) return;
      resetSearchResults(setSections, setMessageOffset, setMessageHasMore);
      setError(readConversationSearchError(cause));
    } finally {
      if (isCurrentInteractionRequest(searchRequestIDRef.current, requestID)) setLoading(false);
    }
  }, [loading, query, sync]);

  /** loadMoreMessages 按 RN 八条步长读取并合并下一页聊天记录。 */
  const loadMoreMessages = useCallback(async (): Promise<void> => {
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
      if (!isCurrentInteractionRequest(searchRequestIDRef.current, requestID)) return;
      /** conversations 为下一页消息提供规范路由和会话标题。 */
      const conversations = await sync.conversations.listCachedItems({ limit: 500 });
      if (!isCurrentInteractionRequest(searchRequestIDRef.current, requestID)) return;
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
      if (isCurrentInteractionRequest(searchRequestIDRef.current, requestID)) {
        setError(readConversationSearchError(cause));
      }
    } finally {
      if (isCurrentInteractionRequest(searchRequestIDRef.current, requestID)) {
        setLoadingMoreMessage(false);
      }
    }
  }, [loading, loadingMoreMessage, messageHasMore, messageOffset, searchedQuery, sync]);

  /** refreshSearch 只重读当前提交关键词且不重复写历史。 */
  const refreshSearch = useCallback(async (): Promise<void> => {
    if (!searchedQuery) return;
    await runSearch(searchedQuery, false, true);
  }, [runSearch, searchedQuery]);

  /** updateQuery 与 RN onChangeText 一致清除旧提交、分页和错误状态。 */
  const updateQuery = useCallback((nextQuery: string): void => {
    searchRequestIDRef.current += 1;
    setQuery(nextQuery);
    setSearchedQuery('');
    resetSearchResults(setSections, setMessageOffset, setMessageHasMore);
    setLoadingMoreMessage(false);
    setVisibleLimits({});
    setError('');
    setLoading(false);
  }, []);

  /** getVisibleLimit 返回当前分区按 RN 步长展开后的数量。 */
  const getVisibleLimit = useCallback((section: ConversationHomeSearchSection): number => (
    section.key === 'message'
      ? section.items.length
      : visibleLimits[section.key] ?? CONVERSATION_SEARCH_SECTION_STEP
  ), [visibleLimits]);

  /** showMoreSection 只推进本地结果展示窗口。 */
  const showMoreSection = useCallback((sectionKey: string): void => {
    setVisibleLimits(current => ({
      ...current,
      [sectionKey]: (current[sectionKey] ?? CONVERSATION_SEARCH_SECTION_STEP)
        + CONVERSATION_SEARCH_SECTION_STEP,
    }));
  }, []);

  return {
    query,
    searchedQuery,
    history,
    sections,
    messageHasMore,
    loadingMoreMessage,
    loading,
    error,
    runSearch,
    loadMoreMessages,
    refreshSearch,
    updateQuery,
    getVisibleLimit,
    showMoreSection,
  };
}

/** 清空聚合结果和消息分页事实。 */
function resetSearchResults(
  setSections: (value: readonly ConversationHomeSearchSection[]) => void,
  setMessageOffset: (value: number) => void,
  setMessageHasMore: (value: boolean) => void,
): void {
  setSections([]);
  setMessageOffset(0);
  setMessageHasMore(false);
}

/** 成功搜索后更新内存和浏览器中的非敏感历史。 */
function updateSearchHistory(
  setHistory: Dispatch<SetStateAction<readonly string[]>>,
  query: string,
): void {
  setHistory(current => {
    /** nextHistory 维护 RN 同款最近优先和十条上限。 */
    const nextHistory = updateConversationSearchHistory(current, query);
    writeSearchHistory(nextHistory);
    return nextHistory;
  });
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
