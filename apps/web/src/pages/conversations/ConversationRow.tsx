import type { CSSProperties } from 'react';
import type { WebIMConversationListItem } from '@im28/im-sdk/web';
import { Link } from 'react-router-dom';

import bellOffIconURL from '../../assets/rn/assets/icons/imm28/bell-off.solid.svg';
import pinIconURL from '../../assets/rn/assets/icons/imm28/pin.solid.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PresetEmojiTextContent } from '../chat/PresetEmojiTextContent.js';
import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';
import {
  formatConversationListTime,
  formatConversationUnread,
  getConversationDisplayPreview,
  getConversationTitle,
} from './conversation-list-view.js';

/** RN 会话行只接收 Web SDK 已组合的稳定缓存项。 */
interface ConversationRowProps {
  readonly item: WebIMConversationListItem;
}

/** 渲染 RN 72px 会话行及其头像、摘要、时间和未读状态。 */
export function ConversationRow({ item }: ConversationRowProps) {
  // conversation 缩短模板内领域字段访问路径。
  const { conversation, latestMessage } = item;
  // title 使用 RN name -> target ID 回退语义。
  const title = getConversationTitle(conversation);
  // preview 已在纯 helper 中处理草稿和静音前缀。
  const preview = getConversationDisplayPreview(item);
  // unread 保证 badge 不出现负值或小数。
  const unread = Math.max(0, Math.trunc(conversation.unreadCount));
  // avatarStyle 复用 RN fallback 渐变算法。
  const avatarStyle = {
    '--conversation-avatar-gradient': getRNAvatarGradient(
      conversation.targetID || title,
    ),
  } as CSSProperties;

  return (
    <Link
      className={`rn-conversation-row${conversation.isPinned ? ' is-pinned' : ''}`}
      to={`/conversations/${encodeURIComponent(conversation.conversationID)}`}
      aria-label={`打开与${title}的会话`}
    >
      <span className="rn-conversation-avatar" style={avatarStyle}>
        <span className="rn-conversation-avatar-fallback">
          {getRNAvatarInitial(title)}
        </span>
        {conversation.faceURL ? (
          <img
            src={conversation.faceURL}
            alt=""
            loading="lazy"
            onError={event => {
              event.currentTarget.hidden = true;
            }}
          />
        ) : null}
      </span>

      <span className="rn-conversation-row-body">
        <span className="rn-conversation-row-top">
          <strong>{title}</strong>
          {conversation.isPinned ? (
            <RNAssetIcon
              assetURL={pinIconURL}
              className="rn-conversation-pin"
            />
          ) : null}
          <time>
            {formatConversationListTime(
              latestMessage?.sendTime ?? conversation.updatedAt,
            )}
          </time>
        </span>
        <span className="rn-conversation-row-bottom">
          <span className="rn-conversation-preview">
            {preview.isDraft ? (
              <span className="rn-conversation-draft">[草稿]</span>
            ) : null}
            <PresetEmojiTextContent
              text={preview.text}
              entities={preview.entities}
              singleLine
            />
          </span>
          {conversation.isMuted ? (
            <RNAssetIcon
              assetURL={bellOffIconURL}
              className="rn-conversation-muted"
            />
          ) : null}
          {unread > 0 ? (
            conversation.isMuted ? (
              <span
                className="rn-conversation-unread-dot"
                aria-label={`${unread} 条未读`}
              />
            ) : (
              <span
                className="rn-conversation-unread-badge"
                aria-label={`${unread} 条未读`}
              >
                {formatConversationUnread(unread)}
              </span>
            )
          ) : null}
        </span>
      </span>
    </Link>
  );
}
