import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';
import {
  getGroupMemberRoleLabel,
  type GroupMemberListEntry,
} from './group-members-view.js';

/** 群成员行参数只包含页面投影和受控返回路由。 */
interface GroupMemberRowProps {
  readonly entry: Extract<GroupMemberListEntry, { readonly type: 'member' }>;
  readonly backHref: string;
}

/** 群成员行只投影共享成员 DTO 和资料路由。 */
export function GroupMemberRow({ entry, backHref }: GroupMemberRowProps) {
  // roleLabel 只展示 RN 已定义的群主和管理员标签。
  const roleLabel = getGroupMemberRoleLabel(entry.member.role);
  // avatarStyle 复用 RN 稳定 fallback 渐变。
  const avatarStyle = {
    '--group-member-avatar-gradient': getRNAvatarGradient(entry.member.userID),
  } as CSSProperties;
  // profileURL 只携带稳定用户 ID。
  const profileURL = `/contacts/users/${encodeURIComponent(entry.member.userID)}`;
  return (
    <Link className="rn-group-member-row" to={profileURL} state={{ backHref }}>
      <span className="rn-group-member-avatar" style={avatarStyle}>
        <span>{getRNAvatarInitial(entry.displayName, '群')}</span>
        {entry.member.avatarURL ? (
          <img
            src={entry.member.avatarURL}
            alt=""
            loading="lazy"
            onError={event => { event.currentTarget.hidden = true; }}
          />
        ) : null}
      </span>
      <span className="rn-group-member-row-content">
        <span>
          <strong>{entry.displayName}</strong>
          <small>{entry.member.userID}</small>
        </span>
        {roleLabel ? <em>{roleLabel}</em> : null}
      </span>
    </Link>
  );
}
