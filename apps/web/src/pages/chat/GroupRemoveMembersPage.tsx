import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Conversation, WebIMGroupMember, WebIMJoinedGroup } from '@im28/im-sdk/web';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { PullRefreshIndicator, useAppToast } from '../../components/interaction/index.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { usePullRefresh } from '../../hooks/use-pull-refresh.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { GroupMemberPickerModal } from './GroupMemberPickerModal.js';
import { GroupRemoveMemberTile } from './GroupRemoveMemberTile.js';
import {
  buildGroupRemoveMemberCandidates,
  reconcileGroupRemoveMemberSelection,
} from './group-remove-members-view.js';
import './group-remove-members-page.css';

/** RN 群成员移除选择页只调用 shared groupMembers facade。 */
export function GroupRemoveMembersPage() {
  // conversationID 由群设置 SPA 子路由提供。
  const { conversationID = '' } = useParams();
  // navigate 只负责成功后的 RN 返回语义。
  const navigate = useNavigate();
  // runtime 提供当前账号认证与唯一聚合 facade。
  const { runtime, snapshot, restoring } = useWebIMRuntime();
  // sync 生命周期绑定当前认证 runtime。
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  // toast 统一承载移除成员 mutation 的成功与失败反馈。
  const { toast } = useAppToast();
  // conversation 保存真实群会话身份。
  const [conversation, setConversation] = useState<Conversation | null>(null);
  // group 保存 shared capability 与人数快照。
  const [group, setGroup] = useState<WebIMJoinedGroup | null>(null);
  // members 保存完整 cache-first 成员快照。
  const [members, setMembers] = useState<readonly WebIMGroupMember[]>([]);
  // selectedUserIDs 只保存页面稳定选择，不复制成员资料。
  const [selectedUserIDs, setSelectedUserIDs] = useState<ReadonlySet<string>>(new Set());
  // keyword 驱动本地名称和身份搜索。
  const [keyword, setKeyword] = useState('');
  // loading 覆盖首次 cache-first 读取。
  const [loading, setLoading] = useState(true);
  /** refreshing 区分用户下拉刷新和首次页面恢复。 */
  const [refreshing, setRefreshing] = useState(false);
  // submitting 阻止危险 action 重复提交。
  const [submitting, setSubmitting] = useState(false);
  // confirmOpen 要求真实移除前二次确认。
  const [confirmOpen, setConfirmOpen] = useState(false);
  // remoteCompleted 阻止远端已成功但缓存未收敛时再次提交。
  const [remoteCompleted, setRemoteCompleted] = useState(false);
  // error 保留真实 SDK、Gateway 或 SQLite 失败。
  const [error, setError] = useState<string | null>(null);

  /** 按会话、群资料、成员快照顺序恢复页面事实。 */
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
      /** cachedGroups 和 cachedMembers 提供弱网恢复。 */
      const [cachedGroups, cachedMembers] = await Promise.all([
        sync.groups.listCached(),
        sync.groupMembers.listCached(groupID),
      ]);
      setGroup(cachedGroups.find(item => item.groupID === groupID) ?? null);
      setMembers(cachedMembers);
      /** refreshedGroups 先刷新 capability，成员 facade 再刷新完整目标集合。 */
      const refreshedGroups = await sync.groups.sync({ pageSize: 100 });
      const refreshedMembers = await sync.groupMembers.sync(groupID, { pageSize: 100 });
      setGroup(refreshedGroups.find(item => item.groupID === groupID) ?? null);
      setMembers(refreshedMembers);
    } catch (cause) {
      setError(readGroupRemoveError(cause));
    } finally {
      setLoading(false);
    }
  }, [conversationID, snapshot.userID, sync]);

  useEffect(() => { void load(); }, [load]);

  /** 下拉刷新只重读 shared 群与成员 facade，失败保留旧候选和选择。 */
  const refreshMembers = useCallback(async (): Promise<void> => {
    if (!sync || !conversation || refreshing) return;
    /** groupID 只来自已经验证的当前群会话。 */
    const groupID = conversation.targetID.trim();
    if (!groupID) return;
    setRefreshing(true);
    setError(null);
    try {
      /** refreshedValues 全部成功后才一次替换页面事实。 */
      const refreshedValues = await Promise.all([
        sync.groups.sync({ pageSize: 100 }),
        sync.groupMembers.sync(groupID, { pageSize: 100 }),
      ]);
      setGroup(refreshedValues[0].find(item => item.groupID === groupID) ?? null);
      setMembers(refreshedValues[1]);
    } catch (cause) {
      setError(readGroupRemoveError(cause));
    } finally {
      setRefreshing(false);
    }
  }, [conversation, refreshing, sync]);

  /** pullRefresh 把 RN RefreshControl 投影为浏览器顶部单指下拉。 */
  const pullRefresh = usePullRefresh({
    refreshing,
    onRefresh: refreshMembers,
  });

  // candidates 复用 SDK 唯一角色规则，只叠加页面搜索。
  const candidates = useMemo(() => buildGroupRemoveMemberCandidates(
    members,
    snapshot.userID ?? '',
    keyword,
  ), [keyword, members, snapshot.userID]);
  // allCandidates 只用于权限变化时清理过期选择。
  const allCandidates = useMemo(() => buildGroupRemoveMemberCandidates(
    members,
    snapshot.userID ?? '',
    '',
  ), [members, snapshot.userID]);
  // settingsURL 是成功和取消的固定返回目标。
  const settingsURL = `/conversations/${encodeURIComponent(conversationID)}/settings`;
  // selectedCount 直接来自稳定身份集合。
  const selectedCount = selectedUserIDs.size;

  useEffect(() => {
    setSelectedUserIDs(current => reconcileGroupRemoveMemberSelection(current, allCandidates));
  }, [allCandidates]);

  /** 切换单个候选的选择状态。 */
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

  /** 二次确认后只调用 shared 单次写入 owner。 */
  async function confirmRemoval(): Promise<void> {
    if (!sync || !conversation || !selectedCount || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      /** result 包含权威或本地收敛成员快照。 */
      const result = await sync.groupMembers.removeMembers({
        groupID: conversation.targetID,
        userIDs: [...selectedUserIDs],
      });
      if (result.cacheState === 'remote-only') {
        setRemoteCompleted(true);
        setConfirmOpen(false);
        setError('成员已在服务端移除，本地成员列表尚未刷新；请返回群设置后下拉刷新。');
        return;
      }
      setMembers(result.members);
      setSelectedUserIDs(new Set());
      setConfirmOpen(false);
      toast.success('成员已移除');
      navigate(settingsURL, { replace: true });
    } catch (cause) {
      toast.error(readGroupRemoveError(cause));
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (restoring || !runtime) return null;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (!conversationID) return <Navigate to="/conversations" replace />;
  if (!loading && !error && (!group || !group.permissions.canRemoveMembers)) {
    return <Navigate to={settingsURL} replace />;
  }

  return (
    <GroupMemberPickerModal
      title={`移除群成员${selectedCount ? `（${selectedCount}）` : ''}`}
      ariaLabel="移除群成员"
      busy={loading || refreshing || submitting}
      closeDisabled={submitting}
      onClose={() => navigate(settingsURL, { replace: true })}
      onTouchStart={pullRefresh.onTouchStart}
      onTouchMove={pullRefresh.onTouchMove}
      onTouchEnd={pullRefresh.onTouchEnd}
      onTouchCancel={pullRefresh.onTouchCancel}
    >
      {loading ? <GroupRemoveMembersState label="正在加载群成员" /> : (
        <>
        <label className="rn-group-remove-search">
          <RNAssetIcon assetURL={searchIconURL} />
          <input type="search" value={keyword} placeholder="搜索" aria-label="搜索群成员" onChange={event => setKeyword(event.target.value)} />
          {keyword ? <button type="button" aria-label="清除搜索" onClick={() => setKeyword('')}><RNAssetIcon assetURL={clearIconURL} /></button> : null}
        </label>
        <div className="rn-group-remove-content">
          <PullRefreshIndicator refreshing={refreshing} armed={pullRefresh.armed} pullDistance={pullRefresh.pullDistance} />
          {error ? <p className="rn-group-remove-error" role="alert">{error}</p> : null}
          <section className="rn-group-remove-grid" aria-label="可移出群成员">
            {candidates.map(candidate => (
              <GroupRemoveMemberTile
                key={candidate.member.userID}
                candidate={candidate}
                selected={selectedUserIDs.has(candidate.member.userID)}
                onToggle={toggleMember}
              />
            ))}
          </section>
          {!error && !candidates.length ? (
            <p className="rn-group-remove-empty">{keyword.trim() ? '未找到相关成员' : '暂无可移出成员'}</p>
          ) : null}
        </div>
        <footer className="rn-group-remove-footer">
          <button type="button" disabled={!selectedCount || submitting || remoteCompleted} onClick={() => setConfirmOpen(true)}>
            {submitting ? '移除中' : '移除成员'}
          </button>
        </footer>
        </>
      )}
      {confirmOpen ? (
        <div className="rn-group-remove-confirm-backdrop" role="presentation" onClick={event => { if (!submitting && event.target === event.currentTarget) setConfirmOpen(false); }}>
          <section className="rn-group-remove-confirm" role="alertdialog" aria-modal="true" aria-label="确认移出群成员">
            <h2>移除群成员</h2>
            <p>确定将选中的 {selectedCount} 位成员移出群聊吗？</p>
            <div><button type="button" disabled={submitting} onClick={() => setConfirmOpen(false)}>取消</button><button className="is-danger" type="button" disabled={submitting} onClick={() => { void confirmRemoval(); }}>{submitting ? '移除中' : '移除'}</button></div>
          </section>
        </div>
      ) : null}
    </GroupMemberPickerModal>
  );
}

/** 将共享异常转换为不含凭据的页面文案。 */
function readGroupRemoveError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '移除成员失败，请稍后重试';
}

/** 群成员移除启动状态参数。 */
interface GroupRemoveMembersStateProps {
  readonly label: string;
}

/** 统一承载移除候选的弹窗内加载状态。 */
function GroupRemoveMembersState({ label }: GroupRemoveMembersStateProps) {
  return <div className="rn-group-remove-state"><strong>{label}</strong></div>;
}

export default GroupRemoveMembersPage;
