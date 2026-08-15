import { useEffect, useMemo } from 'react';
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
} from './call-list-view.js';
import { useCallsPageState } from './useCallsPageState.js';
import './calls-page.css';

/** 通话页只向主布局报告全屏编辑态，不直接控制全局底栏。 */
interface CallsPageProps {
  readonly onChromeHiddenChange?: (hidden: boolean) => void;
}

/** RN 通话记录主页面使用 Web SDK cache-first 真实链路。 */
export function CallsPage({ onChromeHiddenChange }: CallsPageProps = {}) {
  // runtime context 是页面唯一 SDK facade owner。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // calls 只从聚合 sync facade 获取，不直接调用 Gateway 或数据库。
  const calls = useMemo(() => runtime?.getSync().calls ?? null, [runtime]);
  // state 承载 cache-first、筛选、分页、选择和删除事务。
  const state = useCallsPageState({
    calls,
    userID: snapshot.userID ?? '',
    dataVersion: snapshot.dataVersion,
  });
  // 页面解构只保留渲染和交互绑定需要的字段。
  const {
    filter, keyword, items, total, loading, loadingMore, refreshing, error,
    editing, selectedIDs, confirmingDelete, deleting, selectingAll,
  } = state;

  useEffect(() => {
    onChromeHiddenChange?.(editing);
  }, [editing, onChromeHiddenChange]);

  useEffect(() => {
    // Activity 隐藏或主布局卸载时必须归还全局底栏控制权。
    return () => onChromeHiddenChange?.(false);
  }, [onChromeHiddenChange]);

  /** pullRefresh 只翻译顶部单指下拉，编辑态不接管列表手势。 */
  const pullRefresh = usePullRefresh({
    refreshing: refreshing || editing,
    onRefresh: state.refreshCalls,
  });

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
      onPointerDown={pullRefresh.onPointerDown}
      onPointerMove={pullRefresh.onPointerMove}
      onPointerUp={pullRefresh.onPointerUp}
      onPointerCancel={pullRefresh.onPointerCancel}
    >
      <section
        className={`rn-calls-surface${editing ? ' is-editing' : ''}`}
        aria-busy={loading || refreshing}
      >
        <header className="rn-calls-header">
          <div className="rn-calls-header-top">
            {editing ? <span /> : (
              <button type="button" onClick={state.startEditing}>编辑</button>
            )}
            <div className="rn-call-segment" role="tablist" aria-label="通话筛选">
              {(['all', 'missed'] as const).map(value => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === value}
                  className={filter === value ? 'is-active' : ''}
                  key={value}
                  onClick={() => state.changeFilter(value)}
                >
                  {value === 'all' ? '所有通话' : '未接来电'}
                </button>
              ))}
            </div>
            {editing ? (
              <button type="button" onClick={state.finishEditing}>完成</button>
            ) : <span />}
          </div>
          <label className="rn-calls-search">
            <span className="sr-only">搜索</span>
            <RNAssetIcon assetURL={searchIconURL} />
            <input type="search" value={keyword} placeholder="搜索"
              onChange={event => state.changeKeyword(event.target.value)} />
            {keyword ? <button type="button" aria-label="清除" onClick={() => state.changeKeyword('')}>
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
                onToggle={state.toggleSelected} />
            )) : <p className="rn-calls-empty">{getCallListEmptyLabel(filter, keyword)}</p>}
          {items.length < total ? (
            <button className="rn-calls-more" type="button" disabled={loadingMore} onClick={() => void state.loadMore()}>
              {loadingMore ? '加载中...' : '加载更多'}
            </button>
          ) : null}
        </section>
        {editing ? <footer className="rn-call-edit-bar">
          <button type="button" disabled={selectingAll} onClick={() => void state.toggleAll()}>{selectedIDs.size === total && total ? '取消全选' : '全选'}</button>
          <button type="button" className="is-danger" disabled={!selectedIDs.size}
            onClick={state.openDeleteConfirmation}>删除({selectedIDs.size})</button>
        </footer> : null}
      </section>
      <CallDeleteSheet
        count={selectedIDs.size}
        deleting={deleting}
        open={confirmingDelete}
        onCancel={state.cancelDeleteConfirmation}
        onDelete={() => void state.deleteSelected()}
      />
    </main>
  );
}

/** 统一承载启动和配置错误的全屏状态。 */
function CallPageState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-calls-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}
