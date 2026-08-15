import { useCallback, useEffect, useState } from 'react';
import type {
  GatewayCall,
  WebIMCallAnswerStatus,
  WebIMCallSync,
} from '@im28/im-sdk/web';

import { useAppToast } from '../../components/interaction/index.js';
import { getCallID, refreshCallListPage } from './call-list-view.js';

// PAGE_SIZE 对齐 RN 通话缓存分页大小。
const PAGE_SIZE = 30;

/** 通话列表状态 owner 的运行时输入。 */
interface UseCallsPageStateOptions {
  readonly calls: WebIMCallSync | null;
  readonly userID: string;
  readonly dataVersion: number;
}

/** 通话列表页面只消费此稳定状态和显式动作。 */
interface CallsPageState {
  readonly filter: WebIMCallAnswerStatus;
  readonly keyword: string;
  readonly items: readonly GatewayCall[];
  readonly total: number;
  readonly loading: boolean;
  readonly loadingMore: boolean;
  readonly refreshing: boolean;
  readonly error: string | null;
  readonly editing: boolean;
  readonly selectedIDs: ReadonlySet<string>;
  readonly confirmingDelete: boolean;
  readonly deleting: boolean;
  readonly selectingAll: boolean;
  readonly changeFilter: (filter: WebIMCallAnswerStatus) => void;
  readonly changeKeyword: (keyword: string) => void;
  readonly startEditing: () => void;
  readonly finishEditing: () => void;
  readonly refreshCalls: () => Promise<void>;
  readonly loadMore: () => Promise<void>;
  readonly toggleSelected: (callID: string) => void;
  readonly toggleAll: () => Promise<void>;
  readonly openDeleteConfirmation: () => void;
  readonly cancelDeleteConfirmation: () => void;
  readonly deleteSelected: () => Promise<void>;
}

/** 承载通话 cache-first、分页、筛选、选择和删除事务。 */
export function useCallsPageState({
  calls,
  userID,
  dataVersion,
}: UseCallsPageStateOptions): CallsPageState {
  // toast 统一承载通话记录删除结果，不占用列表错误区域。
  const { toast } = useAppToast();
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
  // error 展示真实同步或缓存读取异常。
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
    if (!calls || !userID || refreshing || editing) return;
    setRefreshing(true);
    setError(null);
    try {
      // result 只在远端同步完成后包含当前筛选的 canonical cache。
      const result = await refreshCallListPage(calls, filter, keyword, PAGE_SIZE);
      setItems(result.list);
      setTotal(result.total);
    } catch (cause) {
      setError(readError(cause));
    } finally {
      setRefreshing(false);
    }
  }, [calls, editing, filter, keyword, refreshing, userID]);

  useEffect(() => {
    if (!calls || !userID) return;
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
  }, [calls, userID]);

  useEffect(() => {
    if (!calls || !userID) return;
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
  }, [cacheRevision, calls, dataVersion, filter, keyword, userID]);

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
      toast.success('通话记录已删除');
      try {
        await readFirstPage(calls);
      } catch (cause) {
        setError(readError(cause));
      }
    } catch (cause) {
      toast.error(readError(cause, '通话记录删除失败'));
      setConfirmingDelete(false);
    } finally {
      setDeleting(false);
    }
  }, [calls, readFirstPage, selectedIDs, toast]);

  /** 切换筛选并清空不可见选择。 */
  const changeFilter = useCallback((nextFilter: WebIMCallAnswerStatus) => {
    setFilter(nextFilter);
    setSelectedIDs(new Set());
  }, []);

  /** 更新搜索词并清空跨筛选选择。 */
  const changeKeyword = useCallback((nextKeyword: string) => {
    setKeyword(nextKeyword);
    setSelectedIDs(new Set());
  }, []);

  /** 进入批量编辑态。 */
  const startEditing = useCallback(() => setEditing(true), []);
  /** 退出批量编辑态并清空选择。 */
  const finishEditing = useCallback(() => {
    setEditing(false);
    setSelectedIDs(new Set());
  }, []);
  /** 打开删除确认层。 */
  const openDeleteConfirmation = useCallback(() => setConfirmingDelete(true), []);
  /** 非删除提交期间关闭确认层。 */
  const cancelDeleteConfirmation = useCallback(() => {
    if (!deleting) setConfirmingDelete(false);
  }, [deleting]);

  return {
    filter, keyword, items, total, loading, loadingMore, refreshing, error,
    editing, selectedIDs, confirmingDelete, deleting, selectingAll,
    changeFilter, changeKeyword, startEditing, finishEditing, refreshCalls,
    loadMore, toggleSelected, toggleAll, openDeleteConfirmation,
    cancelDeleteConfirmation, deleteSelected,
  };
}

/** 将未知异常转换为不含凭据的页面文本。 */
function readError(cause: unknown, fallback = '通话记录加载失败'): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}
