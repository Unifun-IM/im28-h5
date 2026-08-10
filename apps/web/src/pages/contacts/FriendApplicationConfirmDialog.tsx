import type { CSSProperties } from 'react';
import type { WebIMFriendApplication } from '@im28/im-sdk/web';

import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import {
  formatFriendApplicationDate,
  getFriendApplicationSourceText,
} from './friend-application-view.js';
import './friend-application-dialog.css';

/** 接受好友申请确认框参数。 */
interface FriendApplicationConfirmDialogProps {
  readonly application: WebIMFriendApplication;
  readonly pending: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

/** 复刻 RN 居中申请确认框。 */
export function FriendApplicationConfirmDialog({
  application,
  pending,
  onCancel,
  onConfirm,
}: FriendApplicationConfirmDialogProps) {
  // avatarStyle 复用 RN 稳定头像色。
  const avatarStyle = {
    '--friend-application-avatar-gradient': getRNAvatarGradient(application.userID),
  } as CSSProperties;
  // sourceText 去掉确认框不需要的“通过”前缀。
  const sourceText = getFriendApplicationSourceText(application).replace(/^通过/, '');
  // metaText 组合 RN 日期和短来源。
  const metaText = [formatFriendApplicationDate(application.createdAt), sourceText]
    .filter(Boolean).join('-');
  return <div className="rn-friend-application-dialog-backdrop" role="presentation" onClick={onCancel}>
    <section className="rn-friend-application-dialog" role="alertdialog" aria-modal="true" aria-labelledby="friend-application-confirm-title" onClick={event => event.stopPropagation()}>
      <div className="rn-friend-application-dialog-content">
        <span className="rn-friend-application-avatar is-dialog" style={avatarStyle}>
          <span>{getRNAvatarInitial(application.displayName)}</span>
          {application.avatarURL ? <img src={application.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}
        </span>
        <strong id="friend-application-confirm-title">{application.displayName}</strong>
        {application.message ? <p>{application.message}</p> : null}
        {metaText ? <small>{metaText}</small> : null}
      </div>
      <div className="rn-friend-application-dialog-actions">
        <button type="button" disabled={pending} onClick={onCancel}>取消</button>
        <button className="is-primary" type="button" disabled={pending} onClick={onConfirm}>{pending ? '处理中' : '添加好友'}</button>
      </div>
    </section>
  </div>;
}
