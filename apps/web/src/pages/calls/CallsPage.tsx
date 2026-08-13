import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  GatewayCall,
  WebIMCallAnswerStatus,
  WebIMCallSync,
} from '@im28/im-sdk/web';
import { Navigate } from 'react-router-dom';

import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import { PullRefreshIndicator } from '../../components/interaction/index.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { usePullRefresh } from '../../hooks/use-pull-refresh.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { CallDeleteSheet } from './CallDeleteSheet.js';
import { CallRecordRow } from './CallRecordRow.js';
import {
  getCallID,
  getCallListEmptyLabel,
  refreshCallListPage,
} from './call-list-view.js';
import './calls-page.css';

// PAGE_SIZE 对齐 RN 通话缓存分页大小。
const PAGE_SIZE = 30;

/** RN 通话记录主页面使用 Web SDK cache-first 真实链路。 */
export function CallsPage() {
  // runtime context 是页面唯一 SDK facade owner。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // calls 只从聚合 sync facade 获取，不直接调用 Gateway 或数据库。
  const calls = useMemo(() => runtime?.getSync().calls ?? null, [runtime]);
  // filter 对应 RN 所有通话/未接来电分段控件。
  const [filter, setFilter] = useState<WebIMCallAnswerStatus>('all');
  // keyword 只参与 SQLite 昵称/用户 ID 搜索。
  const [keyword, setKeyword] = useState('');
  // items 保存当前缓存分页。
  const [items, setItems] = useState<readonly GatewayCall[]>([]);
  // total 保存当前筛选结果总数。
  const [total, setTotal] = useState(0);
  // loading 只覆盖首轮 cache/sync 过程。
  const [loading, setLoading] = useState(false);
  // loadingMore 防止重复请求下一页。
  const [loadingMore, setLoadingMore] = useState(false);
  // refreshing 区分用户下拉刷新和首次静默同步。
  const [refreshing, setRefreshing] = useState(false);
  // error 展示真实同步或删除异常。
  const [error, setError] = useState<string | null>(null);
  // editing 控制 RN 批量编辑态。
  const [editing, setEditing] = useState(false);
  // selectedIDs 保存当前筛选内的待删除服务端 ID。
  const [selectedIDs, setSelectedIDs] = useState<ReadonlySet<string>>(() => new Set());
  // confirmingDelete 控制删除确认 sheet。
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  // deleting 防止重复提交服务端删除。
  const [deleting, setDeleting] = useState(false);
  // selectingAll 防止全量缓存扫描重复触发。
  const [selectingAll, setSelectingAll] = useState(false);
  // cacheRevision 在远端同步完成后驱动当前筛选重读。
  const [cacheRevision, setCacheRevision] = useState(0);

  /** 读取当前筛选的首个 SQLite 分页。 */
  const readFirstPage = useCallback(async (service: WebIMCallSync) => {
    // result 来自账号 SQLite，不从页面拼装记录。
    const result = await service.listCached({
      answerStatus: filter,
      keyword,
      limit: PAGE_SIZE,
      offset: 0,
    });
    setItems(result.list);
    setTotal(result.total);
  }, [filter, keyword]);

  /** 对齐 RN：强制同步服务端后重读当前筛选第一页，失败保留旧列表。 */
  const refreshCalls = useCallback(async () => {
    if (!calls || !snapshot.userID || refreshing || editing) return;
    setRefreshing(true);
    setError(null);
    try {
      /** result 只在远端同步完成后包含当前筛选的 canonical cache。 */
      const result = await refreshCallListPage(calls, filter, keyword, PAGE_SIZE);
      setItems(result.list);
      setTotal(result.total);
    } catch (cause) {
      setError(readError(cause));
    } finally {
      setRefreshing(false);
    }
  }, [calls, editing, filter, keyword, refreshing, snapshot.userID]);

  /** pullRefresh 只翻译顶部单指下拉，编辑态不接管列表手势。 */
  const pullRefresh = usePullRefresh({
    refreshing: refreshing || editing,
    onRefresh: refreshCalls,
  });

  useEffect(() => {
    if (!calls || !snapshot.userID) return;
    // active 防止路由卸载后的同步状态回写。
    let active = true;
    setLoading(true);
    setError(null);
    void calls.sync()
      .then(() => {
        if (active) setCacheRevision(current => current + 1);
      })
      .catch(cause => {
        if (active) setError(readError(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [calls, snapshot.userID]);

  useEffect(() => {
    if (!calls || !snapshot.userID) return;
    // active 防止快速筛选后的旧 cache 结果覆盖新条件。
    let active = true;
    void calls.listCached({ answerStatus: filter, keyword, limit: PAGE_SIZE })
      .then(result => {
        if (active) {
          setItems(result.list);
          setTotal(result.total);
        }
      })
      .catch(cause => {
        if (active) setError(readError(cause));
      });
    return () => {
      active = false;
    };
  }, [
    cacheRevision,
    calls,
    filter,
    keyword,
    snapshot.dataVersion,
    snapshot.userID,
  ]);

  /** 加载当前筛选的下一段 SQLite cache。 */
  const loadMore = useCallback(async () => {
    if (!calls || loadingMore || items.length >= total) return;
    setLoadingMore(true);
    try {
      // result 使用当前已渲染长度作为稳定 offset。
      const result = await calls.listCached({
        answerStatus: filter,
        keyword,
        limit: PAGE_SIZE,
        offset: items.length,
      });
      setItems(current => [...current, ...result.list]);
      setTotal(result.total);
    } catch (cause) {
      setError(readError(cause));
    } finally {
      setLoadingMore(false);
    }
  }, [calls, filter, items.length, keyword, loadingMore, total]);

  /** 切换单条批量选择。 */
  const toggleSelected = useCallback((callID: string) => {
    if (!callID) return;
    setSelectedIDs(current => {
      // next 保持 Set 更新不可变。
      const next = new Set(current);
      if (next.has(callID)) next.delete(callID);
      else next.add(callID);
      return next;
    });
  }, []);

  /** 扫描当前筛选的全部 SQLite 分页并全选或取消全选。 */
  const toggleAll = useCallback(async () => {
    if (!calls || selectingAll) return;
    if (selectedIDs.size === total && total > 0) {
      setSelectedIDs(new Set());
      return;
    }
    setSelectingAll(true);
    setError(null);
    try {
      // nextIDs 只收集具备真实服务端 ID 的记录。
      const nextIDs = new Set<string>();
      // offset 以缓存分页实际返回数递增。
      let offset = 0;
      while (offset < total) {
        // result 复用同一筛选条件，不新增数据路径。
        const result = await calls.listCached({
          answerStatus: filter,
          keyword,
          limit: 100,
          offset,
        });
        result.list.map(getCallID).filter(Boolean).forEach(id => nextIDs.add(id));
        if (!result.list.length) break;
        offset += result.list.length;
      }
      setSelectedIDs(nextIDs);
    } catch (cause) {
      setError(readError(cause));
    } finally {
      setSelectingAll(false);
    }
  }, [calls, filter, keyword, selectedIDs.size, selectingAll, total]);

  /** 执行服务端优先的批量删除并重读 cache。 */
  const deleteSelected = useCallback(async () => {
    if (!calls || !selectedIDs.size) return;
    setDeleting(true);
    setError(null);
    try {
      await calls.delete([...selectedIDs]);
      setSelectedIDs(new Set());
      setConfirmingDelete(false);
      setEditing(false);
      await readFirstPage(calls);
    } catch (cause) {
      setError(readError(cause));
      setConfirmingDelete(false);
    } finally {
      setDeleting(false);
    }
  }, [calls, readFirstPage, selectedIDs]);

  if (restoring) return <CallPageState label="正在恢复通话记录" />;
  if (!runtime) return <CallPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main
      className="rn-calls-page"
      onTouchStart={pullRefresh.onTouchStart}
      onTouchMove={pullRefresh.onTouchMove}
      onTouchEnd={pullRefresh.onTouchEnd}
      onTouchCancel={pullRefresh.onTouchCancel}
    >
      <section className="rn-calls-surface" aria-busy={loading || refreshing}>
        <header className="rn-calls-header">
          <div className="rn-calls-header-top">
            {editing ? <span /> : (
              <button type="button" onClick={() => setEditing(true)}>编辑</button>
            )}
            <div className="rn-call-segment" role="tablist" aria-label="通话筛选">
              {(['all', 'missed'] as const).map(value => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === value}
                  className={filter === value ? 'is-active' : ''}
                  key={value}
                  onClick={() => {
                    setFilter(value);
                    setSelectedIDs(new Set());
                  }}
                >
                  {value === 'all' ? '所有通话' : '未接来电'}
                </button>
              ))}
            </div>
            {editing ? (
              <button type="button" onClick={() => {
                setEditing(false);
                setSelectedIDs(new Set());
              }}>完成</button>
            ) : <span />}
          </div>
          <label className="rn-calls-search">
            <span className="sr-only">搜索</span>
            <RNAssetIcon assetURL={searchIconURL} />
            <input type="search" value={keyword} placeholder="搜索" onChange={event => {
              setKeyword(event.target.value);
              setSelectedIDs(new Set());
            }} />
            {keyword ? <button type="button" aria-label="清除" onClick={() => setKeyword('')}>
              <RNAssetIcon assetURL={clearIconURL} />
            </button> : null}
          </label>
        </header>
        <PullRefreshIndicator
          refreshing={refreshing}
          armed={pullRefresh.armed}
          pullDistance={pullRefresh.pullDistance}
        />
        {error ? <p className="rn-calls-error" role="status">{error}</p> : null}
        <section className="rn-call-list" aria-label="通话记录">
          {loading && !items.length ? <div className="rn-calls-loading"><span /></div>
            : items.length ? items.map(call => (
              <CallRecordRow key={getCallID(call)} call={call} editing={editing}
                selected={selectedIDs.has(getCallID(call))} selfID={snapshot.userID!}
                onToggle={toggleSelected} />
            )) : <p className="rn-calls-empty">{getCallListEmptyLabel(filter, keyword)}</p>}
          {items.length < total ? (
            <button className="rn-calls-more" type="button" disabled={loadingMore} onClick={() => void loadMore()}>
              {loadingMore ? '加载中...' : '加载更多'}
            </button>
          ) : null}
        </section>
        {editing ? <footer className="rn-call-edit-bar">
          <button type="button" disabled={selectingAll} onClick={() => void toggleAll()}>{selectedIDs.size === total && total ? '取消全选' : '全选'}</button>
          <button type="button" className="is-danger" disabled={!selectedIDs.size}
            onClick={() => setConfirmingDelete(true)}>删除({selectedIDs.size})</button>
        </footer> : null}
      </section>
      <CallDeleteSheet
        count={selectedIDs.size}
        deleting={deleting}
        open={confirmingDelete}
        onCancel={() => {
          if (!deleting) setConfirmingDelete(false);
        }}
        onDelete={() => void deleteSelected()}
      />
    </main>
  );
}

/** 统一承载启动和配置错误的全屏状态。 */
function CallPageState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-calls-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将未知异常转换为不含凭据的页面文本。 */
function readError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '通话记录加载失败';
}
