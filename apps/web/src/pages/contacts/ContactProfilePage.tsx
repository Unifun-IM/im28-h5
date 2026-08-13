import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WebIMPeerProfile } from '@im28/im-sdk/web';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import copyIconURL from '../../assets/rn/assets/icons/imm28/copy.regular.svg';
import chatIconURL from '../../assets/rn/assets/icons/imm28/chat-bubble-empty.regular.svg';
import moreIconURL from '../../assets/rn/assets/icons/imm28/more-horiz.regular.svg';
import phoneIconURL from '../../assets/rn/assets/icons/imm28/phone.regular.svg';
import starIconURL from '../../assets/rn/assets/icons/imm28/star.regular.svg';
import starSelectedIconURL from '../../assets/rn/assets/icons/imm28/star.solid.svg';
import videoIconURL from '../../assets/rn/assets/icons/imm28/video-camera.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMCall, useWebIMRuntime } from '../../runtime/index.js';
import { ContactDeleteSheet } from './ContactActionSheets.js';
import {
  ContactProfileRow,
  ContactProfileError,
  ContactProfilePageState,
  ProfileConfirmDialog,
  ProfileMoreSheet,
  ProfileQuickAction,
  ProfileRemarkDialog,
  readContactProfileError,
} from './ContactProfileActions.js';
import {
  buildContactFriendApplicationRoute,
  formatContactProfileAddedAt,
  getContactProfileGenderLabel,
  getContactProfilePrimaryAction,
  resolveContactProfileBackHref,
} from './contact-profile-view.js';
import { createContactCardShareLocationState } from './contact-action-view.js';
import { ContactProfileAvatar, ContactProfileHeader } from './ContactProfileShared.js';
import './contact-profile-page.css';

/** RN 联系人资料核心页只调用 Web SDK peerProfile facade。 */
export function ContactProfilePage() {
  // runtime context 是页面唯一 SDK 入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** callOwner 是 H5 全局唯一通话生命周期 owner。 */
  const callOwner = useWebIMCall();
  // routeParams 提供稳定联系人 ID deep link。
  const routeParams = useParams<{ userID: string }>();
  // location 只为受控的内部资料返回路由提供 state。
  const location = useLocation();
  // userID 统一清理缺失路由参数。
  const userID = routeParams.userID?.trim() ?? '';
  // backHref 拒绝外部或任意 Router state，默认回通讯录。
  const backHref = resolveContactProfileBackHref(location.state);
  // navigate 仅负责真实 operation 成功后的 SPA 切换。
  const navigate = useNavigate();
  // profile 保存 Gateway 归一化的资料和关系状态。
  const [profile, setProfile] = useState<WebIMPeerProfile | null>(null);
  /** commonGroupsCount 展示 SDK 完整分页后的共同群数量。 */
  const [commonGroupsCount, setCommonGroupsCount] = useState(0);
  /** blockedByMe 投影当前账号黑名单关系。 */
  const [blockedByMe, setBlockedByMe] = useState(false);
  // loading 覆盖首次读取和手动重试。
  const [loading, setLoading] = useState(false);
  // actionPending 阻止重复创建单聊。
  const [actionPending, setActionPending] = useState(false);
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

  /** 创建并持久化真实单聊后进入现有聊天 route。 */
  const openConversation = useCallback(async (): Promise<void> => {
    if (!runtime || !profile || actionPending) return;
    setActionPending(true);
    setError(null);
    try {
      // conversation 已由 SDK 写入当前账号 SQLite。
      const conversation = await runtime.getSync().peerProfile
        .openConversation(profile.userID);
      navigate(`/conversations/${encodeURIComponent(conversation.conversationID)}`);
    } catch (cause) {
      setError(readContactProfileError(cause, '打开会话失败，请重试'));
    } finally {
      setActionPending(false);
    }
  }, [actionPending, navigate, profile, runtime]);

  /** 复制按钮只在浏览器 clipboard 成功后结束。 */
  const copyUserID = useCallback(async (): Promise<void> => {
    if (!profile) return;
    try {
      await navigator.clipboard.writeText(profile.userID);
    } catch {
      setError('复制用户ID失败');
    }
  }, [profile]);

  /** 发起通话前通过 shared peer facade 获取真实单聊主键。 */
  const startCall = useCallback(async (mediaType: 'audio' | 'video'): Promise<void> => {
    if (!runtime || !profile || profile.relationship !== 'friend' || actionPending) return;
    setActionPending(true);
    setError(null);
    try {
      /** conversation 由 Gateway 与 SQLite 收敛，页面不拼接 conversation ID。 */
      const conversation = await runtime.getSync().peerProfile.openConversation(profile.userID);
      await callOwner.startOutgoing({
        conversationID: conversation.conversationID,
        peerName: profile.displayName,
        peerAvatarURL: profile.avatarURL,
        mediaType,
      });
    } catch (cause) {
      setError(readContactProfileError(cause, '发起通话失败'));
    } finally {
      setActionPending(false);
    }
  }, [actionPending, callOwner, profile, runtime]);

  /** 星标更新只在 shared facade 成功后替换页面关系快照。 */
  const toggleStar = useCallback(async (): Promise<void> => {
    if (!runtime || !profile || actionPending) return;
    setActionPending(true);
    setError(null);
    try {
      /** result 是 SDK 成功写入关系缓存后的标准投影。 */
      const result = await runtime.getSync().contacts.updateFriendStar(
        profile.userID,
        !profile.isStarred,
      );
      setProfile(current => current ? { ...current, isStarred: result.isStarred } : current);
    } catch (cause) {
      setError(readContactProfileError(cause, '星标设置失败'));
    } finally {
      setActionPending(false);
    }
  }, [actionPending, profile, runtime]);

  /** 备注保存调用 SDK success-only 关系写入并更新展示优先级。 */
  const saveRemark = useCallback(async (): Promise<void> => {
    if (!runtime || !profile || actionPending) return;
    setActionPending(true);
    setError(null);
    try {
      /** result 保留远端确认后的备注、昵称和头像。 */
      const result = await runtime.getSync().contacts.updateFriendRemark(
        profile.userID,
        remarkDraft,
      );
      setProfile(current => current ? {
        ...current,
        remark: result.remark,
        displayName: result.remark || result.nickname || current.userID,
      } : current);
      setRemarkOpen(false);
    } catch (cause) {
      setError(readContactProfileError(cause, '备注保存失败'));
    } finally {
      setActionPending(false);
    }
  }, [actionPending, profile, remarkDraft, runtime]);

  /** 黑名单二次确认后只调用共享联系人动作 facade。 */
  const updateBlacklist = useCallback(async (): Promise<void> => {
    if (!runtime || !profile || actionPending) return;
    setActionPending(true);
    setError(null);
    try {
      /** nextBlocked 是本次用户明确选择的目标状态。 */
      const nextBlocked = !blockedByMe;
      await runtime.getSync().contacts.setBlacklist(profile.userID, nextBlocked);
      setBlockedByMe(nextBlocked);
      setConfirmBlacklist(false);
    } catch (cause) {
      setError(readContactProfileError(cause, '黑名单设置失败'));
    } finally {
      setActionPending(false);
    }
  }, [actionPending, blockedByMe, profile, runtime]);

  /** 删除好友在明确消息清理范围后执行 shared 原子状态机。 */
  const deleteFriend = useCallback(async (scope: 'self' | 'both'): Promise<void> => {
    if (!runtime || !profile || actionPending) return;
    setActionPending(true);
    setError(null);
    try {
      await runtime.getSync().contacts.deleteFriend({ friendUserID: profile.userID, clearScope: scope });
      navigate('/contacts', { replace: true });
    } catch (cause) {
      setError(readContactProfileError(cause, '删除好友失败'));
    } finally {
      setActionPending(false);
    }
  }, [actionPending, navigate, profile, runtime]);

  // primaryAction 只公开本切片已具备真实 owner 的动作。
  const primaryAction = useMemo(
    () => profile ? getContactProfilePrimaryAction(profile.relationship) : null,
    [profile],
  );

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
  return (
    <main className="rn-contact-profile-page" aria-busy={loading || actionPending}>
      <section className="rn-contact-profile-surface">
        <ContactProfileHeader
          backHref={backHref}
          trailing={profile?.relationship === 'friend' ? (
            <button
              type="button"
              className="rn-contact-profile-more"
              aria-label="更多联系人操作"
              onClick={() => setMoreOpen(true)}
            >
              <RNAssetIcon assetURL={moreIconURL} />
            </button>
          ) : null}
        />
        {loading && !profile ? (
          <div className="rn-contact-profile-loading" aria-label="正在加载联系人资料"><span /></div>
        ) : profile ? (
          <div className="rn-contact-profile-content">
            {error ? <ContactProfileError error={error} onRetry={loadProfile} /> : null}
            <div className="rn-contact-profile-hero">
              <ContactProfileAvatar {...profile} />
              <div className="rn-contact-profile-name-row">
                <h2>{profile.displayName}</h2>
                {genderLabel ? (
                  <span
                    className={genderLabel === '男' ? 'is-male' : 'is-female'}
                    aria-label={`性别${genderLabel}`}
                  >
                    {genderLabel === '男' ? '♂' : '♀'}
                  </span>
                ) : null}
              </div>
              {profile.nickname && profile.nickname !== profile.displayName ? (
                <p className="rn-contact-profile-nickname">昵称：{profile.nickname}</p>
              ) : null}
              <button type="button" className="rn-contact-profile-id" onClick={() => void copyUserID()}>
                <span>ID：{profile.userID}</span>
                <RNAssetIcon assetURL={copyIconURL} />
              </button>
              {profile.relationship === 'stranger' && profile.bio ? (
                <p className="rn-contact-profile-bio">{profile.bio}</p>
              ) : null}
            </div>

            {profile.relationship === 'friend' ? (
              <div className="rn-contact-profile-quick-actions" aria-label="联系人快捷操作">
                <ProfileQuickAction iconURL={phoneIconURL} label="语音通话" disabled={actionPending} onClick={() => void startCall('audio')} />
                <ProfileQuickAction iconURL={videoIconURL} label="视频通话" disabled={actionPending} onClick={() => void startCall('video')} />
                <ProfileQuickAction
                  iconURL={profile.isStarred ? starSelectedIconURL : starIconURL}
                  label={profile.isStarred ? '取消星标' : '设为星标'}
                  selected={profile.isStarred}
                  disabled={actionPending}
                  onClick={() => void toggleStar()}
                />
              </div>
            ) : null}

            {primaryAction === 'message' ? (
              <button
                type="button"
                className="rn-contact-profile-primary"
                disabled={actionPending}
                onClick={() => void openConversation()}
              >
                {actionPending ? '正在打开' : '发消息'}
              </button>
            ) : primaryAction === 'add-friend' ? (
              <Link
                className="rn-contact-profile-primary"
                to={buildContactFriendApplicationRoute(profile.userID)}
                state={readContactProfileSourceType(location.state) ? {
                  sourceType: readContactProfileSourceType(location.state),
                } : undefined}
              >
                加好友
              </Link>
            ) : null}

            {profile.relationship === 'friend' ? (
              <>
                <div className="rn-contact-profile-card">
                  <ContactProfileRow label="备注名" value={profile.remark} onClick={() => setRemarkOpen(true)} />
                  {profile.bio ? <ContactProfileRow label="个性签名" value={profile.bio} last /> : null}
                </div>
                <div className="rn-contact-profile-card rn-contact-profile-card-gap">
                  <ContactProfileRow label="来源" value={profile.sourceLabel} />
                  <ContactProfileRow label="添加时间" value={addedAt} last />
                </div>
                <div className="rn-contact-profile-card rn-contact-profile-card-gap">
                  <ContactProfileRow
                    label="共同的群聊"
                    value={commonGroupsCount ? String(commonGroupsCount) : ''}
                    onClick={() => navigate(`/contacts/users/${encodeURIComponent(profile.userID)}/groups`)}
                  />
                  <ContactProfileRow
                    label="分享好友名片"
                    value=""
                    last
                    onClick={() => navigate(`/contacts/users/${encodeURIComponent(profile.userID)}/share`, {
                      state: createContactCardShareLocationState(profile),
                    })}
                  />
                </div>
              </>
            ) : null}
          </div>
        ) : error ? (
          <div className="rn-contact-profile-empty-error">
            <ContactProfileError error={error} onRetry={loadProfile} />
          </div>
        ) : null}
      </section>
      <ProfileRemarkDialog
        open={remarkOpen}
        value={remarkDraft}
        pending={actionPending}
        onChange={setRemarkDraft}
        onClose={() => setRemarkOpen(false)}
        onSave={() => void saveRemark()}
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
        onConfirm={() => void updateBlacklist()}
      />
      <ContactDeleteSheet
        contact={deleteOpen && profile ? profile : null}
        pending={actionPending}
        onClose={() => setDeleteOpen(false)}
        onDelete={scope => void deleteFriend(scope)}
      />
    </main>
  );
}

/** 从扫码资料路由读取受控好友来源。 */
function readContactProfileSourceType(state: unknown): 'qrcode' | null {
  if (!state || typeof state !== 'object') return null;
  return Reflect.get(state, 'sourceType') === 'qrcode' ? 'qrcode' : null;
}
