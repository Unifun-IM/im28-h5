import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WebIMFriendApplication } from '@im28/im-sdk/web';
import { Link, Navigate } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { FriendApplicationConfirmDialog } from './FriendApplicationConfirmDialog.js';
import { FriendApplicationRow } from './FriendApplicationRow.js';
import { buildFriendApplicationEntries } from './friend-application-view.js';
import './friend-applications-page.css';

/** RN standalone 好友验证页通过 Web SDK facade 读写真实申请。 */
export function FriendApplicationsPage() {
  // runtime context 是页面唯一 SDK 入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // applications 保留 facade 已排序的完整申请。
  const [applications, setApplications] = useState<readonly WebIMFriendApplication[]>([]);
  // keyword 驱动 RN 本地搜索。
  const [keyword, setKeyword] = useState('');
  // loading 覆盖首次读取和刷新。
  const [loading, setLoading] = useState(false);
  // error 显示真实 Gateway 失败。
  const [error, setError] = useState<string | null>(null);
  // confirmApplication 控制 RN 居中确认框。
  const [confirmApplication, setConfirmApplication] = useState<WebIMFriendApplication | null>(null);
  // handlingID 阻止重复接受申请。
  const [handlingID, setHandlingID] = useState<string | null>(null);

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

  // entries 生成当前搜索条件下的日期 section 和申请行。
  const entries = useMemo(
    () => buildFriendApplicationEntries(applications, keyword),
    [applications, keyword],
  );

  if (restoring) return <FriendApplicationsPageState label="正在恢复好友验证" />;
  if (!runtime) return <FriendApplicationsPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return <main className="rn-friend-applications-page" aria-busy={loading}>
    <section className="rn-friend-applications-surface">
      <header className="rn-friend-applications-header">
        <Link to="/contacts" aria-label="返回通讯录"><RNAssetIcon assetURL={backIconURL} /></Link>
        <h1>好友验证</h1><span />
      </header>
      <label className="rn-friend-applications-search">
        <RNAssetIcon assetURL={searchIconURL} />
        <input type="search" value={keyword} placeholder="搜索好友/账号ID" aria-label="搜索好友验证" onChange={event => setKeyword(event.target.value)} />
        {keyword ? <button type="button" aria-label="清除" onClick={() => setKeyword('')}><RNAssetIcon assetURL={clearIconURL} /></button> : null}
      </label>
      {error ? <div className="rn-friend-applications-error" role="status"><span>{error}</span><button type="button" onClick={() => void loadApplications()}>重试</button></div> : null}
      <div className="rn-friend-applications-list" role="list">
        {entries.map(entry => entry.type === 'section'
          ? <h2 key={entry.key}>{entry.title}</h2>
          : <FriendApplicationRow key={entry.key} application={entry.application} handling={handlingID === entry.application.applicationID} onAccept={() => setConfirmApplication(entry.application)} />)}
        {!loading && entries.length === 0 ? <p className="rn-friend-applications-empty">暂无好友验证记录</p> : null}
      </div>
    </section>
    {confirmApplication ? <FriendApplicationConfirmDialog application={confirmApplication} pending={handlingID === confirmApplication.applicationID} onCancel={() => setConfirmApplication(null)} onConfirm={() => void acceptApplication()} /> : null}
  </main>;
}

/** 收敛好友申请异常且不泄漏凭据。 */
function readFriendApplicationError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

/** 统一承载好友验证启动状态。 */
function FriendApplicationsPageState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-friend-applications-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}
