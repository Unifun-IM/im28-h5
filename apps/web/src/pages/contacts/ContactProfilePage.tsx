import { useCallback, useEffect, useMemo, useState } from 'react';
import { type WebIMPeerProfile } from '@im28/im-sdk/web';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useWebIMRuntime } from '../../runtime/index.js';
import { ContactDeleteSheet } from './ContactActionSheets.js';
import {
  ContactProfilePageState,
  ProfileConfirmDialog,
  ProfileMoreSheet,
  ProfileRemarkDialog,
  readContactProfileError,
} from './ContactProfileActions.js';
import {
  formatContactProfileAddedAt,
  getContactProfileGenderLabel,
  getContactProfileGroupPresentation,
  getContactProfileNavbarState,
  getContactProfilePrimaryAction,
  resolveContactProfileBackHref,
  readContactProfileGroupConversationID,
} from './contact-profile-view.js';
import { createContactCardShareLocationState } from './contact-action-view.js';
import { createContactProfileChildRouteState } from './contact-profile-route-state.js';
import { ContactProfileSurface } from './ContactProfileSurface.js';
import { useContactProfilePresence } from './useContactProfilePresence.js';
import { useContactProfileGroupContext } from './useContactProfileGroupContext.js';
import { useContactProfileActions } from './useContactProfileActions.js';
import './contact-profile-page.css';

/** RN 联系人资料核心页只调用 Web SDK peerProfile facade。 */
export function ContactProfilePage() {
  // runtime context 是页面唯一 SDK 入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // routeParams 提供稳定联系人 ID deep link。
  const routeParams = useParams<{ userID: string }>();
  // location 只为受控的内部资料返回路由提供 state。
  const location = useLocation();
  // userID 统一清理缺失路由参数。
  const userID = routeParams.userID?.trim() ?? '';
  // backHref 拒绝外部或任意 Router state，默认回通讯录。
  const backHref = resolveContactProfileBackHref(location.state);
  /** profileRouteState 只延续资料子路由返回来源所需的白名单 context。 */
  const profileRouteState = createContactProfileChildRouteState(location.state);
  // groupConversationID 只是候选，权限和成员关系仍由 shared facades 校验。
  const groupConversationID = readContactProfileGroupConversationID(location.state);
  // navigate 仅负责资料子路由的 SPA 切换。
  const navigate = useNavigate();
  // profile 保存 Gateway 归一化的资料和关系状态。
  const [profile, setProfile] = useState<WebIMPeerProfile | null>(null);
  /** commonGroupsCount 展示 SDK 完整分页后的共同群数量。 */
  const [commonGroupsCount, setCommonGroupsCount] = useState(0);
  /** blockedByMe 投影当前账号黑名单关系。 */
  const [blockedByMe, setBlockedByMe] = useState(false);
  // loading 覆盖首次读取和手动重试。
  const [loading, setLoading] = useState(false);
  /** remarkOpen 控制 RN 备注编辑层。 */
  const [remarkOpen, setRemarkOpen] = useState(false);
  /** remarkDraft 保存本次提交前的备注文本。 */
  const [remarkDraft, setRemarkDraft] = useState('');
  /** moreOpen 控制资料页右上角更多动作层。 */
  const [moreOpen, setMoreOpen] = useState(false);
  /** confirmBlacklist 控制黑名单写操作二次确认。 */
  const [confirmBlacklist, setConfirmBlacklist] = useState(false);
  /** deleteOpen 控制好友删除范围确认层。 */
  const [deleteOpen, setDeleteOpen] = useState(false);
  // error 显示真实 SDK/Gateway/clipboard 失败。
  const [error, setError] = useState<string | null>(null);

  /** 读取真实联系人资料，不降级为路由参数拼装。 */
  const loadProfile = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID || !userID) return;
    setLoading(true);
    setError(null);
    try {
      /** nextProfile 是 Gateway 归一化后的最新关系资料。 */
      const nextProfile = await runtime.getSync().peerProfile.get(userID);
      setProfile(nextProfile);
      setRemarkDraft(nextProfile.remark);
      if (nextProfile.relationship === 'friend') {
        /** commonGroups 与 blacklist 读取互不依赖，可并行完成。 */
        const [commonGroups, blacklist] = await Promise.all([
          runtime.getSync().contacts.listCommonGroups({ targetUserID: userID, pageSize: 50 }),
          runtime.getSync().blacklist.list({ pageSize: 100 }),
        ]);
        setCommonGroupsCount(commonGroups.length);
        setBlockedByMe(blacklist.some(item => item.userID === userID));
      } else {
        setCommonGroupsCount(0);
        setBlockedByMe(false);
      }
    } catch (cause) {
      setError(readContactProfileError(cause));
    } finally {
      setLoading(false);
    }
  }, [runtime, snapshot.userID, userID]);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  /** peerOnline 通过独立 hook 消费 SDK 首值与 WS 增量。 */
  const peerOnline = useContactProfilePresence(
    runtime,
    snapshot.userID,
    userID,
    profile?.relationship,
  );
  /** groupContext 以 fail-closed 方式恢复群入口昵称和互加好友限制。 */
  const groupContext = useContactProfileGroupContext({
    runtime,
    accountUserID: snapshot.userID,
    conversationID: groupConversationID,
    targetUserID: userID,
  });

  /** actions 集中持有资料 mutation、通话和浏览器剪贴板编排。 */
  const actions = useContactProfileActions({
    runtime,
    profile,
    blockedByMe,
    remarkDraft,
    setProfile,
    setBlockedByMe,
    closeRemark: () => setRemarkOpen(false),
    closeBlacklistConfirm: () => setConfirmBlacklist(false),
    clearPageError: () => setError(null),
  });
  /** actionPending 供页面统一禁用写操作入口。 */
  const { actionPending } = actions;

  // primaryAction 只公开本切片已具备真实 owner 的动作。
  const primaryAction = useMemo(
    () => profile ? getContactProfilePrimaryAction(profile.relationship) : null,
    [profile],
  );
  /** navbarState 复用 RN 黑名单和 presence 的显示优先级。 */
  const navbarState = getContactProfileNavbarState(
    profile?.relationship ?? null,
    blockedByMe,
    peerOnline,
  );
  /** groupPresentation 对齐 RN 受限群资料页并阻止校验期间动作闪现。 */
  const groupPresentation = profile
    ? getContactProfileGroupPresentation(profile.relationship, groupContext)
    : { restricted: Boolean(groupConversationID), notice: '' };

  if (restoring) return <ContactProfilePageState label="正在恢复联系人资料" />;
  if (!runtime) {
    return <ContactProfilePageState label="运行配置不可用" detail={startupError} />;
  }
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (!userID) return <Navigate to="/contacts" replace />;

  // genderLabel 只在服务端提供明确值时展示。
  const genderLabel = profile ? getContactProfileGenderLabel(profile.gender) : '';
  // addedAt 只为好友关系展示。
  const addedAt = profile ? formatContactProfileAddedAt(profile.addedAt) : '';
  // displayName 在群入口校验成功后复用 SDK 群成员显示名优先级。
  const displayName = groupContext.status === 'ready' && groupContext.displayName
    ? groupContext.displayName
    : profile?.displayName ?? '';
  return (
    <ContactProfileSurface
      backHref={backHref}
      profile={profile}
      profileRouteState={profileRouteState}
      loading={loading}
      actionPending={actionPending}
      error={error}
      displayName={displayName}
      genderLabel={genderLabel}
      addedAt={addedAt}
      commonGroupsCount={commonGroupsCount}
      navbarState={navbarState}
      groupPresentation={groupPresentation}
      primaryAction={primaryAction}
      onRetry={loadProfile}
      onOpenMore={() => setMoreOpen(true)}
      onCopyUserID={() => void actions.copyUserID()}
      onStartCall={mediaType => void actions.startCall(mediaType)}
      onToggleStar={() => void actions.toggleStar()}
      onOpenConversation={() => void actions.openConversation()}
      onOpenRemark={() => setRemarkOpen(true)}
      onOpenCommonGroups={() => profile && navigate(`/contacts/users/${encodeURIComponent(profile.userID)}/groups`, {
        state: profileRouteState,
      })}
      onShareCard={() => profile && navigate(`/contacts/users/${encodeURIComponent(profile.userID)}/share`, {
        state: createContactCardShareLocationState(profile),
      })}
    >
      <ProfileRemarkDialog
        open={remarkOpen}
        value={remarkDraft}
        pending={actionPending}
        onChange={setRemarkDraft}
        onClose={() => setRemarkOpen(false)}
        onSave={() => void actions.saveRemark()}
      />
      <ProfileMoreSheet
        open={moreOpen}
        blocked={blockedByMe}
        pending={actionPending}
        onClose={() => setMoreOpen(false)}
        onBlacklist={() => { setMoreOpen(false); setConfirmBlacklist(true); }}
        onDelete={() => { setMoreOpen(false); setDeleteOpen(true); }}
      />
      <ProfileConfirmDialog
        open={confirmBlacklist}
        pending={actionPending}
        title={blockedByMe ? `将「${profile?.displayName ?? ''}」移出黑名单？` : `将「${profile?.displayName ?? ''}」加入黑名单？`}
        description={blockedByMe ? '移出后将恢复接收对方消息。' : '加入后将不再接收对方消息，可在黑名单中解除。'}
        confirmLabel={blockedByMe ? '确认移出' : '确认加入'}
        onClose={() => setConfirmBlacklist(false)}
        onConfirm={() => void actions.updateBlacklist()}
      />
      <ContactDeleteSheet
        contact={deleteOpen && profile ? profile : null}
        pending={actionPending}
        onClose={() => setDeleteOpen(false)}
        onDelete={scope => void actions.deleteFriend(scope)}
      />
    </ContactProfileSurface>
  );
}
