import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';
import './contact-profile-shared.css';

/** 联系人子页导航栏参数。 */
interface ContactProfileHeaderProps {
  readonly backHref: string;
  readonly title?: string;
  readonly trailing?: ReactNode;
}

/** 复用 RN GroupNavBar 的三栏全屏导航结构。 */
export function ContactProfileHeader({
  backHref,
  title = '',
  trailing,
}: ContactProfileHeaderProps) {
  return (
    <header className="rn-contact-profile-header">
      <Link className="rn-contact-profile-back" to={backHref} aria-label="返回">
        <RNAssetIcon assetURL={backIconURL} />
      </Link>
      <h1>{title}</h1>
      <span>{trailing}</span>
    </header>
  );
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
