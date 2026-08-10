import type { CSSProperties } from 'react';
import type { WebIMContact } from '@im28/im-sdk-web';

import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';

/** RN 联系人行参数。 */
interface ContactRowProps {
  readonly contact: WebIMContact;
}

/** 渲染 RN 56px 联系人行、40px 头像和单行显示名称。 */
export function ContactRow({ contact }: ContactRowProps) {
  // avatarStyle 复用 RN 稳定头像渐变算法。
  const avatarStyle = {
    '--contact-avatar-gradient': getRNAvatarGradient(contact.userID),
  } as CSSProperties;
  return (
    <div className="rn-contact-row">
      <span className="rn-contact-avatar" style={avatarStyle}>
        <span>{getRNAvatarInitial(contact.displayName)}</span>
        {contact.avatarURL ? (
          <img
            src={contact.avatarURL}
            alt=""
            loading="lazy"
            onError={event => {
              event.currentTarget.hidden = true;
            }}
          />
        ) : null}
      </span>
      <span className="rn-contact-row-content">
        <strong>{contact.displayName}</strong>
      </span>
    </div>
  );
}
