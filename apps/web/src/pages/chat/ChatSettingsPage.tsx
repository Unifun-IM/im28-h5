import { useEffect, useMemo, useState } from 'react';
import type {
  CSSProperties,
} from 'react';
import type {
  Conversation,
  WebIMGroupMember,
  WebIMJoinedGroup,
} from '@im28/im-sdk/web';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import arrowIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import minusIconURL from '../../assets/rn/assets/icons/imm28/minus-circle.regular.svg';
import plusIconURL from '../../assets/rn/assets/icons/imm28/plus-circle.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import {
  buildChatSettingsMemberViews,
  buildChatSettingsView,
} from './chat-settings-view.js';
import { shouldShowGroupMemberPresence } from './group-members-view.js';
import { useGroupMemberPresence } from './useGroupMemberPresence.js';
import { ChatConversationSettingsControls } from './ChatConversationSettingsControls.js';
import { ChatClearHistorySheet } from './ChatClearHistorySheet.js';
import { ChatGroupAnnouncementSettingsCard } from './ChatGroupAnnouncementSettingsCard.js';
import { ChatGroupProfileSettingsCard } from './ChatGroupProfileSettingsCard.js';
import {
  GroupLifecycleConfirmModal,
  GroupLifecycleSettingsCard,
  type GroupLifecycleAction,
} from './GroupLifecycleSettings.js';
import {
  clearChatHistory,
  type ChatClearHistoryScope,
} from './chat-clear-history.js';
import { formatChatAutoDeleteValue } from './chat-auto-delete-view.js';
import type {
  ChatSettingsMemberView,
  ChatSettingsView,
} from './chat-settings-view.js';
import './chat-settings-page.css';

/** RN 单聊/群聊设置首卡只消费现有 Web facade 与 React Router owner。 */
export function ChatSettingsPage() {
  // conversationID 由稳定 SPA path 提供并自动解码。
  const { conversationID = '' } = useParams();
  // navigate 只处理 shared clear 成功后的 SPA route 后果。
  const navigate = useNavigate();
  // runtime context 提供认证状态和唯一聚合 sync facade。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // sync 生命周期跟随认证 runtime，页面不创建 Gateway 或 Repository。
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  // conversation 保存当前账号缓存中已确认的目标会话。
  const [conversation, setConversation] = useState<Conversation | null>(null);
  // group 保存匹配当前群目标的 shared joined-group 快照。
  const [group, setGroup] = useState<WebIMJoinedGroup | null>(null);
  // members 保存 shared group-member facade 返回的稳定顺序。
  const [members, setMembers] = useState<readonly WebIMGroupMember[]>([]);
  // loading 覆盖首次 cache 读取和必要的远端刷新。
  const [loading, setLoading] = useState(true);
  // error 保留真实读取失败，不用空设置页伪装成功。
  const [error, setError] = useState<string | null>(null);
  // notice 展示 shared clear 成功后的群聊页面反馈。
  const [notice, setNotice] = useState<string | null>(null);
  // clearSheetOpen 控制显式 destructive confirmation。
  const [clearSheetOpen, setClearSheetOpen] = useState(false);
  // clearing 阻止确认层重复提交真实 mutation。
  const [clearing, setClearing] = useState(false);
  // lifecycleAction 控制退群或解散的显式二次确认。
  const [lifecycleAction, setLifecycleAction] = useState<GroupLifecycleAction | null>(null);
  // lifecycleSubmitting 阻止破坏性操作重复提交。
  const [lifecycleSubmitting, setLifecycleSubmitting] = useState(false);
  // lifecycleBlocked 在远端已成功但本地未收敛时阻止当前页面重放动作。
  const [lifecycleBlocked, setLifecycleBlocked] = useState(false);
  // memberViews 只投影 shared facade 的设置页预览成员。
  const memberViews = useMemo(() => buildChatSettingsMemberViews(members), [members]);
  // memberUserIDs 只观察设置页实际渲染的首屏成员，和 RN 预览范围一致。
  const memberUserIDs = useMemo(() => memberViews.map(member => member.userID), [memberViews]);
  // showOnlineStatus 只接受 shared mode=normal 判定，large/unknown fail-closed。
  const showOnlineStatus = shouldShowGroupMemberPresence(group);
  // onlineByID 复用群成员页相同的 shared presence observation。
  const onlineByID = useGroupMemberPresence({
    runtime,
    accountUserID: snapshot.userID,
    userIDs: memberUserIDs,
    visible: showOnlineStatus,
  });

  useEffect(() => {
    if (!sync || !snapshot.userID || !conversationID) return;
    // active 阻止离开 route 后的异步结果回写。
    let active = true;
    setLoading(true);
    setError(null);
    setNotice(null);
    setClearSheetOpen(false);
    setLifecycleAction(null);
    setLifecycleSubmitting(false);
    setLifecycleBlocked(false);
    setConversation(null);
    setGroup(null);
    setMembers([]);
    void (async () => {
      try {
        // conversations 先读当前账号 SQLite，缺失时才执行 canonical full sync。
        let conversations = await sync.conversations.listCached({ limit: 500 });
        // target 必须属于当前账号的真实会话缓存。
        let target = conversations.find(item => item.conversationID === conversationID);
        if (!target) {
          conversations = await sync.conversations.sync({ pageSize: 100 });
          target = conversations.find(item => item.conversationID === conversationID);
        }
        if (!target) throw new Error('会话不存在或尚未同步');
        if (active) setConversation(target);
        if (target.type !== 'group') return;
        // groupID 只来自共享 Conversation targetID。
        const groupID = target.targetID.trim();
        if (!groupID) throw new Error('群聊身份不可用');
        // cachedGroups 和 cachedMembers 让页面先恢复本地资料。
        const [cachedGroups, cachedMembers] = await Promise.all([
          sync.groups.listCached(),
          sync.groupMembers.listCached(groupID),
        ]);
        if (active) {
          setGroup(cachedGroups.find(item => item.groupID === groupID) ?? null);
          setMembers(cachedMembers);
        }
        // refreshedGroups 通过唯一 group facade 刷新群事实。
        const refreshedGroups = await sync.groups.sync({ pageSize: 100 });
        // refreshedMembers 在群 cache 完成后读取同一群成员主链。
        const refreshedMembers = await sync.groupMembers.sync(groupID, { pageSize: 100 });
        if (active) {
          setGroup(refreshedGroups.find(item => item.groupID === groupID) ?? null);
          setMembers(refreshedMembers);
        }
      } catch (cause) {
        if (active) setError(readChatSettingsError(cause));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [conversationID, snapshot.userID, sync]);

  /** 确认后只调用 shared conversation clear facade。 */
  async function confirmClearHistory(scope: ChatClearHistoryScope): Promise<void> {
    if (!sync || !conversation || clearing) return;
    setClearing(true);
    setError(null);
    setNotice(null);
    try {
      /** next 是 Gateway 成功并完成 SQLite 边界事务后的 canonical 快照。 */
      const next = await clearChatHistory(
        sync.conversations,
        conversation.conversationID,
        scope,
      );
      setConversation(next);
      setClearSheetOpen(false);
      if (next.type === 'single' && next.listHidden) {
        navigate('/conversations', { replace: true });
        return;
      }
      setNotice('聊天记录已清空');
    } catch (cause) {
      setError(readChatSettingsError(cause));
    } finally {
      setClearing(false);
    }
  }

  /** 确认后只调用 shared lifecycle facade，远端成功后不得在页面重放。 */
  async function confirmGroupLifecycle(): Promise<void> {
    if (!sync || !conversation || !lifecycleAction || lifecycleSubmitting || lifecycleBlocked) return;
    setLifecycleSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      /** result 区分本地已收敛和远端已成功但本地待同步。 */
      const result = lifecycleAction === 'leave'
        ? await sync.groupLifecycle.leave({ groupID: conversation.targetID })
        : await sync.groupLifecycle.dismiss({ groupID: conversation.targetID });
      setLifecycleAction(null);
      if (result.cacheState === 'remote-only') {
        setLifecycleBlocked(true);
        setError('群操作已在服务端完成，本地缓存同步失败；为避免重复操作，请返回会话列表刷新');
        return;
      }
      navigate('/conversations', { replace: true });
    } catch (cause) {
      setError(readChatSettingsError(cause));
    } finally {
      setLifecycleSubmitting(false);
    }
  }

  if (restoring) return <ChatSettingsPageState label="正在恢复聊天设置" />;
  if (!runtime) return <ChatSettingsPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  // chatURL 是设置页固定的 RN 返回目标。
  const chatURL = `/conversations/${encodeURIComponent(conversationID)}`;
  // view 仅在真实会话存在时生成，避免用路由 ID 伪造主体。
  const view = conversation ? buildChatSettingsView(conversation, group) : null;

  return (
    <main className="rn-chat-settings-page">
      <section className="rn-chat-settings-surface" aria-busy={loading}>
        <header className="rn-chat-settings-header">
          <Link to={chatURL} aria-label="返回聊天">
            <RNAssetIcon assetURL={backIconURL} />
          </Link>
          <h1>{view?.pageTitle ?? '聊天设置'}</h1>
          <span />
        </header>
        <div className="rn-chat-settings-content">
          {error ? <p className="rn-chat-settings-error" role="status">{error}</p> : null}
          {notice ? <p className="rn-chat-settings-notice" role="status">{notice}</p> : null}
          {view ? (
            <>
              {view.isGroup ? (
                <GroupSettingsCard
                  view={view}
                  members={memberViews}
                  onlineByID={onlineByID}
                  showOnlineStatus={showOnlineStatus}
                />
              ) : (
                <SingleSettingsCard view={view} />
              )}
              {view.isGroup && sync ? (
                <ChatGroupProfileSettingsCard
                  view={view}
                  currentUserID={snapshot.userID}
                  members={members}
                  sync={sync.groupMembers}
                  onUpdated={updated => setMembers(current => current.map(member =>
                    member.userID === updated.userID ? updated : member))}
                  onError={cause => {
                    setNotice(null);
                    setError(readChatSettingsError(cause));
                  }}
                  onNotice={message => {
                    setError(null);
                    setNotice(message);
                  }}
                />
              ) : null}
              {sync ? (
                <ChatConversationSettingsControls
                  conversationID={view.conversationID}
                  sync={sync.conversations}
                  initialMuted={conversation?.isMuted ?? false}
                  initialPinned={conversation?.isPinned ?? false}
                />
              ) : null}
              {view.canManageAutoDelete ? (
                <ChatAutoDeleteSettingsRow
                  conversationID={view.conversationID}
                  isGroup={view.isGroup}
                  autoDeleteSeconds={conversation?.autoDeleteSeconds}
                />
              ) : null}
              {view.canShowAnnouncement ? (
                <ChatGroupAnnouncementSettingsCard view={view} />
              ) : null}
              {view.canOpenGroupManage ? (
                <ChatGroupManageSettingsRow conversationID={view.conversationID} />
              ) : null}
              <ChatClearHistorySettingsCard
                clearing={clearing}
                onOpen={() => setClearSheetOpen(true)}
              />
              {view.canQuitGroup || view.canDismissGroup ? (
                <GroupLifecycleSettingsCard
                  action={view.canDismissGroup ? 'dismiss' : 'leave'}
                  submitting={lifecycleSubmitting || lifecycleBlocked}
                  onOpen={setLifecycleAction}
                />
              ) : null}
            </>
          ) : loading ? (
            <p className="rn-chat-settings-state">正在加载聊天设置</p>
          ) : null}
        </div>
      </section>
      {clearSheetOpen && conversation ? (
        <ChatClearHistorySheet
          conversation={conversation}
          canClearForAll={view?.canClearForAll ?? false}
          clearing={clearing}
          onCancel={() => setClearSheetOpen(false)}
          onConfirm={scope => { void confirmClearHistory(scope); }}
        />
      ) : null}
      <GroupLifecycleConfirmModal
        action={lifecycleAction}
        groupName={view?.title ?? ''}
        submitting={lifecycleSubmitting}
        onCancel={() => { if (!lifecycleSubmitting) setLifecycleAction(null); }}
        onConfirm={() => { void confirmGroupLifecycle(); }}
      />
    </main>
  );
}

/** 群管理入口只在 shared capability 允许时进入 SPA 子路由。 */
function ChatGroupManageSettingsRow({ conversationID }: { readonly conversationID: string }) {
  /** manageURL 指向当前真实群会话的唯一管理路由。 */
  const manageURL = `/conversations/${encodeURIComponent(conversationID)}/settings/manage`;
  return (
    <div className="rn-chat-settings-card">
      <Link className="rn-chat-settings-row" to={manageURL}>
        <span>群管理</span>
        <RNAssetIcon assetURL={arrowIconURL} />
      </Link>
    </div>
  );
}

/** 清空聊天记录入口保持 RN 设置卡片布局并要求二次确认。 */
function ChatClearHistorySettingsCard({
  clearing,
  onOpen,
}: {
  readonly clearing: boolean;
  readonly onOpen: () => void;
}) {
  return (
    <div className="rn-chat-settings-card">
      <button
        className="rn-chat-settings-row rn-chat-settings-clear-row"
        type="button"
        disabled={clearing}
        onClick={onOpen}
      >
        <span>清空聊天记录</span>
        {clearing ? <span className="rn-chat-settings-row-trailing">清空中</span> : null}
      </button>
    </div>
  );
}

/** 自动删除入口只在权限投影允许时进入独立 React Router 页面。 */
function ChatAutoDeleteSettingsRow({
  conversationID,
  isGroup,
  autoDeleteSeconds,
}: {
  readonly conversationID: string;
  readonly isGroup: boolean;
  readonly autoDeleteSeconds: number | undefined;
}) {
  /** autoDeleteURL 指向当前会话唯一设置子路由。 */
  const autoDeleteURL =
    '/conversations/' + encodeURIComponent(conversationID) + '/settings/auto-delete';
  return (
    <div className="rn-chat-settings-card">
      <Link className="rn-chat-settings-row" to={autoDeleteURL}>
        <span>{isGroup ? '定时删除消息' : '定时删除'}</span>
        <span className="rn-chat-settings-row-trailing">
          <span>{formatChatAutoDeleteValue(autoDeleteSeconds)}</span>
          <RNAssetIcon assetURL={arrowIconURL} />
        </span>
      </Link>
    </div>
  );
}

/** 单聊设置首卡复用真实对方资料 route 和搜索 owner。 */
function SingleSettingsCard({ view }: { readonly view: ChatSettingsView }) {
  // profileURL 只携带稳定用户 ID，不在设置页读取资料。
  const profileURL = `/contacts/users/${encodeURIComponent(view.targetID)}`;
  return (
    <div className="rn-chat-settings-card">
      <div className="rn-chat-settings-single-member">
        <Link to={profileURL} aria-label={`查看${view.title}的资料`}>
          <SettingsAvatar identity={view.targetID} name={view.title} avatarURL={view.avatarURL} size={40} />
        </Link>
      </div>
      <ChatSearchSettingsRow view={view} />
    </div>
  );
}

/** 群设置首卡展示真实群快照和现有成员 facade 的首屏结果。 */
function GroupSettingsCard({
  view,
  members,
  onlineByID,
  showOnlineStatus,
}: {
  readonly view: ChatSettingsView;
  readonly members: readonly ChatSettingsMemberView[];
  readonly onlineByID: Readonly<Record<string, boolean>>;
  readonly showOnlineStatus: boolean;
}) {
  // visibleMemberCount 优先使用群事实，并在冷 cache 时回退已读成员数。
  const visibleMemberCount = view.memberCount || members.length;
  // membersURL 由当前真实会话 ID 构造独立 React Router 子页。
  const membersURL = `/conversations/${encodeURIComponent(view.conversationID)}/settings/members`;
  // inviteMembersURL 只在 shared capability 允许时公开好友选择入口。
  const inviteMembersURL = `/conversations/${encodeURIComponent(view.conversationID)}/settings/members/invite`;
  // removeMembersURL 只在 shared capability 允许时公开选择入口。
  const removeMembersURL = `/conversations/${encodeURIComponent(view.conversationID)}/settings/members/remove`;
  // profileURL 让群资料首行进入可刷新 React Router 子页。
  const profileURL = `/conversations/${encodeURIComponent(view.conversationID)}/settings/profile`;
  return (
    <div className="rn-chat-settings-card">
      <Link className="rn-chat-settings-group-info" to={profileURL} aria-label="编辑群资料">
        <SettingsAvatar identity={view.targetID} name={view.title} avatarURL={view.avatarURL} size={56} />
        <span>
          <strong>{view.title}</strong>
          <small>群ID：{view.targetID}</small>
        </span>
        <RNAssetIcon assetURL={arrowIconURL} />
      </Link>
      <div className="rn-chat-settings-members">
        <Link className="rn-chat-settings-members-header" to={membersURL} aria-label="查看全部群成员">
          <h2>群成员（{visibleMemberCount}）</h2>
          <span>
            <span>全部</span>
            <RNAssetIcon assetURL={arrowIconURL} />
          </span>
        </Link>
        <div className="rn-chat-settings-member-grid">
          {members.map(member => (
            <Link
              key={member.userID}
              to={`/contacts/users/${encodeURIComponent(member.userID)}`}
              state={{
                backHref: `/conversations/${encodeURIComponent(view.conversationID)}/settings`,
                groupConversationID: view.conversationID,
              }}
              aria-label={`查看${member.name}的资料`}
            >
              <SettingsMemberAvatar
                member={member}
                online={Boolean(onlineByID[member.userID])}
                showOnlineStatus={showOnlineStatus}
              />
              <span>{member.name}</span>
            </Link>
          ))}
          {view.canInviteMembers ? (
            <Link className="rn-chat-settings-member-action" to={inviteMembersURL} aria-label="邀请群成员">
              <span className="rn-chat-settings-member-action-icon"><RNAssetIcon assetURL={plusIconURL} /></span>
              <span>邀请</span>
            </Link>
          ) : null}
          {view.canRemoveMembers ? (
            <Link className="rn-chat-settings-member-action" to={removeMembersURL} aria-label="移出群成员">
              <span className="rn-chat-settings-member-action-icon"><RNAssetIcon assetURL={minusIconURL} /></span>
              <span>移除</span>
            </Link>
          ) : null}
        </div>
      </div>
      <ChatSearchSettingsRow view={view} />
    </div>
  );
}

/** 群设置预览头像在圆形裁剪层外投影 RN 在线状态点。 */
function SettingsMemberAvatar({
  member,
  online,
  showOnlineStatus,
}: {
  readonly member: ChatSettingsMemberView;
  readonly online: boolean;
  readonly showOnlineStatus: boolean;
}) {
  return (
    <span className="rn-chat-settings-member-avatar">
      <SettingsAvatar
        identity={member.userID}
        name={member.name}
        avatarURL={member.avatarURL}
        size={40}
      />
      {showOnlineStatus && online ? (
        <span className="rn-chat-settings-member-online-border" aria-label="在线">
          <span />
        </span>
      ) : null}
    </span>
  );
}

/** 设置页的唯一聊天搜索入口继续进入既有分类搜索 route。 */
function ChatSearchSettingsRow({ view }: { readonly view: ChatSettingsView }) {
  // searchURL 复用 `.18.1/.18.2.2` 已验收的搜索 owner。
  const searchURL = `/conversations/${encodeURIComponent(view.conversationID)}/search`;
  return (
    <Link className="rn-chat-settings-row" to={searchURL}>
      <span>{view.searchLabel}</span>
      <RNAssetIcon assetURL={arrowIconURL} />
    </Link>
  );
}

/** 设置页头像保持 RN 稳定 fallback 渐变和远端图片失败降级。 */
function SettingsAvatar({
  identity,
  name,
  avatarURL,
  size,
}: {
  readonly identity: string;
  readonly name: string;
  readonly avatarURL: string;
  readonly size: 40 | 56;
}) {
  // avatarStyle 固定宽高并使用 RN FNV-1a 渐变。
  const avatarStyle = {
    '--chat-settings-avatar-gradient': getRNAvatarGradient(identity),
    '--chat-settings-avatar-size': `${size}px`,
  } as CSSProperties;
  return (
    <span className="rn-chat-settings-avatar" style={avatarStyle}>
      <span>{getRNAvatarInitial(name, '?')}</span>
      {avatarURL ? <img src={avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}
    </span>
  );
}

/** 聊天设置异常统一映射为可见中文文案。 */
function readChatSettingsError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '聊天设置加载失败';
}

/** 认证恢复和配置失败使用稳定页面状态，避免空白 route。 */
function ChatSettingsPageState({ label, detail = '' }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-chat-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

export default ChatSettingsPage;
