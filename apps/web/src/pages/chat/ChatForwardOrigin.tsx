import type { CSSProperties } from 'react';
import type { ForwardOrigin } from '@im28/im-sdk/web';

import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import './chat-forward.css';

/** 转发来源头仅消费 SDK 已归一化的服务端用户快照。 */
interface ChatForwardOriginProps {
  readonly origin: ForwardOrigin;
  readonly mine: boolean;
}

/** 对齐 RN 气泡内“转发自 + 头像 + 名称”结构。 */
export function ChatForwardOrigin({ origin, mine }: ChatForwardOriginProps) {
  // displayName 优先服务端来源昵称并以稳定用户 ID 回退。
  const displayName = origin.name?.trim() || origin.userID || '未知用户';
  // avatarStyle 仅在图片不可用时呈现稳定 RN fallback。
  const avatarStyle = {
    '--forward-origin-avatar-gradient': getRNAvatarGradient(origin.userID),
  } as CSSProperties;
  return (
    <span className={`rn-chat-forward-origin${mine ? ' is-mine' : ''}`} aria-label={`转发自${displayName}`}>
      <small>转发自</small>
      <span className="rn-chat-forward-origin-user">
        <span className="rn-chat-forward-origin-avatar" style={avatarStyle}>
          <span>{getRNAvatarInitial(displayName)}</span>
          {origin.avatarURL ? <img src={origin.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}
        </span>
        <strong>{displayName}</strong>
      </span>
    </span>
  );
}
