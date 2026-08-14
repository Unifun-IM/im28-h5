import type { CSSProperties, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';
import { getContactProfileHeaderBackState } from './contact-profile-route-state.js';
import './contact-profile-shared.css';

/** 联系人子页导航栏参数。 */
interface ContactProfileHeaderProps {
  readonly backHref: string;
  readonly title?: string;
  readonly titleNode?: ReactNode;
  readonly trailing?: ReactNode;
}

/** 复用 RN GroupNavBar 的三栏全屏导航结构。 */
export function ContactProfileHeader({
  backHref,
  title = '',
  titleNode,
  trailing,
}: ContactProfileHeaderProps) {
  /** location 只提供当前联系人子页的受控返回上下文。 */
  const location = useLocation();
  /** backState 按目标路由选择搜索 presentation 或资料来源 context。 */
  const backState = getContactProfileHeaderBackState(backHref, location.state);
  return (
    <PageNavbar className="rn-contact-profile-header">
      <Link
        className="rn-contact-profile-back"
        to={backHref}
        state={backState}
        aria-label="返回"
      >
        <RNAssetIcon assetURL={backIconURL} />
      </Link>
      <span className="rn-contact-profile-header-center">
        {titleNode ?? <h1>{title}</h1>}
      </span>
      <span>{trailing}</span>
    </PageNavbar>
  );
}

/** 联系人资料页在线状态参数。 */
interface ContactProfileOnlineStatusProps {
  readonly online: boolean;
}

/** 对齐 RN 导航栏的在线圆点与文本。 */
export function ContactProfileOnlineStatus({
  online,
}: ContactProfileOnlineStatusProps) {
  return (
    <span className="rn-contact-profile-online" aria-label="导航栏在线状态">
      <span className={online ? 'is-online' : 'is-offline'} />
      <span>{online ? '在线' : '离线'}</span>
    </span>
  );
}

/** 对齐 RN 导航栏优先展示的黑名单标签。 */
export function ContactProfileBlacklistStatus() {
  return <span className="rn-contact-profile-blacklist" aria-label="黑名单状态">黑名单</span>;
}

/** 联系人资料头像参数。 */
interface ContactProfileAvatarProps {
  readonly userID: string;
  readonly displayName: string;
  readonly avatarURL: string;
  readonly size?: 'large' | 'small' | 'row';
}

/** 复用 RN 稳定渐变 fallback 并显示真实远端头像。 */
export function ContactProfileAvatar({
  userID,
  displayName,
  avatarURL,
  size = 'large',
}: ContactProfileAvatarProps) {
  // avatarStyle 把稳定渐变传给 CSS 头像容器。
  const avatarStyle = {
    '--contact-profile-avatar-gradient': getRNAvatarGradient(userID),
  } as CSSProperties;
  return (
    <span className={`rn-contact-profile-avatar rn-contact-profile-avatar--${size}`} style={avatarStyle}>
      <span>{getRNAvatarInitial(displayName)}</span>
      {avatarURL ? (
        <img
          src={avatarURL}
          alt=""
          onError={event => {
            event.currentTarget.hidden = true;
          }}
        />
      ) : null}
    </span>
  );
}
