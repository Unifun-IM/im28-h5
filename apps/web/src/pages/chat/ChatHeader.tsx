import type { CSSProperties } from 'react';
import type { Conversation } from '@im28/im-sdk-web';
import { Link } from 'react-router-dom';

import backIconURL from '../../assets/rn/components/navbar/nav-arrow-left.svg';
import mutedIconURL from '../../assets/rn/assets/icons/imm28/bell-off.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';

/** RN chat detail header 只消费会话缓存中已存在的身份字段。 */
interface ChatHeaderProps {
  readonly conversation: Conversation | null;
}

/** 呈现 RN 头像、标题、静音状态和 React Router 返回入口。 */
export function ChatHeader({ conversation }: ChatHeaderProps) {
  // title 对齐 RN name -> target ID -> 会话的回退顺序。
  const title =
    conversation?.name?.trim() || conversation?.targetID || '会话';
  // identity 为 fallback 头像提供跨刷新稳定的颜色键。
  const identity = conversation?.targetID || title;
  // avatarStyle 复用 RN FNV-1a 渐变算法。
  const avatarStyle = {
    '--chat-avatar-gradient': getRNAvatarGradient(identity),
  } as CSSProperties;
  // meta 只展示现有 Conversation 可证明的群聊类型，不伪造 presence。
  const meta = conversation?.type === 'group' ? '群聊' : '';

  return (
    <header className="rn-chat-header">
      <span className="rn-chat-header-side">
        <Link
          className="rn-chat-header-back"
          to="/conversations"
          aria-label="返回会话"
        >
          <RNAssetIcon assetURL={backIconURL} />
        </Link>
      </span>

      <span className="rn-chat-header-profile">
        <span className="rn-chat-header-avatar" style={avatarStyle}>
          <span>
            {getRNAvatarInitial(
              title,
              conversation?.type === 'group' ? '群' : '?',
            )}
          </span>
          {conversation?.faceURL ? (
            <img
              src={conversation.faceURL}
              alt=""
              onError={event => {
                event.currentTarget.hidden = true;
              }}
            />
          ) : null}
        </span>
        <span className="rn-chat-header-copy">
          <span className="rn-chat-header-title-line">
            <strong>{title}</strong>
            {conversation?.isMuted ? (
              <RNAssetIcon
                assetURL={mutedIconURL}
                className="rn-chat-header-muted"
              />
            ) : null}
          </span>
          <span className="rn-chat-header-meta" aria-hidden={!meta}>
            {meta || '\u00a0'}
          </span>
        </span>
      </span>

      <span className="rn-chat-header-actions" aria-hidden="true" />
    </header>
  );
}
