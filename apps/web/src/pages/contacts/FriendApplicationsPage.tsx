import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WebIMFriendApplication } from '@im28/im-sdk/web';
import { Navigate, useNavigate } from 'react-router-dom';

import { PullRefreshIndicator } from '../../components/interaction/index.js';
import { usePullRefresh } from '../../hooks/use-pull-refresh.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { FriendApplicationConfirmDialog } from './FriendApplicationConfirmDialog.js';
import { FriendApplicationRow } from './FriendApplicationRow.js';
import { buildFriendApplicationEntries } from './friend-application-view.js';
import { refreshVerificationEntries } from './verification-refresh.js';
import './friend-applications-page.css';

/** RN 好友验证面板通过 Web SDK facade 读写真实申请。 */
export function FriendApplicationsPage({ onUnreadChanged }: FriendApplicationsPageProps) {
  // navigate 只负责申请资料的 SPA 路由切换。
  const navigate = useNavigate();
  // runtime context 是页面唯一 SDK 入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // applications 保留 facade 已排序的完整申请。
  const [applications, setApplications] = useState<readonly WebIMFriendApplication[]>([]);
  // loading 覆盖首次读取和刷新。
  const [loading, setLoading] = useState(false);
  // refreshing 只表示用户触发的顶部下拉刷新。
  const [refreshing, setRefreshing] = useState(false);
  // error 显示真实 Gateway 失败。
  const [error, setError] = useState<string | null>(null);
  // confirmApplication 控制 RN 居中确认框。
  const [confirmApplication, setConfirmApplication] = useState<WebIMFriendApplication | null>(null);
  // handlingID 阻止重复接受申请。
  const [handlingID, setHandlingID] = useState<string | null>(null);

  /** 对齐 RN：未读 incoming 申请先本地标记并尝试单条已读，失败不阻断资料页。 */
  const openApplication = useCallback(async (
    application: WebIMFriendApplication,
  ): Promise<void> => {
    if (!runtime || !application.userID) return;
    if (application.direction === 'incoming' && !application.isRead) {
      setApplications(current => current.map(item => item.applicationID === application.applicationID
        ? { ...item, isRead: true }
        : item));
      try {
        await runtime.getSync().friendApplications.markRead([application.applicationID]);
        await onUnreadChanged?.();
      } catch {
        // 已读失败不冒充成功，也不阻断 RN 既有资料导航行为。
      }
    }
    navigate(`/contacts/users/${encodeURIComponent(application.userID)}`, {
      state: { backHref: '/contacts/verifications/friend' },
    });
  }, [navigate, onUnreadChanged, runtime]);

  /** 从聚合 sync facade 拉取完整好友申请。 */
  const loadApplications = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID) return;
    setLoading(true);
    setError(null);
    try {
      setApplications(await runtime.getSync().friendApplications.list({ pageSize: 100 }));
    } catch (cause) {
      setError(readFriendApplicationError(cause, '好友验证加载失败'));
    } finally {
      setLoading(false);
    }
  }, [runtime, snapshot.userID]);

  useEffect(() => { void loadApplications(); }, [loadApplications]);

  /** 下拉时并行刷新好友申请与父层角标，任一计数失败不清空列表。 */
  const refreshApplications = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID || refreshing) return;
    setRefreshing(true);
    setError(null);
    try {
      /** nextApplications 只来自现有 shared 好友申请 facade。 */
      const nextApplications = await refreshVerificationEntries({
        loadEntries: () => runtime.getSync().friendApplications.list({ pageSize: 100 }),
        refreshUnread: onUnreadChanged,
      });
      setApplications(nextApplications);
    } catch (cause) {
      setError(readFriendApplicationError(cause, '好友验证加载失败'));
    } finally {
      setRefreshing(false);
    }
  }, [onUnreadChanged, refreshing, runtime, snapshot.userID]);

  /** pullRefresh 只翻译验证列表顶部触摸手势。 */
  const pullRefresh = usePullRefresh({
    refreshing: loading || refreshing,
    onRefresh: refreshApplications,
  });

  /** Gateway accept 成功后才更新本地状态并重新读取服务端。 */
  const acceptApplication = useCallback(async (): Promise<void> => {
    if (!runtime || !confirmApplication || handlingID) return;
    // target 固定当前确认对象，避免异步状态漂移。
    const target = confirmApplication;
    setConfirmApplication(null);
    setHandlingID(target.applicationID);
    setError(null);
    try {
      await runtime.getSync().friendApplications.accept(target.applicationID);
      setApplications(current => current.map(application => application.applicationID === target.applicationID
        ? { ...application, status: 'accepted' }
        : application));
      await loadApplications();
    } catch (cause) {
      setError(readFriendApplicationError(cause, '添加好友失败'));
    } finally {
      setHandlingID(null);
    }
  }, [confirmApplication, handlingID, loadApplications, runtime]);

  // entries 生成 RN 内嵌验证页的日期 section 和申请行。
  const entries = useMemo(
    () => buildFriendApplicationEntries(applications, ''),
    [applications],
  );

  if (restoring) return <FriendApplicationsPageState label="正在恢复好友验证" />;
  if (!runtime) return <FriendApplicationsPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  // pageContent 收敛好友验证唯一真实列表。
  const pageContent = <>
      {error ? <div className="rn-friend-applications-error" role="status"><span>{error}</span><button type="button" onClick={() => void loadApplications()}>重试</button></div> : null}
      <div className="rn-friend-applications-list" role="list">
        {entries.map(entry => entry.type === 'section'
          ? <h2 key={entry.key}>{entry.title}</h2>
          : <FriendApplicationRow key={entry.key} application={entry.application} handling={handlingID === entry.application.applicationID} onOpen={() => void openApplication(entry.application)} onAccept={() => setConfirmApplication(entry.application)} />)}
        {!loading && entries.length === 0 ? <p className="rn-friend-applications-empty">暂无好友验证记录</p> : null}
      </div>
  </>;
  // confirmDialog 保持接受申请的唯一 mutation owner。
  const confirmDialog = confirmApplication ? <FriendApplicationConfirmDialog application={confirmApplication} pending={handlingID === confirmApplication.applicationID} onCancel={() => setConfirmApplication(null)} onConfirm={() => void acceptApplication()} /> : null;

  return <section
    className="rn-friend-applications-embedded"
    aria-busy={loading || refreshing}
    onTouchStart={pullRefresh.onTouchStart}
    onTouchMove={pullRefresh.onTouchMove}
    onTouchEnd={pullRefresh.onTouchEnd}
    onTouchCancel={pullRefresh.onTouchCancel}
  >
    <PullRefreshIndicator refreshing={refreshing} pullDistance={pullRefresh.pullDistance} armed={pullRefresh.armed} />
    {pageContent}{confirmDialog}
  </section>;
}

/** 好友验证嵌入页参数。 */
interface FriendApplicationsPageProps {
  readonly onUnreadChanged?: () => void | Promise<void>;
}

/** 收敛好友申请异常且不泄漏凭据。 */
function readFriendApplicationError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

/** 统一承载好友验证启动状态。 */
function FriendApplicationsPageState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-friend-applications-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}
