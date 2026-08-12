import type { CSSProperties } from 'react';

import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';
import type { GroupInviteMemberCandidate } from './group-invite-members-view.js';

/** 邀请候选格参数只包含共享好友投影和页面选择状态。 */
interface GroupInviteMemberTileProps {
  readonly candidate: GroupInviteMemberCandidate;
  readonly selected: boolean;
  readonly onToggle: (userID: string) => void;
}

/** 复刻 RN 五列好友头像、名称和选中角标。 */
export function GroupInviteMemberTile({
  candidate,
  selected,
  onToggle,
}: GroupInviteMemberTileProps) {
  /** contact 是当前账号稳定好友候选。 */
  const { contact, displayName } = candidate;
  /** avatarStyle 复用 RN 稳定 fallback 渐变。 */
  const avatarStyle = {
    '--group-remove-avatar-gradient': getRNAvatarGradient(contact.userID),
  } as CSSProperties;
  return (
    <button
      className="rn-group-remove-tile"
      type="button"
      aria-label={`选择邀请好友${displayName}`}
      aria-pressed={selected}
      onClick={() => onToggle(contact.userID)}
    >
      <span className={`rn-group-remove-avatar${selected ? ' is-selected' : ''}`} style={avatarStyle}>
        <span>{getRNAvatarInitial(displayName, '友')}</span>
        {contact.avatarURL ? <img src={contact.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}
        {selected ? <em>✓</em> : null}
      </span>
      <span>{displayName}</span>
    </button>
  );
}
