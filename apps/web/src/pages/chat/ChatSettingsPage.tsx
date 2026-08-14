import { useEffect, useMemo, useState } from 'react';
import type {
  Conversation,
  WebIMGroupMember,
  WebIMJoinedGroup,
} from '@im28/im-sdk/web';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { useAppToast } from '../../components/interaction/index.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import {
  buildChatSettingsMemberViews,
  buildChatSettingsView,
} from './chat-settings-view.js';
import { shouldShowGroupMemberPresence } from './group-members-view.js';
import { useObservedUserPresence } from './useObservedUserPresence.js';
import { ChatConversationSettingsControls } from './ChatConversationSettingsControls.js';
import { ChatAutoDeleteSettingsRow } from './ChatAutoDeleteSettingsRow.js';
import { ChatClearHistorySheet } from './ChatClearHistorySheet.js';
import { ChatGroupAnnouncementSettingsCard } from './ChatGroupAnnouncementSettingsCard.js';
import { ChatGroupProfileSettingsCard } from './ChatGroupProfileSettingsCard.js';
import {
  ChatClearHistorySettingsCard,
  GroupSettingsCard,
  SingleSettingsCard,
} from './ChatSettingsCards.js';
import {
  GroupLifecycleConfirmModal,
  GroupLifecycleSettingsCard,
  type GroupLifecycleAction,
} from './GroupLifecycleSettings.js';
import {
  clearChatHistory,
  type ChatClearHistoryScope,
} from './chat-clear-history.js';
import './chat-settings-page.css';

/** RN 单聊/群聊设置首卡只消费现有 Web facade 与 React Router owner。 */
export function ChatSettingsPage() {
  // conversationID 由稳定 SPA path 提供并自动解码。
  const { conversationID = '' } = useParams();
  // navigate 只处理 shared clear 成功后的 SPA route 后果。
  const navigate = useNavigate();
  // searchParams 只承载转让完成后的退群确认意图，不携带群或成员业务身份。
  const [searchParams, setSearchParams] = useSearchParams();
  // runtime context 提供认证状态和唯一聚合 sync facade。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // sync 生命周期跟随认证 runtime，页面不创建 Gateway 或 Repository。
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  // toast 统一承载聊天设置 mutation 的成功与失败反馈。
  const { toast } = useAppToast();
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
  const onlineByID = useObservedUserPresence({
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
      toast.success('聊天记录已清空');
    } catch (cause) {
      toast.error(readChatSettingsError(cause));
    } finally {
      setClearing(false);
    }
  }

  /** 确认后只调用 shared lifecycle facade，远端成功后不得在页面重放。 */
  async function confirmGroupLifecycle(): Promise<void> {
    if (!sync || !conversation || !lifecycleAction || lifecycleSubmitting || lifecycleBlocked) return;
    setLifecycleSubmitting(true);
    setError(null);
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
      toast.success(lifecycleAction === 'leave' ? '已退出群聊' : '群聊已解散');
      navigate('/conversations', { replace: true });
    } catch (cause) {
      toast.error(readChatSettingsError(cause));
    } finally {
      setLifecycleSubmitting(false);
    }
  }

  // view 仅在真实会话存在时生成，避免用路由 ID 伪造主体。
  const view = conversation ? buildChatSettingsView(conversation, group) : null;

  useEffect(() => {
    if (searchParams.get('lifecycle') !== 'leave' || !view?.canQuitGroup) return;
    // 转让成功后的当前账号已是普通成员，仍需用户显式确认才调用退群 mutation。
    setLifecycleAction('leave');
    setSearchParams(current => {
      // nextSearchParams 仅消费一次生命周期意图，保留未来可能存在的其他页面参数。
      const nextSearchParams = new URLSearchParams(current);
      nextSearchParams.delete('lifecycle');
      return nextSearchParams;
    }, { replace: true });
  }, [searchParams, setSearchParams, view?.canQuitGroup]);

  if (restoring) return <ChatSettingsPageState label="正在恢复聊天设置" />;
  if (!runtime) return <ChatSettingsPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  // chatURL 是设置页固定的 RN 返回目标。
  const chatURL = `/conversations/${encodeURIComponent(conversationID)}`;

  return (
    <main className="rn-chat-settings-page">
      <section className="rn-chat-settings-surface" aria-busy={loading}>
        <PageNavbar className="rn-chat-settings-header">
          <Link to={chatURL} aria-label="返回聊天">
            <RNAssetIcon assetURL={backIconURL} />
          </Link>
          <h1>{view?.pageTitle ?? '聊天设置'}</h1>
          <span />
        </PageNavbar>
        <div className="rn-chat-settings-content">
          {error ? <p className="rn-chat-settings-error" role="status">{error}</p> : null}
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
                    toast.error(readChatSettingsError(cause));
                  }}
                  onNotice={message => {
                    setError(null);
                    toast.success(message);
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
              {view.canShowAutoDeleteInChatSettings ? (
                <ChatAutoDeleteSettingsRow
                  conversationID={view.conversationID}
                  placement="chat-settings"
                  autoDeleteSeconds={conversation?.autoDeleteSeconds}
                />
              ) : null}
              {view.canShowAnnouncement || view.canOpenGroupManage ? (
                <ChatGroupAnnouncementSettingsCard
                  view={view}
                  showAnnouncement={view.canShowAnnouncement}
                  showManage={view.canOpenGroupManage}
                />
              ) : null}
              <ChatClearHistorySettingsCard
                clearing={clearing}
                onOpen={() => setClearSheetOpen(true)}
              />
              {view.canStartOwnerLeaveFlow ? (
                <GroupLifecycleSettingsCard
                  action="leave"
                  submitting={lifecycleSubmitting || lifecycleBlocked}
                  onOpen={() => navigate(
                    `/conversations/${encodeURIComponent(view.conversationID)}/settings/manage/owner-transfer?intent=leave`,
                  )}
                />
              ) : view.canQuitGroup ? (
                <GroupLifecycleSettingsCard
                  action="leave"
                  submitting={lifecycleSubmitting || lifecycleBlocked}
                  onOpen={setLifecycleAction}
                />
              ) : null}
              {view.canDismissGroup ? (
                <GroupLifecycleSettingsCard
                  action="dismiss"
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

/** 聊天设置异常统一映射为可见中文文案。 */
function readChatSettingsError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '聊天设置加载失败';
}

/** 认证恢复和配置失败使用稳定页面状态，避免空白 route。 */
function ChatSettingsPageState({ label, detail = '' }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-chat-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

export default ChatSettingsPage;
