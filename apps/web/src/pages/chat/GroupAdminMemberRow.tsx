import type { CSSProperties } from 'react';
import { resolveIMGroupMemberDisplayName, type WebIMGroupMember } from '@im28/im-sdk/web';

import checkIconURL from '../../assets/rn/assets/icons/imm28/check.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';

/** 管理员成员行只接收 shared 快照和显式页面动作。 */
interface GroupAdminMemberRowProps {
  readonly member: WebIMGroupMember;
  readonly selected?: boolean;
  readonly actionLabel?: string;
  readonly disabled?: boolean;
  readonly onAction: () => void;
}

/** 呈现 RN 40px 头像、名称、用户 ID 与选择/移除动作。 */
export function GroupAdminMemberRow({
  member,
  selected = false,
  actionLabel,
  disabled = false,
  onAction,
}: GroupAdminMemberRowProps) {
  /** name 复用 shared 备注、群昵称、公开昵称优先级。 */
  const name = resolveIMGroupMemberDisplayName(member, member.userID);
  /** avatarStyle 复用 RN 稳定 fallback 渐变。 */
  const avatarStyle = {
    '--group-admin-avatar-gradient': getRNAvatarGradient(member.userID),
  } as CSSProperties;
  return (
    <button
      className={`rn-group-admin-member${selected ? ' is-selected' : ''}`}
      type="button"
      disabled={disabled}
      aria-pressed={actionLabel ? undefined : selected}
      onClick={onAction}
    >
      {!actionLabel ? (
        <span className="rn-group-admin-check" aria-hidden="true">
          {selected ? <RNAssetIcon assetURL={checkIconURL} /> : null}
        </span>
      ) : null}
      <span className="rn-group-admin-avatar" style={avatarStyle}>
        <span>{getRNAvatarInitial(name, '群')}</span>
        {member.avatarURL ? <img src={member.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}
      </span>
      <span className="rn-group-admin-member-copy"><strong>{name}</strong><small>{member.userID}</small></span>
      {actionLabel ? <span className="rn-group-admin-member-action">{actionLabel}</span> : null}
    </button>
  );
}
