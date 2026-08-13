import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  IM_GROUP_CREATION_MAX_MEMBER_COUNT,
  type GatewayUser,
  type WebIMContact,
} from '@im28/im-sdk/web';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { GroupInviteMemberTile } from '../chat/GroupInviteMemberTile.js';
import {
  buildCreateGroupCandidates,
  canSubmitCreateGroup,
  isGroupCreationRemoteCompletedError,
} from './create-group-view.js';
import { readGroupSearchCreateState } from './group-search-route.js';
import '../chat/group-remove-members-page.css';
import './create-group-page.css';

/** RN 发起群聊页只编排好友选择与 shared groups.create facade。 */
export function CreateGroupPage() {
  /** navigate 只使用服务端返回的真实会话 ID。 */
  const navigate = useNavigate();
  /** location 只读取主 tab 入口，不接受任意外部返回地址。 */
  const location = useLocation();
  /** runtime 提供当前账号和唯一 SDK 聚合 facade。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** sync 只在 runtime 完成配置后存在。 */
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  /** contacts 保存 cache-first 好友快照。 */
  const [contacts, setContacts] = useState<readonly WebIMContact[]>([]);
  /** profile 只为 RN 默认群名提供当前昵称。 */
  const [profile, setProfile] = useState<GatewayUser | null>(null);
  /** selectedUserIDs 只保存稳定好友身份。 */
  const [selectedUserIDs, setSelectedUserIDs] = useState<ReadonlySet<string>>(
    () => new Set(readGroupSearchCreateState(location.state).selectedUserIDs),
  );
  /** loading 表示首次 cache-first 恢复。 */
  const [loading, setLoading] = useState(true);
  /** submitting 阻止重复创建群。 */
  const [submitting, setSubmitting] = useState(false);
  /** remoteCompleted 锁定远端成功但本地失败后的重复提交。 */
  const [remoteCompleted, setRemoteCompleted] = useState(false);
  /** error 呈现真实 SDK、Gateway 或缓存失败。 */
  const [error, setError] = useState<string | null>(null);

  /** 先读好友缓存，再刷新 Gateway 好友和当前资料。 */
  const load = useCallback(async (): Promise<void> => {
    if (!sync || !snapshot.userID) return;
    setLoading(true);
    setError(null);
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
    } catch (cause) {
      setError(readCreateGroupError(cause, '加载好友失败，请稍后重试'));
    } finally {
      setLoading(false);
    }
  }, [snapshot.userID, sync]);

  useEffect(() => { void load(); }, [load]);

  /** candidates 展示完整好友网格，查找群聊使用独立 RN 路由。 */
  const candidates = useMemo(
    () => buildCreateGroupCandidates(contacts, ''),
    [contacts],
  );
  /** selectedCount 直接投影稳定身份集合。 */
  const selectedCount = selectedUserIDs.size;
  /** canSubmit 复用 SDK 的 RN 2–998 人规则。 */
  const canSubmit = canSubmitCreateGroup(selectedUserIDs);
  /** allSelected 对齐 RN 全部好友 tile 的取消选择语义。 */
  const allSelected = contacts.length > 0 && selectedCount === contacts.length;
  /** backHref 只允许两个 RN 主入口，刷新深链默认返回会话。 */
  const backHref = readCreateGroupBackHref(location.state);

  /** toggleMember 切换单个好友并维持不可变集合。 */
  function toggleMember(userID: string): void {
    setError(null);
    setSelectedUserIDs(current => {
      if (!current.has(userID) && current.size >= IM_GROUP_CREATION_MAX_MEMBER_COUNT) {
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
    if (allSelected) {
      setSelectedUserIDs(new Set());
      return;
    }
    if (contacts.length > IM_GROUP_CREATION_MAX_MEMBER_COUNT) {
      setError('群成员人数已达上限，请联系客服开启更大群聊。');
      return;
    }
    setSelectedUserIDs(new Set(contacts.map(contact => contact.userID)));
  }

  /** submitCreation 只调用 shared create owner 并处理明确缓存状态。 */
  async function submitCreation(): Promise<void> {
    if (!sync || !canSubmit || submitting || remoteCompleted) return;
    setSubmitting(true);
    setError(null);
    try {
      /** result 保留远端和本地事务的真实完成状态。 */
      const result = await sync.groups.create({
        memberUserIDs: [...selectedUserIDs],
        ownerDisplayName: profile?.nickname?.trim() || snapshot.userID || '',
      });
      if (result.cacheState === 'remote-only') {
        setRemoteCompleted(true);
        setError('群聊已在服务端创建，本地会话尚未保存；请返回会话列表并下拉刷新。');
        return;
      }
      navigate(`/conversations/${encodeURIComponent(result.conversation.conversationID)}`, {
        replace: true,
      });
    } catch (cause) {
      if (isGroupCreationRemoteCompletedError(cause)) {
        setRemoteCompleted(true);
        setError('服务端已处理创建，但未返回完整会话信息；请返回会话列表并下拉刷新。');
        return;
      }
      setError(readCreateGroupError(cause, '创建群聊失败，请稍后重试'));
    } finally {
      setSubmitting(false);
    }
  }

  if (restoring) return <CreateGroupState label="正在恢复会话" />;
  if (!runtime) return <CreateGroupState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main className="rn-create-group-page" aria-busy={loading || submitting}>
      <section className="rn-create-group-surface">
        <header className="rn-create-group-header">
          <Link to={backHref} aria-label="返回"><RNAssetIcon assetURL={backIconURL} /></Link>
          <h1>发起群聊{selectedCount ? `（${selectedCount}）` : ''}</h1>
          <span aria-hidden="true" />
        </header>
        <Link className="rn-create-group-search" to="/groups/search" state={{ selectedUserIDs: [...selectedUserIDs], backHref }}>
          <RNAssetIcon assetURL={searchIconURL} />
          <span>查找群聊</span>
        </Link>
        <Link className="rn-create-group-existing" to="/contacts/groups">
          <span>选择一个已有的群</span><span aria-hidden="true">›</span>
        </Link>
        <p className="rn-create-group-caption">选择好友创建群聊</p>
        {error ? <p className="rn-create-group-error" role="alert">{error}</p> : null}
        <section className="rn-group-remove-grid" aria-label="可选择好友">
          {contacts.length ? (
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
          <span>{selectedCount < 2 ? '至少选择 2 位好友' : `已选 ${selectedCount} 位好友`}</span>
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
