import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WebIMGroupApplication } from '@im28/im-sdk/web';
import { Navigate, useParams } from 'react-router-dom';

import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { GroupApplicationActionDialog } from './GroupApplicationActionDialog.js';
import { GroupApplicationRow } from './GroupApplicationRow.js';
import { GroupApplicationsError, GroupApplicationsHeader, GroupApplicationsPageState } from './GroupApplicationsShared.js';
import { buildGroupApplicationEntries, readGroupApplicationError } from './group-application-view.js';
import './group-applications-page.css';

/** RN 单群入群申请页复用 audit facade，并提供真实 accept/reject。 */
export function GroupApplicationsPage() {
  // groupID 来自稳定 React Router path。
  const { groupID = '' } = useParams();
  // runtime context 是页面唯一 SDK 入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // applications 保存完整 audit 结果以支持直接刷新恢复。
  const [applications, setApplications] = useState<readonly WebIMGroupApplication[]>([]);
  // keyword 驱动单群申请人本地搜索。
  const [keyword, setKeyword] = useState('');
  // loading 覆盖首次读取和处理后刷新。
  const [loading, setLoading] = useState(false);
  // error 显示真实 Gateway 失败。
  const [error, setError] = useState<string | null>(null);
  // activeApplication 控制 RN 操作弹层。
  const [activeApplication, setActiveApplication] = useState<WebIMGroupApplication | null>(null);
  // pendingAction 阻止重复 mutation。
  const [pendingAction, setPendingAction] = useState<'accept' | 'reject' | null>(null);

  /** 从同一个 audit facade 恢复单群申请数据。 */
  const loadApplications = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID || !groupID) return;
    setLoading(true);
    setError(null);
    try {
      setApplications(await runtime.getSync().groupApplications.list({ pageSize: 100 }));
    } catch (cause) {
      setError(readGroupApplicationError(cause, '入群申请加载失败'));
    } finally {
      setLoading(false);
    }
  }, [groupID, runtime, snapshot.userID]);

  useEffect(() => { void loadApplications(); }, [loadApplications]);

  /** Gateway mutation 成功后才关闭弹层并重新读取列表。 */
  const handleApplication = useCallback(async (action: 'accept' | 'reject'): Promise<void> => {
    if (!runtime || !activeApplication || pendingAction) return;
    // target 固定当前操作对象，避免异步状态漂移。
    const target = activeApplication;
    setPendingAction(action);
    setError(null);
    try {
      if (action === 'accept') await runtime.getSync().groupApplications.accept(target.applicationID);
      else await runtime.getSync().groupApplications.reject(target.applicationID);
      setActiveApplication(null);
      await loadApplications();
    } catch (cause) {
      setError(readGroupApplicationError(cause, action === 'accept' ? '通过申请失败' : '拒绝申请失败'));
    } finally {
      setPendingAction(null);
    }
  }, [activeApplication, loadApplications, pendingAction, runtime]);

  // entries 生成当前群和搜索条件下的日期 section。
  const entries = useMemo(() => buildGroupApplicationEntries(applications, groupID, keyword), [applications, groupID, keyword]);
  // groupName 从真实 audit 数据回退群 ID。
  const groupName = applications.find(application => application.groupID === groupID)?.groupName || groupID;

  if (restoring) return <GroupApplicationsPageState label="正在恢复入群申请" />;
  if (!runtime) return <GroupApplicationsPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (!groupID) return <Navigate to="/contacts/group-applications" replace />;

  return <main className="rn-group-applications-page" aria-busy={loading}>
    <section className="rn-group-applications-surface">
      <GroupApplicationsHeader title="入群申请" backTo="/contacts/group-applications" />
      <p className="rn-group-applications-group-name">{groupName}</p>
      <label className="rn-group-applications-search"><RNAssetIcon assetURL={searchIconURL} /><input type="search" value={keyword} placeholder="搜索申请人/用户ID" aria-label="搜索入群申请" onChange={event => setKeyword(event.target.value)} />{keyword ? <button type="button" aria-label="清除" onClick={() => setKeyword('')}><RNAssetIcon assetURL={clearIconURL} /></button> : null}</label>
      {error ? <GroupApplicationsError message={error} onRetry={() => void loadApplications()} /> : null}
      <div className="rn-group-application-list">
        {entries.map(entry => entry.type === 'section' ? <h2 key={entry.key}>{entry.title}</h2> : <GroupApplicationRow key={entry.key} application={entry.application} onHandle={() => setActiveApplication(entry.application)} />)}
        {!loading && !error && entries.length === 0 ? <p className="rn-group-applications-empty">暂无入群申请</p> : null}
      </div>
    </section>
    {activeApplication ? <GroupApplicationActionDialog application={activeApplication} pendingAction={pendingAction} onCancel={() => { if (!pendingAction) setActiveApplication(null); }} onAccept={() => void handleApplication('accept')} onReject={() => void handleApplication('reject')} /> : null}
  </main>;
}
