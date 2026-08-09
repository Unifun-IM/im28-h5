import type { CSSProperties } from 'react';

import incomingTailDarkURL from '../../assets/rn/assets/icons/chat/bubbletail-left-dark.svg';
import incomingTailLightURL from '../../assets/rn/assets/icons/chat/bubbletail-left-light.svg';
import outgoingTailURL from '../../assets/rn/assets/icons/chat/bubbletail-right.svg';
import fileIconURL from '../../assets/rn/assets/icons/imm28/doc.svg';
import playIconURL from '../../assets/rn/assets/icons/imm28/play.solid.svg';
import speakIconURL from '../../assets/rn/assets/icons/imm28/speak.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';
import type { ChatMessageListEntry } from './chat-message-list-view.js';
import {
  formatChatMessageTime,
  type ChatMessageView,
} from './chat-message-view.js';

/** Chat 气泡只接收已完成日期与连续分组计算的消息条目。 */
interface ChatMessageBubbleProps {
  readonly entry: Extract<ChatMessageListEntry, { readonly kind: 'message' }>;
  readonly isGroup: boolean;
}

/** 按 RN direction/group/status 结构呈现单条消息。 */
export function ChatMessageBubble({
  entry,
  isGroup,
}: ChatMessageBubbleProps) {
  // message 缩短模板内领域字段访问路径。
  const { message, view } = entry;
  if (view.kind === 'system') {
    return <p className="rn-chat-system-message">{view.text}</p>;
  }
  // mine 决定气泡方向、主题色与发送状态位置。
  const mine = message.direction === 'outgoing';
  // rowClassName 固定 RN 四态连续圆角类。
  const rowClassName = `rn-chat-message-row is-${message.direction} group-${entry.groupPosition}`;
  // avatarStyle 为群成员 senderID 生成 RN fallback 颜色。
  const avatarStyle = {
    '--chat-sender-avatar-gradient': getRNAvatarGradient(message.senderID),
  } as CSSProperties;

  return (
    <article className={rowClassName}>
      {!mine && isGroup ? (
        entry.showSenderAvatar ? (
          <span className="rn-chat-sender-avatar" style={avatarStyle}>
            {getRNAvatarInitial(message.senderID)}
          </span>
        ) : (
          <span className="rn-chat-sender-avatar-placeholder" />
        )
      ) : null}

      <span className="rn-chat-message-column">
        {!mine && entry.showSenderName ? (
          <span className="rn-chat-sender-name">{message.senderID}</span>
        ) : null}
        <span className="rn-chat-message-line">
          {mine ? <OutgoingMessageStatus status={message.status} /> : null}
          <span className="rn-chat-bubble">
            <ChatMessageContent view={view} mine={mine} />
            <time>{formatChatMessageTime(message.sendTime)}</time>
            {entry.groupPosition === 'single' ||
            entry.groupPosition === 'last' ? (
              <ChatBubbleTail mine={mine} />
            ) : null}
          </span>
        </span>
      </span>
    </article>
  );
}

/** 以静态 RN 状态图形呈现 sending/failed，不伪造重试操作。 */
function OutgoingMessageStatus({
  status,
}: {
  readonly status: ChatMessageBubbleProps['entry']['message']['status'];
}) {
  if (status === 'sending' || status === 'pending') {
    return (
      <span
        className="rn-chat-message-status is-sending"
        role="status"
        aria-label="发送中"
      />
    );
  }
  if (status === 'failed') {
    return (
      <span
        className="rn-chat-message-status is-failed"
        role="status"
        aria-label="发送失败"
      >
        !
      </span>
    );
  }
  return null;
}

/** 根据已收窄 view 呈现文本与只读媒体快照。 */
function ChatMessageContent({
  view,
  mine,
}: {
  readonly view: ChatMessageView;
  readonly mine: boolean;
}) {
  if (view.kind === 'image') {
    return view.thumbnailURL || view.mediaURL ? (
      <img
        className="rn-chat-media-image"
        src={view.thumbnailURL || view.mediaURL}
        alt="图片消息"
      />
    ) : (
      <span className="rn-chat-message-text">{view.text}</span>
    );
  }
  if (view.kind === 'video') {
    return (
      <span className="rn-chat-video-content" aria-label="视频消息">
        {view.thumbnailURL ? (
          <img src={view.thumbnailURL} alt="" />
        ) : (
          <span className="rn-chat-video-placeholder" />
        )}
        <span className="rn-chat-play-badge">
          <RNAssetIcon assetURL={playIconURL} />
        </span>
        {view.detail ? <span>{view.detail}</span> : null}
      </span>
    );
  }
  if (view.kind === 'audio') {
    return (
      <span className="rn-chat-audio-content">
        <RNAssetIcon assetURL={speakIconURL} />
        <span>{view.detail || '0:00'}</span>
      </span>
    );
  }
  if (view.kind === 'file') {
    return (
      <span className="rn-chat-file-content">
        <span className="rn-chat-file-copy">
          <strong>{view.text}</strong>
          {view.detail ? <span>{view.detail}</span> : null}
        </span>
        <span className="rn-chat-file-icon">
          <img src={fileIconURL} width="30" height="34" alt="" />
        </span>
      </span>
    );
  }
  if (view.kind === 'card') {
    // avatarStyle 以真实卡片身份生成无图片时的 RN fallback。
    const avatarStyle = {
      '--chat-card-avatar-gradient': getRNAvatarGradient(
        view.detail || view.text,
      ),
    } as CSSProperties;
    return (
      <span className="rn-chat-card-content">
        <span className="rn-chat-card-avatar" style={avatarStyle}>
          {getRNAvatarInitial(view.text)}
          {view.mediaURL ? <img src={view.mediaURL} alt="" /> : null}
        </span>
        <span>
          <strong>{view.text}</strong>
          {view.detail ? <small>{view.detail}</small> : null}
        </span>
      </span>
    );
  }
  if (view.kind === 'emoji' && view.mediaURL) {
    return <img className="rn-chat-emoji-content" src={view.mediaURL} alt="表情" />;
  }
  return (
    <>
      {view.detail ? (
        <span className={`rn-chat-quote${mine ? ' is-mine' : ''}`}>
          {view.detail}
        </span>
      ) : null}
      <span
        className={`rn-chat-message-text${
          view.kind === 'unsupported' ? ' is-unsupported' : ''
        }`}
      >
        {view.text}
      </span>
    </>
  );
}

/** 使用 RN 原始 SVG 呈现气泡尾部并随明暗主题切换。 */
function ChatBubbleTail({ mine }: { readonly mine: boolean }) {
  if (mine) {
    return (
      <RNAssetIcon assetURL={outgoingTailURL} className="rn-chat-tail is-mine" />
    );
  }
  return (
    <span className="rn-chat-tail is-peer">
      <img className="light-only" src={incomingTailLightURL} alt="" />
      <img className="dark-only" src={incomingTailDarkURL} alt="" />
    </span>
  );
}
