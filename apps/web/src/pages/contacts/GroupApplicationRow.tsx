import type { CSSProperties } from 'react';
import type { WebIMGroupApplication } from '@im28/im-sdk/web';

import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import {
  getGroupApplicationSourceText,
  getGroupApplicationStatusText,
} from './group-application-view.js';

/** 单群申请行参数。 */
interface GroupApplicationRowProps {
  readonly application: WebIMGroupApplication;
  readonly onHandle: () => void;
}

/** 复刻 RN 72px 入群申请行与待审核入口。 */
export function GroupApplicationRow({ application, onHandle }: GroupApplicationRowProps) {
  // avatarStyle 复用 RN FNV-1a 渐变。
  const avatarStyle = { '--group-application-avatar-gradient': getRNAvatarGradient(application.requesterUserID) } as CSSProperties;
  // pending 决定行是否可进入处理弹层。
  const pending = application.status === 'pending';
  return <button className="rn-group-application-row" type="button" disabled={!pending} aria-label={pending ? `处理${application.requesterName}的入群申请` : `${application.requesterName}的入群申请`} onClick={onHandle}>
    <span className="rn-group-application-avatar" style={avatarStyle}>
      <span>{getRNAvatarInitial(application.requesterName)}</span>
      {application.requesterAvatarURL ? <img src={application.requesterAvatarURL} alt="" loading="lazy" onError={event => { event.currentTarget.hidden = true; }} /> : null}
    </span>
    <span className="rn-group-application-body"><span className="rn-group-application-copy"><strong>{application.requesterName}</strong><span>{getGroupApplicationSourceText(application)}</span><span>{application.message || '申请加入群聊'}</span></span><span className={pending ? 'rn-group-application-pending' : 'rn-group-application-status'}>{getGroupApplicationStatusText(application)}</span></span>
  </button>;
}
