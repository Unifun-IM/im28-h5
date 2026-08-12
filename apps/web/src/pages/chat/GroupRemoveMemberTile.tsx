import type { CSSProperties } from 'react';

import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';
import type { GroupRemoveMemberCandidate } from './group-remove-members-view.js';

/** 移除候选格参数只包含共享成员投影和选择状态。 */
interface GroupRemoveMemberTileProps {
  readonly candidate: GroupRemoveMemberCandidate;
  readonly selected: boolean;
  readonly onToggle: (userID: string) => void;
}

/** 复刻 RN 五列头像、昵称和选中角标。 */
export function GroupRemoveMemberTile({
  candidate,
  selected,
  onToggle,
}: GroupRemoveMemberTileProps) {
  /** member 是当前群稳定候选身份。 */
  const { member, displayName } = candidate;
  /** avatarStyle 复用 RN 稳定 fallback 渐变。 */
  const avatarStyle = {
    '--group-remove-avatar-gradient': getRNAvatarGradient(member.userID),
  } as CSSProperties;
  return (
    <button
      className="rn-group-remove-tile"
      type="button"
      aria-label={`选择移出成员${displayName}`}
      aria-pressed={selected}
      onClick={() => onToggle(member.userID)}
    >
      <span className={`rn-group-remove-avatar${selected ? ' is-selected' : ''}`} style={avatarStyle}>
        <span>{getRNAvatarInitial(displayName, '群')}</span>
        {member.avatarURL ? <img src={member.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}
        {selected ? <em>✓</em> : null}
      </span>
      <span>{displayName}</span>
    </button>
  );
}
