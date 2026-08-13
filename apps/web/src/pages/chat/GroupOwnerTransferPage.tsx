import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { resolveIMGroupMemberDisplayName, type WebIMGroupMember } from '@im28/im-sdk/web';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import closeIconURL from '../../assets/rn/assets/icons/imm28/xmark.dynamic.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { InteractionModal } from '../../components/interaction/index.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { usePullRefresh } from '../../hooks/use-pull-refresh.js';
import { getGroupMemberRoleLabel } from './group-members-view.js';
import {
  buildGroupOwnerTransferEntries,
  retainGroupOwnerTransferSelection,
} from './group-owner-transfer-view.js';
import { useGroupRoleRouteData } from './useGroupRoleRouteData.js';
import './group-owner-transfer-page.css';

/** RN 群主转让选择通过独立 SPA route 消费 shared 角色 owner。 */
export function GroupOwnerTransferPage() {
  /** conversationID 来自群管理子路由。 */
  const { conversationID = '' } = useParams();
  /** searchParams 只允许选择群列表返回上下文，不携带业务身份。 */
  const [searchParams] = useSearchParams();
  /** navigate 在转让成功后离开已失效的群管理权限页。 */
  const navigate = useNavigate();
  /** data 统一提供真实群权限、成员快照和 shared mutation。 */
  const data = useGroupRoleRouteData(conversationID);
  /** keyword 只驱动当前候选快照的页面搜索。 */
  const [keyword, setKeyword] = useState('');
  /** selectedUserID 只保存待确认的新群主稳定身份。 */
  const [selectedUserID, setSelectedUserID] = useState('');
  /** manageURL 是关闭选择页的固定返回目标。 */
  const manageURL = `/conversations/${encodeURIComponent(conversationID)}/settings/manage`;
  /** settingsURL 是转让成功后返回的群设置页。 */
  const settingsURL = `/conversations/${encodeURIComponent(conversationID)}/settings`;
  /** fromJoinedGroups 保留群列表发起动作的可恢复 UI 上下文。 */
  const fromJoinedGroups = searchParams.get('from') === 'joined-groups';
  /** closeURL 在群列表动作中避免跳入无关的群管理页面。 */
  const closeURL = fromJoinedGroups ? '/contacts/groups' : manageURL;
  /** successURL 转让成功后离开已经失效的群主管理范围。 */
  const successURL = fromJoinedGroups ? '/contacts/groups' : settingsURL;
  /** entries 保持 SDK 候选资格并复刻 RN 角色/拼音分组。 */
  const entries = useMemo(
    () => buildGroupOwnerTransferEntries(data.members, data.currentUserID, keyword),
    [data.currentUserID, data.members, keyword],
  );
  /** selectedMember 必须从当前权威成员快照解析。 */
  const selectedMember = useMemo(
    () => data.members.find(member => member.userID === selectedUserID) ?? null,
    [data.members, selectedUserID],
  );
  /** canTransferOwner 只信 shared capability，不从页面角色猜测。 */
  const canTransferOwner = data.group?.permissions.canTransferOwner === true;
  /** pullRefresh 只把触摸手势翻译为同一 shared refresh。 */
  const pullRefresh = usePullRefresh({ refreshing: data.loading, onRefresh: data.refresh });

  useEffect(() => {
    setSelectedUserID(current => retainGroupOwnerTransferSelection(
      current,
      data.members,
      data.currentUserID,
    ));
  }, [data.currentUserID, data.members]);

  /** confirmTransfer 将唯一目标交给 shared exactly-once owner。 */
  async function confirmTransfer(): Promise<void> {
    if (!selectedMember || data.submitting) return;
    /** success 仅表示 shared 已取得权威或本地可用收敛结果。 */
    const success = await data.transferOwner(selectedMember.userID);
    if (success) navigate(successURL, { replace: true });
  }

  if (data.restoring) return <GroupOwnerTransferState label="正在恢复群成员" />;
  if (!data.runtimeAvailable) return <GroupOwnerTransferState label="运行配置不可用" />;
  if (!data.authenticated) return <Navigate to="/login" replace />;
  if (!conversationID) return <Navigate to="/conversations" replace />;
  if (!data.loading && !data.error && (!data.group || !data.group.permissions.canTransferOwner)) {
    return <Navigate to={manageURL} replace />;
  }

  return (
    <main className="rn-group-owner-transfer-page" aria-busy={data.loading || data.submitting}>
      <section className="rn-group-owner-transfer-surface">
        <header className="rn-group-owner-transfer-header">
          <Link to={closeURL} aria-label="关闭选择新群主"><RNAssetIcon assetURL={closeIconURL} /></Link>
          <h1>选择新群主</h1><span />
        </header>
        {canTransferOwner ? <label className="rn-group-owner-transfer-search"><RNAssetIcon assetURL={searchIconURL} /><span className="sr-only">搜索成员</span><input type="search" value={keyword} placeholder="搜索" onChange={event => setKeyword(event.target.value)} /></label> : null}
        {data.error ? <p className="rn-group-owner-transfer-error" role="alert">{data.error}</p> : null}
        {data.notice ? <p className="rn-group-owner-transfer-notice" role="status">{data.notice}</p> : null}
        {data.loading && !data.members.length ? <GroupOwnerTransferState label="正在加载群成员" compact /> : null}
        {!data.loading && canTransferOwner ? (
          <section
            className="rn-group-owner-transfer-list"
            aria-label="可转让群主成员"
            onTouchStart={pullRefresh.onTouchStart}
            onTouchMove={pullRefresh.onTouchMove}
            onTouchEnd={pullRefresh.onTouchEnd}
            onTouchCancel={pullRefresh.onTouchCancel}
          >
            <div className={`rn-group-owner-transfer-pull${pullRefresh.armed ? ' is-armed' : ''}`} style={{ height: pullRefresh.pullDistance }}>{pullRefresh.armed ? '松开刷新' : '下拉刷新'}</div>
            {entries.map(entry => entry.type === 'section'
              ? <h2 key={entry.key}>{entry.title}</h2>
              : <GroupOwnerTransferRow key={entry.key} member={entry.member} displayName={entry.displayName} disabled={data.submitting} onSelect={() => setSelectedUserID(entry.member.userID)} />)}
            {!entries.length ? <p>{keyword.trim() ? '未找到相关成员' : '暂无可转让成员'}</p> : null}
          </section>
        ) : null}
      </section>
      <GroupOwnerTransferConfirm member={selectedMember} submitting={data.submitting} onCancel={() => setSelectedUserID('')} onConfirm={() => { void confirmTransfer(); }} />
    </main>
  );
}

/** 群主转让成员行只接收 shared DTO 和显式选择动作。 */
interface GroupOwnerTransferRowProps { readonly member: WebIMGroupMember; readonly displayName: string; readonly disabled: boolean; readonly onSelect: () => void; }

/** 呈现 RN 40px 头像、名称和管理员标签。 */
function GroupOwnerTransferRow({ member, displayName, disabled, onSelect }: GroupOwnerTransferRowProps) {
  /** avatarStyle 复用 RN 稳定 fallback 渐变。 */
  const avatarStyle = { '--group-owner-transfer-avatar-gradient': getRNAvatarGradient(member.userID) } as CSSProperties;
  /** roleLabel 只展示 SDK 已规范化的管理员角色。 */
  const roleLabel = getGroupMemberRoleLabel(member.role);
  return <button className="rn-group-owner-transfer-row" type="button" disabled={disabled} aria-label={`选择新群主${displayName}`} onClick={onSelect}><span className="rn-group-owner-transfer-avatar" style={avatarStyle}><span>{getRNAvatarInitial(displayName, '群')}</span>{member.avatarURL ? <img src={member.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}</span><span><strong>{displayName}</strong><small>{member.userID}</small></span>{roleLabel ? <em>{roleLabel}</em> : null}</button>;
}

/** 群主转让确认层参数绑定当前成员快照和提交状态。 */
interface GroupOwnerTransferConfirmProps { readonly member: WebIMGroupMember | null; readonly submitting: boolean; readonly onCancel: () => void; readonly onConfirm: () => void; }

/** 复刻 RN 头像、昵称、提示和底部确认/取消语义。 */
function GroupOwnerTransferConfirm({ member, submitting, onCancel, onConfirm }: GroupOwnerTransferConfirmProps) {
  /** name 复用 shared 备注、群昵称、公开昵称优先级。 */
  const name = member ? resolveIMGroupMemberDisplayName(member, member.userID) : '';
  /** avatarStyle 复用成员稳定 fallback 渐变。 */
  const avatarStyle = { '--group-owner-transfer-avatar-gradient': getRNAvatarGradient(member?.userID ?? '') } as CSSProperties;
  return <InteractionModal open={Boolean(member)} ariaLabel="确认选择新群主" onRequestClose={() => { if (!submitting) onCancel(); }}><section className="rn-group-owner-transfer-confirm im-modal-sheet"><div>{member ? <span className="rn-group-owner-transfer-avatar" style={avatarStyle}><span>{getRNAvatarInitial(name, '群')}</span>{member.avatarURL ? <img src={member.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}</span> : null}<strong>{name}</strong><p>你选择他为新的群主身份</p></div><button type="button" disabled={submitting || !member} onClick={onConfirm}>{submitting ? '确定中' : '确定'}</button><button type="button" disabled={submitting} onClick={onCancel}>取消</button></section></InteractionModal>;
}

/** 群主转让页面启动态参数。 */
interface GroupOwnerTransferStateProps { readonly label: string; readonly compact?: boolean; }

/** 统一承载 runtime 与成员加载状态。 */
function GroupOwnerTransferState({ label, compact = false }: GroupOwnerTransferStateProps) {
  return <div className={`rn-group-owner-transfer-state${compact ? ' is-compact' : ''}`}><strong>{label}</strong></div>;
}

export default GroupOwnerTransferPage;
