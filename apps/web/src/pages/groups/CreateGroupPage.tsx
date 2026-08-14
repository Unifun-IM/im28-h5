import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  formatIMUserDisplayName,
  IM_GROUP_CREATION_MAX_MEMBER_COUNT,
  type GatewayUser,
  type WebIMContact,
} from '@im28/im-sdk/web';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { PullRefreshIndicator, useAppToast } from '../../components/interaction/index.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { usePullRefresh } from '../../hooks/use-pull-refresh.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { GroupInviteMemberTile } from '../chat/GroupInviteMemberTile.js';
import {
  buildCreateGroupMemberUserIDs,
  buildCreateGroupCandidates,
  buildSelectedCreateGroupCandidates,
  canSubmitCreateGroup,
  isGroupCreationRemoteCompletedError,
  resolveSingleChatCreateGroupPeer,
} from './create-group-view.js';
import { CreateGroupSelectedFriends } from './CreateGroupSelectedFriends.js';
import { readGroupSearchCreateState } from './group-search-route.js';
import '../chat/group-remove-members-page.css';
import './create-group-page.css';

/** 建群页可从普通入口或单聊设置的固定对端入口进入。 */
interface CreateGroupPageProps {
  readonly fromSingleSettings?: boolean;
}

/** RN 发起群聊页只编排好友选择与 shared groups.create facade。 */
export function CreateGroupPage({ fromSingleSettings = false }: CreateGroupPageProps) {
  /** navigate 只使用服务端返回的真实会话 ID。 */
  const navigate = useNavigate();
  /** location 只读取主 tab 入口，不接受任意外部返回地址。 */
  const location = useLocation();
  /** conversationID 仅在单聊设置模式下用于从当前账号缓存解析固定对端。 */
  const { conversationID = '' } = useParams();
  /** runtime 提供当前账号和唯一 SDK 聚合 facade。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** sync 只在 runtime 完成配置后存在。 */
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  /** toast 统一承载建群 mutation 的成功与失败反馈。 */
  const { toast } = useAppToast();
  /** contacts 保存 cache-first 好友快照。 */
  const [contacts, setContacts] = useState<readonly WebIMContact[]>([]);
  /** profile 只为 RN 默认群名提供当前昵称。 */
  const [profile, setProfile] = useState<GatewayUser | null>(null);
  /** fixedPeerUserID 是单聊设置入口必须包含且不在候选网格展示的真实对端。 */
  const [fixedPeerUserID, setFixedPeerUserID] = useState('');
  /** keyword 仅用于单聊设置选择层的本地好友过滤。 */
  const [keyword, setKeyword] = useState('');
  /** selectedUserIDs 只保存稳定好友身份。 */
  const [selectedUserIDs, setSelectedUserIDs] = useState<ReadonlySet<string>>(
    () => new Set(
      fromSingleSettings
        ? []
        : readGroupSearchCreateState(location.state).selectedUserIDs,
    ),
  );
  /** loading 表示首次 cache-first 恢复。 */
  const [loading, setLoading] = useState(true);
  /** refreshing 区分用户下拉和首次 cache-first 恢复。 */
  const [refreshing, setRefreshing] = useState(false);
  /** submitting 阻止重复创建群。 */
  const [submitting, setSubmitting] = useState(false);
  /** remoteCompleted 锁定远端成功但本地失败后的重复提交。 */
  const [remoteCompleted, setRemoteCompleted] = useState(false);
  /** error 呈现真实 SDK、Gateway 或缓存失败。 */
  const [error, setError] = useState<string | null>(null);
  /** selectedReviewOpen 控制普通建群的已选好友全局复核层。 */
  const [selectedReviewOpen, setSelectedReviewOpen] = useState(false);

  /** 先读好友缓存，再刷新 Gateway 好友和当前资料。 */
  const load = useCallback(async (): Promise<void> => {
    if (!sync || !snapshot.userID) return;
    setLoading(true);
    setError(null);
    if (fromSingleSettings) {
      setFixedPeerUserID('');
      setSelectedUserIDs(new Set());
      setKeyword('');
    }
    try {
      try {
        setContacts(await sync.contacts.listCached());
      } catch {
        // 缓存不可用仍允许 canonical 远端好友读取完成首屏。
      }
      /** refreshedContacts 和 currentProfile 均来自公开 Web facade。 */
      const [refreshedContacts, currentProfile] = await Promise.all([
        sync.contacts.list({ pageSize: 100 }),
        sync.profile.getCurrent(),
      ]);
      setContacts(refreshedContacts);
      setProfile(currentProfile);
      if (fromSingleSettings) {
        /** conversations 先读当前账号缓存，缺失时才执行 canonical full sync。 */
        let conversations = await sync.conversations.listCached({ limit: 500 });
        /** peerUserID 拒绝群聊、本人、失效或任意外部 route 身份。 */
        let peerUserID = resolveSingleChatCreateGroupPeer(
          conversations,
          conversationID,
          snapshot.userID,
        );
        if (!peerUserID) {
          conversations = await sync.conversations.sync({ pageSize: 100 });
          peerUserID = resolveSingleChatCreateGroupPeer(
            conversations,
            conversationID,
            snapshot.userID,
          );
        }
        if (!peerUserID) throw new Error('单聊会话不存在或对端身份不可用');
        setFixedPeerUserID(peerUserID);
      }
    } catch (cause) {
      setError(readCreateGroupError(cause, '加载好友失败，请稍后重试'));
    } finally {
      setLoading(false);
    }
  }, [conversationID, fromSingleSettings, snapshot.userID, sync]);

  useEffect(() => { void load(); }, [load]);

  /** refreshContacts 只刷新 shared 好友 facade，失败时保留页面旧快照。 */
  const refreshContacts = useCallback(async (): Promise<void> => {
    if (!sync || !snapshot.userID || refreshing || fromSingleSettings) return;
    setRefreshing(true);
    setError(null);
    try {
      setContacts(await sync.contacts.list({ pageSize: 100 }));
    } catch (cause) {
      setError(readCreateGroupError(cause, '加载好友失败，请稍后重试'));
    } finally {
      setRefreshing(false);
    }
  }, [fromSingleSettings, refreshing, snapshot.userID, sync]);

  /** pullRefresh 把普通建群顶部单指下拉翻译为唯一好友刷新调用。 */
  const pullRefresh = usePullRefresh({
    refreshing: refreshing || fromSingleSettings,
    onRefresh: refreshContacts,
  });

  /** candidates 展示完整好友网格，查找群聊使用独立 RN 路由。 */
  const candidates = useMemo(
    () => fromSingleSettings && !fixedPeerUserID
      ? []
      : buildCreateGroupCandidates(
          contacts,
          fromSingleSettings ? keyword : '',
          fixedPeerUserID ? new Set([fixedPeerUserID]) : new Set(),
        ),
    [contacts, fixedPeerUserID, fromSingleSettings, keyword],
  );
  /** selectedCount 直接投影稳定身份集合。 */
  const selectedCount = selectedUserIDs.size;
  /** selectedCandidates 只展示刷新后仍是当前账号好友的已选项。 */
  const selectedCandidates = useMemo(
    () => buildSelectedCreateGroupCandidates(candidates, selectedUserIDs),
    [candidates, selectedUserIDs],
  );
  /** fixedUserIDs 在单聊模式下只包含已验证的当前对端。 */
  const fixedUserIDs = fixedPeerUserID ? [fixedPeerUserID] : [];
  /** canSubmit 把单聊固定对端计入 SDK 的 2–998 人规则。 */
  const canSubmit = canSubmitCreateGroup(selectedUserIDs, fixedUserIDs);
  /** allSelected 对齐 RN 全部好友 tile 的取消选择语义。 */
  const allSelected = candidates.length > 0 && (
    fromSingleSettings
      ? candidates.every(candidate => selectedUserIDs.has(candidate.contact.userID))
      : selectedCount === candidates.length
  );
  /** backHref 只允许两个 RN 主入口，刷新深链默认返回会话。 */
  const backHref = fromSingleSettings
    ? `/conversations/${encodeURIComponent(conversationID)}/settings`
    : readCreateGroupBackHref(location.state);

  useEffect(() => {
    if (selectedReviewOpen && selectedCandidates.length === 0) {
      setSelectedReviewOpen(false);
    }
  }, [selectedCandidates.length, selectedReviewOpen]);

  /** toggleMember 切换单个好友并维持不可变集合。 */
  function toggleMember(userID: string): void {
    setError(null);
    setSelectedUserIDs(current => {
      if (
        !current.has(userID) &&
        current.size + fixedUserIDs.length >= IM_GROUP_CREATION_MAX_MEMBER_COUNT
      ) {
        setError('群成员人数已达上限，请联系客服开启更大群聊。');
        return current;
      }
      /** next 创建新集合保证 React 可观察。 */
      const next = new Set(current);
      if (next.has(userID)) next.delete(userID);
      else next.add(userID);
      return next;
    });
  }

  /** toggleAllMembers 对齐 RN 全选、取消全选和 998 上限保护。 */
  function toggleAllMembers(): void {
    setError(null);
    if (candidates.length + fixedUserIDs.length > IM_GROUP_CREATION_MAX_MEMBER_COUNT) {
      setError('群成员人数已达上限，请联系客服开启更大群聊。');
      return;
    }
    /** visibleUserIDs 只覆盖当前筛选结果，隐藏选择保持不变。 */
    const visibleUserIDs = candidates.map(candidate => candidate.contact.userID);
    if (!fromSingleSettings) {
      setSelectedUserIDs(allSelected ? new Set() : new Set(visibleUserIDs));
      return;
    }
    setSelectedUserIDs(current => {
      /** next 让全选/取消全选只作用于当前可见候选。 */
      const next = new Set(current);
      for (const userID of visibleUserIDs) {
        if (allSelected) next.delete(userID);
        else next.add(userID);
      }
      return next;
    });
  }

  /** submitCreation 只调用 shared create owner 并处理明确缓存状态。 */
  async function submitCreation(): Promise<void> {
    if (!sync || !canSubmit || submitting || remoteCompleted) return;
    setSubmitting(true);
    setError(null);
    try {
      /** result 保留远端和本地事务的真实完成状态。 */
      const result = await sync.groups.create({
        memberUserIDs: buildCreateGroupMemberUserIDs(selectedUserIDs, fixedUserIDs),
        ownerDisplayName: profile?.nickname?.trim() ||
          formatIMUserDisplayName(snapshot.userID),
      });
      if (result.cacheState === 'remote-only') {
        setRemoteCompleted(true);
        setError('群聊已在服务端创建，本地会话尚未保存；请返回会话列表并下拉刷新。');
        return;
      }
      toast.success('群聊创建成功');
      navigate(`/conversations/${encodeURIComponent(result.conversation.conversationID)}`, {
        replace: true,
      });
    } catch (cause) {
      if (isGroupCreationRemoteCompletedError(cause)) {
        setRemoteCompleted(true);
        setError('服务端已处理创建，但未返回完整会话信息；请返回会话列表并下拉刷新。');
        return;
      }
      toast.error(readCreateGroupError(cause, '创建群聊失败，请稍后重试'));
    } finally {
      setSubmitting(false);
    }
  }

  if (restoring) return <CreateGroupState label="正在恢复会话" />;
  if (!runtime) return <CreateGroupState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main
      className="rn-create-group-page"
      aria-busy={loading || refreshing || submitting}
      onTouchStart={pullRefresh.onTouchStart}
      onTouchMove={pullRefresh.onTouchMove}
      onTouchEnd={pullRefresh.onTouchEnd}
      onTouchCancel={pullRefresh.onTouchCancel}
    >
      <section className="rn-create-group-surface">
        <PageNavbar className="rn-create-group-header">
          <Link to={backHref} aria-label="返回"><RNAssetIcon assetURL={backIconURL} /></Link>
          <h1>{fromSingleSettings ? `选择好友${selectedCount ? `（${selectedCount}）` : ''}` : '发起群聊'}</h1>
          <span aria-hidden="true" />
        </PageNavbar>
        {!fromSingleSettings && selectedCandidates.length ? (
          <CreateGroupSelectedFriends
            candidates={selectedCandidates}
            disabled={submitting || remoteCompleted}
            open={selectedReviewOpen}
            onOpenSearch={() => navigate('/groups/search', {
              replace: true,
              state: { selectedUserIDs: [...selectedUserIDs], backHref },
            })}
            onOpenReview={() => setSelectedReviewOpen(true)}
            onClear={() => setSelectedUserIDs(new Set())}
            onCloseReview={() => setSelectedReviewOpen(false)}
            onToggle={toggleMember}
          />
        ) : fromSingleSettings ? (
          <label className="rn-create-group-search">
            <RNAssetIcon assetURL={searchIconURL} />
            <span className="sr-only">搜索好友</span>
            <input type="search" value={keyword} placeholder="搜索" onChange={event => setKeyword(event.target.value)} />
          </label>
        ) : (
          <>
            <Link className="rn-create-group-search" to="/groups/search" replace state={{ selectedUserIDs: [...selectedUserIDs], backHref }}>
              <RNAssetIcon assetURL={searchIconURL} />
              <span>查找群聊</span>
            </Link>
            <Link className="rn-create-group-existing" to="/contacts/groups">
              <span>选择一个已有的群</span><span aria-hidden="true">›</span>
            </Link>
          </>
        )}
        {!fromSingleSettings ? (
          <PullRefreshIndicator
            refreshing={refreshing}
            armed={pullRefresh.armed}
            pullDistance={pullRefresh.pullDistance}
          />
        ) : null}
        <p className="rn-create-group-caption">选择好友创建群聊</p>
        {error ? <p className="rn-create-group-error" role="alert">{error}</p> : null}
        <section className="rn-group-remove-grid" aria-label="可选择好友">
          {candidates.length ? (
            <button
              className="rn-group-remove-tile"
              type="button"
              aria-label="选择全部好友"
              aria-pressed={allSelected}
              onClick={toggleAllMembers}
            >
              <span className={`rn-group-remove-avatar rn-create-group-all-avatar${allSelected ? ' is-selected' : ''}`}>
                <span>ALL</span>
                {allSelected ? <em>✓</em> : null}
              </span>
              <span>全部好友</span>
            </button>
          ) : null}
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
          <p className="rn-create-group-empty">暂无可选择好友</p>
        ) : null}
        <footer className="rn-create-group-footer">
          <span>{canSubmit ? `已选 ${selectedCount + fixedUserIDs.length} 位好友` : fromSingleSettings ? '至少再选择 1 位好友' : '至少选择 2 位好友'}</span>
          <button type="button" disabled={!canSubmit || submitting || remoteCompleted} onClick={() => { void submitCreation(); }}>
            {submitting ? '创建中' : '创建群聊'}
          </button>
        </footer>
      </section>
    </main>
  );
}

/** 将未知创建群异常转换为不含凭据的页面提示。 */
function readCreateGroupError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

/** 只接受首页两个已认证主 tab 作为创建页返回目标。 */
function readCreateGroupBackHref(state: unknown): '/conversations' | '/contacts' {
  if (!state || typeof state !== 'object') return '/conversations';
  /** backHref 来自本应用 HomeActionMenu，不接受外部或任意路由。 */
  const backHref = (state as { readonly backHref?: unknown }).backHref;
  return backHref === '/contacts' ? '/contacts' : '/conversations';
}

/** 创建群启动状态参数。 */
interface CreateGroupStateProps {
  readonly label: string;
  readonly detail?: string | null;
}

/** 统一承载 runtime 恢复和配置失败。 */
function CreateGroupState({ label, detail }: CreateGroupStateProps) {
  return <main className="rn-create-group-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

export default CreateGroupPage;
