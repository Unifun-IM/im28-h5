import { useEffect, useMemo, useState } from 'react';
import { selectIMEarliestGroupAdmin } from '@im28/im-sdk/web';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { useAppToast } from '../../components/interaction/index.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { useChatShareModal } from '../share/ChatShareModalProvider.js';
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
  GroupOwnerQuitModal,
  GroupLifecycleSettingsCard,
  type GroupLifecycleAction,
} from './GroupLifecycleSettings.js';
import {
  clearChatHistory,
  type ChatClearHistoryScope,
} from './chat-clear-history.js';
import {
  readChatSettingsError,
  useChatSettingsData,
} from './useChatSettingsData.js';
import './chat-settings-page.css';

/** RN 单聊/群聊设置首卡只消费现有 Web facade 与 React Router owner。 */
export function ChatSettingsPage() {
  // conversationID 由稳定 SPA path 提供并自动解码。
  const { conversationID = '' } = useParams();
  // navigate 只处理 shared clear 成功后的 SPA route 后果。
  const navigate = useNavigate();
  // runtime context 提供认证状态和唯一聚合 sync facade。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // toast 统一承载聊天设置 mutation 的成功与失败反馈。
  const { toast } = useAppToast();
  /** shareModal 统一持有群名片目标选择和发送。 */
  const shareModal = useChatShareModal();
  // data 统一恢复当前会话、群资料和成员的 shared cache-first 快照。
  const {
    sync,
    conversation,
    group,
    members,
    loading,
    error,
    replaceConversation,
    replaceMember,
    clearError,
    showError,
  } = useChatSettingsData({
    runtime,
    userID: snapshot.userID,
    conversationID,
  });
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
  // ownerQuitOpen 控制群主退出的 RN 双分支底部动作面板。
  const [ownerQuitOpen, setOwnerQuitOpen] = useState(false);
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
  // ownerQuitAdmin 由 SDK 按 adminSince 选择最早被添加的管理员。
  const ownerQuitAdmin = useMemo(() => selectIMEarliestGroupAdmin(members), [members]);

  useEffect(() => {
    // route 切换时关闭旧会话遗留的破坏性操作状态。
    setClearSheetOpen(false);
    setLifecycleAction(null);
    setLifecycleSubmitting(false);
    setLifecycleBlocked(false);
    setOwnerQuitOpen(false);
  }, [conversationID]);

  /** 确认后只调用 shared conversation clear facade。 */
  async function confirmClearHistory(scope: ChatClearHistoryScope): Promise<void> {
    if (!sync || !conversation || clearing) return;
    setClearing(true);
    clearError();
    try {
      /** next 是 Gateway 成功并完成 SQLite 边界事务后的 canonical 快照。 */
      const next = await clearChatHistory(
        sync.conversations,
        conversation.conversationID,
        scope,
      );
      replaceConversation(next);
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
  async function confirmGroupLifecycle(
    requestedAction: GroupLifecycleAction | null = lifecycleAction,
    clearHistory = false,
  ): Promise<void> {
    if (!sync || !conversation || !requestedAction || lifecycleSubmitting || lifecycleBlocked) return;
    setLifecycleSubmitting(true);
    clearError();
    try {
      /** result 区分本地已收敛和远端已成功但本地待同步。 */
      const result = requestedAction === 'leave'
        ? await sync.groupLifecycle.leave({ groupID: conversation.targetID, clearHistory })
        : await sync.groupLifecycle.dismiss({ groupID: conversation.targetID });
      setLifecycleAction(null);
      setOwnerQuitOpen(false);
      if (result.cacheState === 'remote-only') {
        setLifecycleBlocked(true);
        showError('群操作已在服务端完成，本地缓存同步失败；为避免重复操作，请返回会话列表刷新');
        return;
      }
      toast.success(requestedAction === 'leave' ? '已退出群聊' : '群聊已解散');
      navigate('/conversations', { replace: true });
    } catch (cause) {
      toast.error(readChatSettingsError(cause));
    } finally {
      setLifecycleSubmitting(false);
    }
  }

  // view 仅在真实会话存在时生成，避免用路由 ID 伪造主体。
  const view = conversation ? buildChatSettingsView(conversation, group) : null;

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
                  onUpdated={replaceMember}
                  onError={cause => {
                    toast.error(readChatSettingsError(cause));
                  }}
                  onNotice={message => {
                    clearError();
                    toast.success(message);
                  }}
                  onShareCard={() => shareModal.openShare({ kind: 'group-card', groupID: view.targetID, displayName: view.title, avatarURL: view.avatarURL })}
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
                  onOpen={() => setOwnerQuitOpen(true)}
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
        onConfirm={clearHistory => { void confirmGroupLifecycle(lifecycleAction, clearHistory); }}
      />
      <GroupOwnerQuitModal
        open={ownerQuitOpen}
        admin={ownerQuitAdmin}
        submitting={lifecycleSubmitting}
        onCancel={() => { if (!lifecycleSubmitting) setOwnerQuitOpen(false); }}
        onOpenAdmins={() => navigate(
          `/conversations/${encodeURIComponent(conversationID)}/settings/manage/admins`,
        )}
        onConfirm={clearHistory => { void confirmGroupLifecycle('leave', clearHistory); }}
      />
    </main>
  );
}

/** 认证恢复和配置失败使用稳定页面状态，避免空白 route。 */
function ChatSettingsPageState({ label, detail = '' }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-chat-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}
export default ChatSettingsPage;
