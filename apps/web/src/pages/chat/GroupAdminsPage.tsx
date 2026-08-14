import { useMemo, useState } from 'react';
import { resolveIMGroupMemberDisplayName, type WebIMGroupMember } from '@im28/im-sdk/web';
import { Link, Navigate, useParams } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import { InteractionModal } from '../../components/interaction/index.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { GroupAdminMemberRow } from './GroupAdminMemberRow.js';
import { IM_GROUP_ADMIN_LIMIT, getGroupAdminMembers } from './group-admin-view.js';
import { useGroupRoleRouteData } from './useGroupRoleRouteData.js';
import './group-admin-pages.css';

/** RN 群管理员列表通过独立 React Router 页面消费 shared 角色快照。 */
export function GroupAdminsPage() {
  /** conversationID 来自稳定群管理子路由。 */
  const { conversationID = '' } = useParams();
  /** data 统一恢复群会话、权限和成员快照。 */
  const data = useGroupRoleRouteData(conversationID);
  /** removeTarget 只保存待确认的 shared 成员对象。 */
  const [removeTarget, setRemoveTarget] = useState<WebIMGroupMember | null>(null);
  /** admins 仅投影 SDK 已规范化 admin 角色。 */
  const admins = useMemo(() => getGroupAdminMembers(data.members), [data.members]);
  /** manageURL 是本页固定返回目标。 */
  const manageURL = `/conversations/${encodeURIComponent(conversationID)}/settings/manage`;
  /** addURL 是唯一管理员添加入口。 */
  const addURL = `${manageURL}/admins/add`;
  /** canManageAdmins 只信任 shared capability，不从页面角色猜测。 */
  const canManageAdmins = data.group?.permissions.canManageAdmins === true;

  /** confirmRemove 调用 shared cancelAdmins 后关闭确认层。 */
  async function confirmRemove(): Promise<void> {
    if (!removeTarget) return;
    /** success 仅在本地缓存已收敛时为 true。 */
    const success = await data.removeAdmin(removeTarget.userID);
    if (success) setRemoveTarget(null);
  }

  if (data.restoring) return <GroupAdminState label="正在恢复群管理员" />;
  if (!data.runtimeAvailable) return <GroupAdminState label="运行配置不可用" />;
  if (!data.authenticated) return <Navigate to="/login" replace />;
  if (!conversationID) return <Navigate to="/conversations" replace />;
  if (!data.loading && !data.error && (!data.group || !data.group.permissions.canManageAdmins)) {
    return <Navigate to={manageURL} replace />;
  }

  return (
    <main className="rn-group-admin-page" aria-busy={data.loading || data.submitting}>
      <section className="rn-group-admin-surface">
        <PageNavbar className="rn-group-admin-header">
          <Link to={manageURL} aria-label="返回群管理"><RNAssetIcon assetURL={backIconURL} /></Link>
          <h1>群管理员</h1><span />
        </PageNavbar>
        <div className="rn-group-admin-tip">
          <p>管理员可协助群主管理群聊，拥有移除群成员的能力<br />只有群主具备设置管理员、解散群聊的能力<br />最多可设置{IM_GROUP_ADMIN_LIMIT}个管理员</p>
          {data.error ? <span role="alert">{data.error}</span> : null}
        </div>
        {data.loading && !data.members.length ? <GroupAdminState label="正在加载群管理员" compact /> : null}
        {!data.loading && canManageAdmins ? (
          <div className="rn-group-admin-list">
            {admins.map(member => (
              <GroupAdminMemberRow key={member.userID} member={member} actionLabel="移除" disabled={data.submitting} onAction={() => setRemoveTarget(member)} />
            ))}
            <Link className="rn-group-admin-add" to={addURL} aria-disabled={admins.length >= IM_GROUP_ADMIN_LIMIT} onClick={event => { if (admins.length >= IM_GROUP_ADMIN_LIMIT) event.preventDefault(); }}><span>＋</span><strong>添加成员</strong></Link>
          </div>
        ) : null}
      </section>
      <InteractionModal open={Boolean(removeTarget)} ariaLabel="移除管理权限" onRequestClose={() => { if (!data.submitting) setRemoveTarget(null); }}>
        <section className="rn-group-admin-confirm im-modal-sheet">
          <h2>移除管理权限</h2>
          <p>{removeTarget ? `移除后，“${resolveIMGroupMemberDisplayName(removeTarget, removeTarget.userID)}”将无法管理群聊。` : ''}</p>
          <div><button type="button" disabled={data.submitting} onClick={() => setRemoveTarget(null)}>取消</button><button className="is-danger" type="button" disabled={data.submitting} onClick={() => { void confirmRemove(); }}>{data.submitting ? '处理中' : '移除'}</button></div>
        </section>
      </InteractionModal>
    </main>
  );
}

/** 管理员页面启动态参数。 */
interface GroupAdminStateProps { readonly label: string; readonly compact?: boolean; }

/** 统一承载 runtime 与列表加载状态。 */
function GroupAdminState({ label, compact = false }: GroupAdminStateProps) {
  return <div className={`rn-group-admin-state${compact ? ' is-compact' : ''}`}><strong>{label}</strong></div>;
}

export default GroupAdminsPage;
