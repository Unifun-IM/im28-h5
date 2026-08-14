import type { CSSProperties } from 'react';
import type { WebIMGroupSearchItem } from '@im28/im-sdk/web';

import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';
import { splitContactSearchText } from './contact-search-view.js';
import type { ContactSearchLocalGroup } from './contact-search-view.js';

/** 联系人搜索群结果行参数。 */
interface ContactSearchGroupRowProps {
  readonly group: WebIMGroupSearchItem | ContactSearchLocalGroup;
  readonly keyword: string;
  readonly opening: boolean;
  readonly onOpen: () => void;
}

/** 渲染 RN 群搜索行及已加入、待审核、可申请三态。 */
export function ContactSearchGroupRow({
  group,
  keyword,
  opening,
  onOpen,
}: ContactSearchGroupRowProps) {
  /** isServerResult 区分服务器关系三态与本地已加入群快照。 */
  const isServerResult = 'title' in group;
  /** title 统一两种既有 DTO 的群展示名。 */
  const title = isServerResult ? group.title : group.name;
  /** avatarURL 统一两种既有 DTO 的群头像。 */
  const avatarURL = group.avatarURL;
  /** groupDescription 只投影 DTO 已提供的真实简介。 */
  const groupDescription = isServerResult ? group.description : group.introduction;
  /** status 将本地群的已加入事实映射为行展示状态。 */
  const status = isServerResult ? group.status : 'joined';
  /** avatarStyle 复用用户头像相同的稳定 hash 渐变。 */
  const avatarStyle = {
    '--contact-search-group-gradient': getRNAvatarGradient(group.groupID),
  } as CSSProperties;
  /** description 展示完整稳定群 ID 与真实成员数。 */
  const memberCount = 'memberCount' in group ? group.memberCount : 0;
  /** description 不为会话 fallback 推断成员数或群状态。 */
  const description = `${memberCount ? `${memberCount}人 · ` : ''}群ID：${group.groupID}`;
  /** disabled 只阻止待审核与正在解析会话的重复动作。 */
  const disabled = status === 'pending' || opening;
  return (
    <button
      type="button"
      className="rn-contact-search-group-row"
      disabled={disabled}
      aria-busy={opening}
      onClick={onOpen}
    >
      <span className="rn-contact-search-group-avatar" style={avatarStyle}>
          <span>{getRNAvatarInitial(title, '群')}</span>
        {avatarURL ? (
          <img src={avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} />
        ) : null}
      </span>
      <span className="rn-contact-search-user-body">
        <span className="rn-contact-search-text is-title">
          {splitContactSearchText(title, keyword).map((part, index) => (
            <span className={part.highlighted ? 'is-highlighted' : undefined} key={`${index}-${part.text}`}>
              {part.text}
            </span>
          ))}
        </span>
        <span className="rn-contact-search-text is-description">{description}</span>
        {groupDescription ? (
          <span className="rn-contact-search-text is-description">{groupDescription}</span>
        ) : null}
      </span>
      {status === 'available' ? <em>申请加入</em>
        : status === 'pending' ? <i>待通过</i>
          : opening ? <i>正在进入</i> : null}
    </button>
  );
}
