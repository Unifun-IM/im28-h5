import type { CSSProperties } from 'react';
import type { WebIMFriendApplication } from '@im28/im-sdk/web';

import arrowUpRightURL from '../../assets/rn/assets/icons/imm28/arrow-up-right.dynamic.svg';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import {
  canAcceptFriendApplication,
  getFriendApplicationMessageText,
  getFriendApplicationSourceText,
  getFriendApplicationStatusText,
} from './friend-application-view.js';

/** 好友申请行参数。 */
interface FriendApplicationRowProps {
  readonly application: WebIMFriendApplication;
  readonly handling: boolean;
  readonly onAccept: () => void;
}

/** 复刻 RN 72px 好友申请行和真实 accept 入口。 */
export function FriendApplicationRow({
  application,
  handling,
  onAccept,
}: FriendApplicationRowProps) {
  // avatarStyle 复用 RN FNV-1a 渐变。
  const avatarStyle = {
    '--friend-application-avatar-gradient': getRNAvatarGradient(application.userID),
  } as CSSProperties;
  // canAccept 只允许 incoming pending 申请显示按钮。
  const canAccept = canAcceptFriendApplication(application);
  return <article className="rn-friend-application-row" role="listitem">
    <span className="rn-friend-application-avatar-wrap">
      <span className="rn-friend-application-avatar" style={avatarStyle}>
        <span>{getRNAvatarInitial(application.displayName)}</span>
        {application.avatarURL ? <img src={application.avatarURL} alt="" loading="lazy" onError={event => { event.currentTarget.hidden = true; }} /> : null}
      </span>
    </span>
    <span className="rn-friend-application-body">
      <span className="rn-friend-application-copy">
        <strong>{application.displayName}</strong>
        <span>{getFriendApplicationSourceText(application)}</span>
        <span>{getFriendApplicationMessageText(application)}</span>
      </span>
      <span className="rn-friend-application-operation">
        {canAccept ? <button type="button" disabled={handling} aria-label={`添加好友 ${application.displayName}`} onClick={onAccept}>{handling ? '处理中' : '加好友'}</button> : <span className="rn-friend-application-status">
          {application.direction === 'outgoing' ? <RNAssetIcon assetURL={arrowUpRightURL} /> : null}
          {getFriendApplicationStatusText(application.status)}
        </span>}
      </span>
    </span>
  </article>;
}
