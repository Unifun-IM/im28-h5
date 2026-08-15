import { useEffect, useMemo, useState } from 'react';
import { resolveIMGroupMemberDisplayName } from '@im28/im-sdk/web';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import closeIconURL from '../../assets/rn/assets/icons/imm28/xmark.dynamic.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { PullRefreshIndicator } from '../../components/interaction/index.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { usePullRefresh } from '../../hooks/use-pull-refresh.js';
import { GroupAdminMemberRow } from './GroupAdminMemberRow.js';
import {
  filterGroupAdminCandidates,
  getGroupAdminMembers,
  IM_GROUP_ADMIN_LIMIT,
  retainGroupAdminCandidateSelection,
  toggleGroupAdminSelection,
} from './group-admin-view.js';
import { useGroupRoleRouteData } from './useGroupRoleRouteData.js';
import './group-admin-pages.css';
import './group-add-admins-page.css';

/** RN 添加管理员选择通过独立 SPA route 支持刷新和浏览器历史。 */
export function GroupAddAdminsPage() {
  /** conversationID 来自管理员列表子路由。 */
  const { conversationID = '' } = useParams();
  /** navigate 在成功后返回管理员列表而非关闭 modal。 */
  const navigate = useNavigate();
  /** data 统一提供真实成员快照和 shared mutation。 */
  const data = useGroupRoleRouteData(conversationID);
  /** keyword 只过滤当前 shared 候选快照。 */
  const [keyword, setKeyword] = useState('');
  /** selectedIDs 保存待提交的稳定成员身份。 */
  const [selectedIDs, setSelectedIDs] = useState<ReadonlySet<string>>(new Set());
  /** adminsURL 是关闭选择页的固定目标。 */
  const adminsURL = `/conversations/${encodeURIComponent(conversationID)}/settings/manage/admins`;
  /** adminCount 从真实角色快照计算。 */
  const adminCount = useMemo(() => getGroupAdminMembers(data.members).length, [data.members]);
  /** remainingSlots 与 RN 最大十人保持一致，SDK 仍会二次强校验。 */
  const remainingSlots = Math.max(0, IM_GROUP_ADMIN_LIMIT - adminCount);
  /** eligibleCandidates 用于在权威成员刷新后裁剪失效选择。 */
  const eligibleCandidates = useMemo(() => filterGroupAdminCandidates(data.members, ''), [data.members]);
  /** candidates 保持 SDK 角色候选，页面只追加关键字过滤。 */
  const candidates = useMemo(() => filterGroupAdminCandidates(data.members, keyword), [data.members, keyword]);
  /** selectedMembers 用于底部 RN 选择摘要。 */
  const selectedMembers = useMemo(() => data.members.filter(member => selectedIDs.has(member.userID)), [data.members, selectedIDs]);
  /** canSubmit 明确禁止空选择、超额和重复提交。 */
  const canSubmit = selectedIDs.size > 0 && selectedIDs.size <= remainingSlots && !data.submitting;
  /** canManageAdmins 只信任 shared capability，不从页面成员角色猜测。 */
  const canManageAdmins = data.group?.permissions.canManageAdmins === true;
  /** pullRefresh 只把触摸手势翻译为同一 shared refresh。 */
  const pullRefresh = usePullRefresh({ refreshing: data.loading, onRefresh: data.refresh });

  useEffect(() => {
    setSelectedIDs(current => retainGroupAdminCandidateSelection(current, eligibleCandidates));
  }, [eligibleCandidates]);

  /** toggleMember 在剩余名额内更新页面选择态。 */
  function toggleMember(userID: string): void {
    setSelectedIDs(current => toggleGroupAdminSelection(current, userID, remainingSlots));
  }

  /** submit 一次批量交给 shared exactly-once owner。 */
  async function submit(): Promise<void> {
    if (!canSubmit) return;
    /** success 表示 shared 远端与本地缓存都已收敛。 */
    const success = await data.addAdmins([...selectedIDs]);
    if (success) navigate(adminsURL, { replace: true });
  }

  if (data.restoring) return <GroupAddAdminState label="正在恢复管理员候选" />;
  if (!data.runtimeAvailable) return <GroupAddAdminState label="运行配置不可用" />;
  if (!data.authenticated) return <Navigate to="/login" replace />;
  if (!conversationID) return <Navigate to="/conversations" replace />;
  if (!data.loading && !data.error && (!data.group || !data.group.permissions.canManageAdmins)) {
    return <Navigate to={adminsURL} replace />;
  }

  return (
    <main className="rn-group-admin-page is-add" aria-busy={data.loading || data.submitting}>
      <section className="rn-group-admin-surface">
        <PageNavbar className="rn-group-admin-header">
          <Link to={adminsURL} aria-label="关闭添加管理员"><RNAssetIcon assetURL={closeIconURL} /></Link>
          <h1>添加管理员</h1><span />
        </PageNavbar>
        {canManageAdmins ? <label className="rn-group-admin-search"><RNAssetIcon assetURL={searchIconURL} /><span className="sr-only">搜索成员</span><input type="search" value={keyword} placeholder="搜索成员" onChange={event => setKeyword(event.target.value)} /></label> : null}
        {data.error ? <p className="rn-group-admin-error" role="alert">{data.error}</p> : null}
        {data.loading && !data.members.length ? <GroupAddAdminState label="正在加载群成员" compact /> : null}
        {!data.loading && canManageAdmins ? (
          <div
            className="rn-group-admin-candidates"
            onTouchStart={pullRefresh.onTouchStart}
            onTouchMove={pullRefresh.onTouchMove}
            onTouchEnd={pullRefresh.onTouchEnd}
            onTouchCancel={pullRefresh.onTouchCancel}
            onPointerDown={pullRefresh.onPointerDown}
            onPointerMove={pullRefresh.onPointerMove}
            onPointerUp={pullRefresh.onPointerUp}
            onPointerCancel={pullRefresh.onPointerCancel}
          >
            <PullRefreshIndicator refreshing={false} armed={pullRefresh.armed} pullDistance={pullRefresh.pullDistance} />
            {candidates.map(member => <GroupAdminMemberRow key={member.userID} member={member} selected={selectedIDs.has(member.userID)} disabled={data.submitting} onAction={() => toggleMember(member.userID)} />)}
            {!candidates.length ? <p>{keyword.trim() ? '未找到相关成员' : '暂无可添加成员'}</p> : null}
          </div>
        ) : null}
        {canManageAdmins ? <footer className="rn-group-admin-footer">
          <div aria-label="已选择管理员">{selectedMembers.slice(0, 5).map(member => <span key={member.userID} title={resolveIMGroupMemberDisplayName(member, member.userID)}>{resolveIMGroupMemberDisplayName(member, member.userID).slice(0, 1)}</span>)}{selectedMembers.length > 5 ? <span>+{selectedMembers.length - 5}</span> : null}{!selectedMembers.length ? <small>请选择需要添加的成员</small> : null}</div>
          <button type="button" disabled={!canSubmit} onClick={() => { void submit(); }}>{data.submitting ? '添加中' : '添加'}</button>
        </footer> : null}
      </section>
    </main>
  );
}

/** 添加管理员页面启动态参数。 */
interface GroupAddAdminStateProps { readonly label: string; readonly compact?: boolean; }

/** 统一承载候选页面 runtime 与加载状态。 */
function GroupAddAdminState({ label, compact = false }: GroupAddAdminStateProps) {
  return <div className={`rn-group-admin-state${compact ? ' is-compact' : ''}`}><strong>{label}</strong></div>;
}

export default GroupAddAdminsPage;
