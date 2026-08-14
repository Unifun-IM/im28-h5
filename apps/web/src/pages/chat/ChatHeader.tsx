import type { CSSProperties } from 'react';
import type { Conversation } from '@im28/im-sdk/web';
import { Link } from 'react-router-dom';

import backIconURL from '../../assets/rn/components/navbar/nav-arrow-left.svg';
import mutedIconURL from '../../assets/rn/assets/icons/imm28/bell-off.regular.svg';
import moreIconURL from '../../assets/rn/assets/icons/imm28/more-horiz.regular.svg';
import userIconURL from '../../assets/rn/assets/icons/imm28/user.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';
import { getConversationTitle } from '../conversations/conversation-list-view.js';
import type { ChatHeaderPresenceView } from './chat-header-presence-view.js';

/** RN chat detail header 只消费会话缓存中已存在的身份字段。 */
interface ChatHeaderProps {
  readonly conversation: Conversation | null;
  readonly presence: ChatHeaderPresenceView;
  readonly groupApplicationCount: number;
  readonly onOpenProfile: () => void;
  readonly onOpenGroupApplications: () => void;
}

/** 呈现 RN 头像、标题、静音状态和 React Router 返回入口。 */
export function ChatHeader({
  conversation,
  presence,
  groupApplicationCount,
  onOpenProfile,
  onOpenGroupApplications,
}: ChatHeaderProps) {
  // title 复用单聊匿名显示和群聊标题的唯一页面投影。
  const title = conversation ? getConversationTitle(conversation) : '会话';
  // identity 为 fallback 头像提供跨刷新稳定的颜色键。
  const identity = conversation?.targetID || title;
  // avatarStyle 复用 RN FNV-1a 渐变算法。
  const avatarStyle = {
    '--chat-avatar-gradient': getRNAvatarGradient(identity),
  } as CSSProperties;
  // canOpenProfile 与 RN 一致：群聊可打开群资料，单聊必须存在对端 ID。
  const canOpenProfile = Boolean(
    conversation && (conversation.type === 'group' || conversation.targetID),
  );
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

      <button
        className="rn-chat-header-profile"
        type="button"
        disabled={!canOpenProfile}
        aria-label={canOpenProfile
          ? conversation?.type === 'group' ? '群资料' : '查看对方资料'
          : undefined}
        onClick={onOpenProfile}
      >
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
          <span className="rn-chat-header-presence-row" aria-hidden={!presence.text}>
            {presence.dot !== 'none' ? (
              <span
                className={`rn-chat-header-presence-dot is-${presence.dot}`}
              />
            ) : null}
            <span className="rn-chat-header-meta">
              {presence.text || '\u00a0'}
            </span>
          </span>
        </span>
      </button>

      <span className="rn-chat-header-actions">
        {conversation?.type === 'group' && groupApplicationCount > 0 ? (
          <button
            className="rn-chat-header-group-applications"
            type="button"
            aria-label="入群申请"
            onClick={onOpenGroupApplications}
          >
            <RNAssetIcon assetURL={userIconURL} />
            <span>{groupApplicationCount > 99 ? '99+' : groupApplicationCount}</span>
          </button>
        ) : null}
        {conversation ? (
          <Link
            className="rn-chat-header-settings"
            to={`/conversations/${encodeURIComponent(conversation.conversationID)}/settings`}
            aria-label={conversation.type === 'group' ? '群聊设置' : '聊天设置'}
          >
            <RNAssetIcon assetURL={moreIconURL} />
          </Link>
        ) : null}
      </span>
    </header>
  );
}
