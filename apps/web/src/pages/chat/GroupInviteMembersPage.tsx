import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  Conversation,
  WebIMContact,
  WebIMGroupMember,
  WebIMJoinedGroup,
} from '@im28/im-sdk/web';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { PullRefreshIndicator } from '../../components/interaction/index.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { usePullRefresh } from '../../hooks/use-pull-refresh.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { GroupInviteMemberTile } from './GroupInviteMemberTile.js';
import {
  buildGroupInviteMemberCandidates,
  reconcileGroupInviteMemberSelection,
} from './group-invite-members-view.js';
import './group-remove-members-page.css';

/** RN 群成员邀请选择页只调用 shared groupMembers facade。 */
export function GroupInviteMembersPage() {
  /** conversationID 由群设置 SPA 子路由提供。 */
  const { conversationID = '' } = useParams();
  /** navigate 只负责成功后的 RN 返回语义。 */
  const navigate = useNavigate();
  /** runtime 提供当前账号认证与唯一聚合 facade。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** sync 生命周期绑定当前认证 runtime。 */
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  /** conversation 保存真实群会话身份。 */
  const [conversation, setConversation] = useState<Conversation | null>(null);
  /** group 保存 shared capability、审核设置与人数快照。 */
  const [group, setGroup] = useState<WebIMJoinedGroup | null>(null);
  /** members 保存完整 cache-first 群成员快照。 */
  const [members, setMembers] = useState<readonly WebIMGroupMember[]>([]);
  /** contacts 保存携带邀请权限的好友快照。 */
  const [contacts, setContacts] = useState<readonly WebIMContact[]>([]);
  /** selectedUserIDs 只保存稳定身份选择。 */
  const [selectedUserIDs, setSelectedUserIDs] = useState<ReadonlySet<string>>(new Set());
  /** keyword 驱动本地好友名称和身份搜索。 */
  const [keyword, setKeyword] = useState('');
  /** message 只在审核群提交为验证消息。 */
  const [message, setMessage] = useState('');
  /** loading 覆盖首次 cache-first 读取。 */
  const [loading, setLoading] = useState(true);
  /** refreshing 区分用户下拉刷新和首次页面恢复。 */
  const [refreshing, setRefreshing] = useState(false);
  /** submitting 阻止邀请 action 重复提交。 */
  const [submitting, setSubmitting] = useState(false);
  /** remoteCompleted 阻止远端已成功但缓存未收敛时再次提交。 */
  const [remoteCompleted, setRemoteCompleted] = useState(false);
  /** error 保留真实 SDK、Gateway 或 SQLite 失败。 */
  const [error, setError] = useState<string | null>(null);

  /** 按会话、群资料、成员和好友快照恢复页面事实。 */
  const load = useCallback(async (): Promise<void> => {
    if (!sync || !snapshot.userID || !conversationID) return;
    setLoading(true);
    setError(null);
    try {
      /** conversations 先读 cache，缺失才完整同步。 */
      let conversations = await sync.conversations.listCached({ limit: 500 });
      /** target 必须是当前账号真实群会话。 */
      let target = conversations.find(item => item.conversationID === conversationID);
      if (!target) {
        conversations = await sync.conversations.sync({ pageSize: 100 });
        target = conversations.find(item => item.conversationID === conversationID);
      }
      if (!target || target.type !== 'group' || !target.targetID.trim()) {
        throw new Error('群聊不存在或尚未同步');
      }
      setConversation(target);
      /** groupID 只来自共享 Conversation targetID。 */
      const groupID = target.targetID.trim();
      /** cached 快照支持弱网首见且不允许直接提交未知权限。 */
      const [cachedGroups, cachedMembers, cachedContacts] = await Promise.all([
        sync.groups.listCached(),
        sync.groupMembers.listCached(groupID),
        sync.contacts.listCached(),
      ]);
      setGroup(cachedGroups.find(item => item.groupID === groupID) ?? null);
      setMembers(cachedMembers);
      setContacts(cachedContacts);
      /** refreshed 快照补齐审核开关、成员身份和好友邀请权限。 */
      const [refreshedGroups, refreshedMembers, refreshedContacts] = await Promise.all([
        sync.groups.sync({ pageSize: 100 }),
        sync.groupMembers.sync(groupID, { pageSize: 100 }),
        sync.contacts.list({ pageSize: 100 }),
      ]);
      setGroup(refreshedGroups.find(item => item.groupID === groupID) ?? null);
      setMembers(refreshedMembers);
      setContacts(refreshedContacts);
    } catch (cause) {
      setError(readGroupInviteError(cause));
    } finally {
      setLoading(false);
    }
  }, [conversationID, snapshot.userID, sync]);

  useEffect(() => { void load(); }, [load]);

  /** 下拉刷新复用群、成员与好友三个 shared owner，失败保留旧快照。 */
  const refreshCandidates = useCallback(async (): Promise<void> => {
    if (!sync || !conversation || refreshing) return;
    /** groupID 只来自已经验证的当前群会话。 */
    const groupID = conversation.targetID.trim();
    if (!groupID) return;
    setRefreshing(true);
    setError(null);
    try {
      /** refreshedValues 必须全部成功才替换页面候选事实。 */
      const refreshedValues = await Promise.all([
        sync.groups.sync({ pageSize: 100 }),
        sync.groupMembers.sync(groupID, { pageSize: 100 }),
        sync.contacts.list({ pageSize: 100 }),
      ]);
      setGroup(refreshedValues[0].find(item => item.groupID === groupID) ?? null);
      setMembers(refreshedValues[1]);
      setContacts(refreshedValues[2]);
    } catch (cause) {
      setError(readGroupInviteError(cause));
    } finally {
      setRefreshing(false);
    }
  }, [conversation, refreshing, sync]);

  /** pullRefresh 把 RN RefreshControl 投影为浏览器顶部单指下拉。 */
  const pullRefresh = usePullRefresh({
    refreshing,
    onRefresh: refreshCandidates,
  });

  /** memberUserIDs 只由 shared 群成员快照生成。 */
  const memberUserIDs = useMemo(() => members.map(member => member.userID), [members]);
  /** candidates 复用 SDK 好友权限规则，只叠加页面搜索。 */
  const candidates = useMemo(() => buildGroupInviteMemberCandidates(
    contacts,
    memberUserIDs,
    keyword,
  ), [contacts, keyword, memberUserIDs]);
  /** allCandidates 只用于权限或成员变化时清理过期选择。 */
  const allCandidates = useMemo(() => buildGroupInviteMemberCandidates(
    contacts,
    memberUserIDs,
    '',
  ), [contacts, memberUserIDs]);
  /** settingsURL 是成功和取消的固定返回目标。 */
  const settingsURL = `/conversations/${encodeURIComponent(conversationID)}/settings`;
  /** selectedCount 直接来自稳定身份集合。 */
  const selectedCount = selectedUserIDs.size;

  useEffect(() => {
    setSelectedUserIDs(current => reconcileGroupInviteMemberSelection(current, allCandidates));
  }, [allCandidates]);

  /** 切换单个好友候选的选择状态。 */
  function toggleMember(userID: string): void {
    setError(null);
    setSelectedUserIDs(current => {
      /** next 创建新集合保证 React 状态可观察。 */
      const next = new Set(current);
      if (next.has(userID)) next.delete(userID);
      else next.add(userID);
      return next;
    });
  }

  /** 提交只调用 shared 单次写入 owner，不在页面判断 endpoint。 */
  async function submitInvitation(): Promise<void> {
    if (!sync || !conversation || !selectedCount || submitting || remoteCompleted) return;
    setSubmitting(true);
    setError(null);
    try {
      /** result 明确返回审核/直邀分支与缓存收敛状态。 */
      const result = await sync.groupMembers.inviteMembers({
        groupID: conversation.targetID,
        userIDs: [...selectedUserIDs],
        ...(group?.joinApprovalRequired && message.trim() ? { message: message.trim() } : {}),
      });
      if (result.cacheState === 'remote-only') {
        setRemoteCompleted(true);
        setError('邀请已提交到服务端，本地群成员尚未刷新；请返回群设置后下拉刷新。');
        return;
      }
      setMembers(result.members);
      setSelectedUserIDs(new Set());
      navigate(settingsURL, { replace: true, state: {
        notice: result.mode === 'application' ? '入群申请已发送' : '添加成员成功',
      } });
    } catch (cause) {
      setError(readGroupInviteError(cause));
    } finally {
      setSubmitting(false);
    }
  }

  if (restoring) return <GroupInviteMembersState label="正在恢复群成员" />;
  if (!runtime) return <GroupInviteMembersState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (!conversationID) return <Navigate to="/conversations" replace />;
  if (loading) return <GroupInviteMembersState label="正在加载可邀请好友" />;
  if (!loading && !error && (!group || !group.permissions.canInviteMembers)) {
    return <Navigate to={settingsURL} replace />;
  }

  return (
    <main
      className="rn-group-remove-page is-invite"
      aria-busy={loading || refreshing || submitting}
      onTouchStart={pullRefresh.onTouchStart}
      onTouchMove={pullRefresh.onTouchMove}
      onTouchEnd={pullRefresh.onTouchEnd}
      onTouchCancel={pullRefresh.onTouchCancel}
    >
      <section className="rn-group-remove-surface">
        <PageNavbar className="rn-group-remove-header">
          <Link to={settingsURL} aria-label="返回群设置"><RNAssetIcon assetURL={backIconURL} /></Link>
          <h1>邀请群成员{selectedCount ? `（${selectedCount}）` : ''}</h1>
          <span aria-hidden="true" />
        </PageNavbar>
        <label className="rn-group-remove-search">
          <RNAssetIcon assetURL={searchIconURL} />
          <input type="search" value={keyword} placeholder="搜索好友" aria-label="搜索可邀请好友" onChange={event => setKeyword(event.target.value)} />
          {keyword ? <button type="button" aria-label="清除搜索" onClick={() => setKeyword('')}><RNAssetIcon assetURL={clearIconURL} /></button> : null}
        </label>
        <PullRefreshIndicator
          refreshing={refreshing}
          armed={pullRefresh.armed}
          pullDistance={pullRefresh.pullDistance}
        />
        {group?.joinApprovalRequired ? (
          <label className="rn-group-invite-message">
            <span>验证消息</span>
            <input value={message} maxLength={100} placeholder="请输入邀请理由" onChange={event => setMessage(event.target.value)} />
          </label>
        ) : null}
        {error ? <p className="rn-group-remove-error" role="alert">{error}</p> : null}
        <section className="rn-group-remove-grid" aria-label="可邀请好友">
          {candidates.map(candidate => (
            <GroupInviteMemberTile
              key={candidate.contact.userID}
              candidate={candidate}
              selected={selectedUserIDs.has(candidate.contact.userID)}
              onToggle={toggleMember}
            />
          ))}
        </section>
        {!loading && !error && !candidates.length ? (
          <p className="rn-group-remove-empty">{keyword.trim() ? '未找到相关好友' : '暂无可邀请好友'}</p>
        ) : null}
        <footer className="rn-group-remove-footer">
          <button type="button" disabled={!selectedCount || submitting || remoteCompleted} onClick={() => { void submitInvitation(); }}>
            {submitting ? '邀请中' : group?.joinApprovalRequired ? '发送入群申请' : '邀请成员'}
          </button>
        </footer>
      </section>
    </main>
  );
}

/** 将共享异常转换为不含凭据的页面文案。 */
function readGroupInviteError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '邀请成员失败，请稍后重试';
}

/** 群成员邀请启动状态参数。 */
interface GroupInviteMembersStateProps {
  readonly label: string;
  readonly detail?: string | null;
}

/** 统一承载 runtime 恢复和配置错误。 */
function GroupInviteMembersState({ label, detail }: GroupInviteMembersStateProps) {
  return <main className="rn-group-remove-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

export default GroupInviteMembersPage;
