import { useMemo, type CSSProperties, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { PullRefreshIndicator } from '../../components/interaction/index.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { usePullRefresh } from '../../hooks/use-pull-refresh.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import {
  buildConversationHomeSearchRoute,
  splitConversationSearchHighlightedText,
  type ConversationHomeSearchItem,
} from './conversation-home-search.js';
import { ConversationSearchInput } from './ConversationSearchInput.js';
import { useConversationSearchState } from './useConversationSearchState.js';
import './conversation-search-page.css';

/** RN 首页全局搜索页只编排共享缓存读取和 React Router。 */
export function ConversationSearchPage() {
  /** runtime context 是页面唯一 SDK facade owner。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** navigate 负责取消、会话和消息定位路由。 */
  const navigate = useNavigate();
  /** sync 只在 runtime 已装配时存在。 */
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  /** searchState 统一承载缓存聚合、请求竞态、分页和历史偏好。 */
  const searchState = useConversationSearchState({ sync });
  /** 页面渲染只读取搜索状态 owner 投影。 */
  const {
    query,
    searchedQuery,
    history,
    sections,
    messageHasMore,
    loadingMoreMessage,
    loading,
    error,
  } = searchState;
  /** pullRefresh 只翻译浏览器手势，搜索和缓存规则由状态 owner/facade 持有。 */
  const pullRefresh = usePullRefresh({ refreshing: loading, onRefresh: searchState.refreshSearch });

  /** submitSearch 阻止浏览器表单导航并执行本地搜索。 */
  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void searchState.runSearch();
  }

  /** openResult 对齐 RN 先关闭搜索层再进入会话的返回栈语义。 */
  function openResult(item: ConversationHomeSearchItem) {
    /** route 保留消息定位参数并替换当前搜索页历史项。 */
    const route = buildConversationHomeSearchRoute(item);
    navigate(route.href, { replace: route.replace });
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
      onPointerDown={pullRefresh.onPointerDown}
      onPointerMove={pullRefresh.onPointerMove}
      onPointerUp={pullRefresh.onPointerUp}
      onPointerCancel={pullRefresh.onPointerCancel}
    >
      <section className="rn-conversation-search-surface">
        <form className="rn-conversation-search-header" onSubmit={submitSearch}>
          <ConversationSearchInput
            value={query}
            onChange={searchState.updateQuery}
            onSubmit={() => { void searchState.runSearch(); }}
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
                  <button type="button" key={item} onClick={() => void searchState.runSearch(item)}>{item}</button>
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
            const visibleLimit = searchState.getVisibleLimit(section);
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
                    onClick={() => { void searchState.loadMoreMessages(); }}
                  >{loadingMoreMessage ? '加载中...' : '查看更多'}</button>
                ) : null) : visibleItems.length < section.items.length ? (
                  <button
                    type="button"
                    className="rn-conversation-search-more"
                    onClick={() => searchState.showMoreSection(section.key)}
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

export default ConversationSearchPage;
