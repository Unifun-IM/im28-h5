import type { CSSProperties } from 'react';
import type { WebIMJoinedGroup } from '@im28/im-sdk/web';

import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';
import {
  getJoinedGroupBadgeLabel,
  getJoinedGroupBadges,
  getJoinedGroupDescription,
} from './joined-group-view.js';
import './joined-group-badges.css';

/** 我的群聊列表行参数。 */
interface JoinedGroupRowProps {
  readonly group: WebIMJoinedGroup;
  readonly opening: boolean;
  readonly onOpen: () => void;
}

/** 渲染 RN 72px 群行、40px 头像、描述和身份标签。 */
export function JoinedGroupRow({
  group,
  opening,
  onOpen,
}: JoinedGroupRowProps) {
  // avatarStyle 复用 RN 稳定头像渐变算法。
  const avatarStyle = {
    '--joined-group-avatar-gradient': getRNAvatarGradient(group.groupID),
  } as CSSProperties;
  // badges 复用 RN 创建者和群角色规则。
  const badges = getJoinedGroupBadges(group);
  // description 组合状态、人数和群 ID。
  const description = getJoinedGroupDescription(group);
  return (
    <button
      type="button"
      className="rn-joined-group-row"
      disabled={opening}
      onClick={onOpen}
      aria-label={`打开群聊${group.name}`}
    >
      <span className="rn-joined-group-avatar" style={avatarStyle}>
        <span>{getRNAvatarInitial(group.name, '群')}</span>
        {group.avatarURL ? (
          <img
            src={group.avatarURL}
            alt=""
            loading="lazy"
            onError={event => { event.currentTarget.hidden = true; }}
          />
        ) : null}
      </span>
      <span className="rn-joined-group-row-body">
        <span className="rn-joined-group-texts">
          <strong>{group.name}</strong>
          <small>{description}</small>
          {group.introduction ? <small>{group.introduction}</small> : null}
        </span>
        {badges.length ? (
          <span className="rn-joined-group-badges">
            {badges.map(badge => (
              <em className={`is-${badge}`} key={badge}>
                {getJoinedGroupBadgeLabel(badge)}
              </em>
            ))}
          </span>
        ) : null}
        {opening ? <span className="rn-joined-group-row-spinner" /> : null}
      </span>
    </button>
  );
}
