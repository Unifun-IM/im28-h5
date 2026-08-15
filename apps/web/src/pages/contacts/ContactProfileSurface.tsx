import type { WebIMPeerProfile } from '@im28/im-sdk/web';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import copyIconURL from '../../assets/rn/assets/icons/imm28/copy.regular.svg';
import moreIconURL from '../../assets/rn/assets/icons/imm28/more-horiz.regular.svg';
import phoneIconURL from '../../assets/rn/assets/icons/imm28/phone.regular.svg';
import starIconURL from '../../assets/rn/assets/icons/imm28/star.regular.svg';
import starSelectedIconURL from '../../assets/rn/assets/icons/imm28/star.solid.svg';
import videoIconURL from '../../assets/rn/assets/icons/imm28/video-camera.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import {
  ContactProfileError,
  ContactProfileRow,
  ProfileQuickAction,
} from './ContactProfileActions.js';
import {
  ContactProfileAvatar,
  ContactProfileBlacklistStatus,
  ContactProfileHeader,
  ContactProfileOnlineStatus,
} from './ContactProfileShared.js';
import { buildContactFriendApplicationRoute } from './contact-profile-view.js';
import type {
  ContactProfileGroupPresentation,
  ContactProfileNavbarState,
  ContactProfilePrimaryAction,
} from './contact-profile-view.js';
import type { ContactProfileChildRouteState } from './contact-profile-route-state.js';

/** 联系人资料 Surface 只接收已解析展示事实和页面回调。 */
export interface ContactProfileSurfaceProps {
  /** 保留资料页弹窗在页面主容器内的原始 DOM 层级。 */
  readonly children: ReactNode;
  readonly backHref: string;
  readonly profile: WebIMPeerProfile | null;
  readonly profileRouteState: ContactProfileChildRouteState | undefined;
  readonly loading: boolean;
  readonly actionPending: boolean;
  readonly error: string | null;
  readonly displayName: string;
  readonly genderLabel: string;
  readonly addedAt: string;
  readonly commonGroupsCount: number;
  readonly navbarState: ContactProfileNavbarState;
  readonly groupPresentation: ContactProfileGroupPresentation;
  readonly primaryAction: ContactProfilePrimaryAction;
  readonly onRetry: () => Promise<void>;
  readonly onOpenMore: () => void;
  readonly onCopyUserID: () => void;
  readonly onStartCall: (mediaType: 'audio' | 'video') => void;
  readonly onToggleStar: () => void;
  readonly onOpenConversation: () => void;
  readonly onOpenRemark: () => void;
  readonly onOpenCommonGroups: () => void;
  readonly onShareCard: () => void;
}

/** 渲染 RN 联系人资料正文，不读取 runtime、Router 或 SDK mutation。 */
export function ContactProfileSurface({
  children,
  backHref,
  profile,
  profileRouteState,
  loading,
  actionPending,
  error,
  displayName,
  genderLabel,
  addedAt,
  commonGroupsCount,
  navbarState,
  groupPresentation,
  primaryAction,
  onRetry,
  onOpenMore,
  onCopyUserID,
  onStartCall,
  onToggleStar,
  onOpenConversation,
  onOpenRemark,
  onOpenCommonGroups,
  onShareCard,
}: ContactProfileSurfaceProps) {
  return (
    <main className="rn-contact-profile-page" aria-busy={loading || actionPending}>
      <section className="rn-contact-profile-surface">
        <ContactProfileHeader
          backHref={backHref}
          titleNode={navbarState.kind === 'blacklist' ? (
            <ContactProfileBlacklistStatus />
          ) : navbarState.kind === 'presence' ? (
            <ContactProfileOnlineStatus online={navbarState.online} />
          ) : null}
          trailing={profile?.relationship === 'friend' && !groupPresentation.restricted ? (
            <button
              type="button"
              className="rn-contact-profile-more"
              aria-label="更多联系人操作"
              onClick={onOpenMore}
            >
              <RNAssetIcon assetURL={moreIconURL} />
            </button>
          ) : null}
        />
        {loading && !profile ? (
          <div className="rn-contact-profile-loading" aria-label="正在加载联系人资料"><span /></div>
        ) : profile ? (
          <div className="rn-contact-profile-content">
            {error ? <ContactProfileError error={error} onRetry={onRetry} /> : null}
            <div className="rn-contact-profile-hero">
              <ContactProfileAvatar {...profile} displayName={displayName} />
              <div className="rn-contact-profile-name-row">
                <h2>{displayName}</h2>
                {genderLabel && !groupPresentation.restricted ? (
                  <span
                    className={genderLabel === '男' ? 'is-male' : 'is-female'}
                    aria-label={`性别${genderLabel}`}
                  >
                    {genderLabel === '男' ? '♂' : '♀'}
                  </span>
                ) : null}
              </div>
              {!groupPresentation.restricted && profile.nickname && profile.nickname !== displayName ? (
                <p className="rn-contact-profile-nickname">昵称：{profile.nickname}</p>
              ) : null}
              {!groupPresentation.restricted ? (
                <button type="button" className="rn-contact-profile-id" onClick={onCopyUserID}>
                  <span>ID：{profile.userID}</span>
                  <RNAssetIcon assetURL={copyIconURL} />
                </button>
              ) : null}
              {!groupPresentation.restricted && profile.relationship === 'stranger' && profile.bio ? (
                <p className="rn-contact-profile-bio">{profile.bio}</p>
              ) : null}
            </div>

            {groupPresentation.notice ? (
              <p className="rn-contact-profile-group-notice">{groupPresentation.notice}</p>
            ) : null}

            {profile.relationship === 'friend' && !groupPresentation.restricted ? (
              <div className="rn-contact-profile-quick-actions" aria-label="联系人快捷操作">
                <ProfileQuickAction iconURL={phoneIconURL} label="语音通话" disabled={actionPending} onClick={() => onStartCall('audio')} />
                <ProfileQuickAction iconURL={videoIconURL} label="视频通话" disabled={actionPending} onClick={() => onStartCall('video')} />
                <ProfileQuickAction
                  iconURL={profile.isStarred ? starSelectedIconURL : starIconURL}
                  label={profile.isStarred ? '取消星标' : '设为星标'}
                  selected={profile.isStarred}
                  disabled={actionPending}
                  onClick={onToggleStar}
                />
              </div>
            ) : null}

            {!groupPresentation.restricted && primaryAction === 'message' ? (
              <button
                type="button"
                className="rn-contact-profile-primary"
                disabled={actionPending}
                onClick={onOpenConversation}
              >
                {actionPending ? '正在打开' : '发消息'}
              </button>
            ) : !groupPresentation.restricted && primaryAction === 'add-friend' ? (
              <Link
                className="rn-contact-profile-primary"
                to={buildContactFriendApplicationRoute(profile.userID)}
                state={profileRouteState}
              >
                加好友
              </Link>
            ) : null}

            {profile.relationship === 'friend' && !groupPresentation.restricted ? (
              <>
                <div className="rn-contact-profile-card">
                  <ContactProfileRow label="备注名" value={profile.remark} onClick={onOpenRemark} />
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
                    onClick={onOpenCommonGroups}
                  />
                  <ContactProfileRow label="分享好友名片" value="" last onClick={onShareCard} />
                </div>
              </>
            ) : null}
          </div>
        ) : error ? (
          <div className="rn-contact-profile-empty-error">
            <ContactProfileError error={error} onRetry={onRetry} />
          </div>
        ) : null}
      </section>
      {children}
    </main>
  );
}
