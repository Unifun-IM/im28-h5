import type { CSSProperties } from 'react';
import type { WebIMGroupApplication } from '@im28/im-sdk/web';

import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { formatGroupApplicationDate, getGroupApplicationSourceText } from './group-application-view.js';

/** 群申请操作弹层参数。 */
interface GroupApplicationActionDialogProps {
  readonly application: WebIMGroupApplication;
  readonly pendingAction: 'accept' | 'reject' | null;
  readonly onCancel: () => void;
  readonly onAccept: () => void;
  readonly onReject: () => void;
}

/** 复刻 RN 群申请资料与通过/拒绝操作面板。 */
export function GroupApplicationActionDialog({ application, pendingAction, onCancel, onAccept, onReject }: GroupApplicationActionDialogProps) {
  // avatarStyle 复用 RN 稳定头像色。
  const avatarStyle = { '--group-application-avatar-gradient': getRNAvatarGradient(application.requesterUserID) } as CSSProperties;
  // metaText 组合 RN 日期和来源。
  const metaText = [formatGroupApplicationDate(application.createdAt), getGroupApplicationSourceText(application)].filter(Boolean).join(' ');
  return <div className="rn-group-application-dialog-backdrop" role="presentation" onClick={onCancel}>
    <section className="rn-group-application-dialog" role="alertdialog" aria-modal="true" aria-labelledby="group-application-dialog-title" onClick={event => event.stopPropagation()}>
      <div className="rn-group-application-dialog-content">
        <span className="rn-group-application-avatar is-dialog" style={avatarStyle}><span>{getRNAvatarInitial(application.requesterName)}</span>{application.requesterAvatarURL ? <img src={application.requesterAvatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}</span>
        <strong id="group-application-dialog-title">{application.requesterName}</strong>
        {application.message ? <p>{application.message}</p> : null}
        {metaText ? <small>{metaText}</small> : null}
      </div>
      <div className="rn-group-application-dialog-actions">
        <button className="is-primary" type="button" disabled={Boolean(pendingAction)} onClick={onAccept}>{pendingAction === 'accept' ? '处理中' : '通过验证'}</button>
        <button type="button" disabled={Boolean(pendingAction)} onClick={onReject}>{pendingAction === 'reject' ? '处理中' : '拒绝申请'}</button>
        <button type="button" disabled={Boolean(pendingAction)} onClick={onCancel}>取消</button>
      </div>
    </section>
  </div>;
}
