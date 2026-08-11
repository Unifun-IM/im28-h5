import type { CSSProperties } from 'react';
import {
  canEditWebIMTextMessage,
  canForwardWebIMMessage,
  canRetryWebIMMessage,
  type Message,
} from '@im28/im-sdk/web';

import incomingTailDarkURL from '../../assets/rn/assets/icons/chat/bubbletail-left-dark.svg';
import incomingTailLightURL from '../../assets/rn/assets/icons/chat/bubbletail-left-light.svg';
import outgoingTailURL from '../../assets/rn/assets/icons/chat/bubbletail-right.svg';
import checkIconURL from '../../assets/rn/assets/icons/imm28/check-circle.solid.svg';
import circleIconURL from '../../assets/rn/assets/icons/imm28/circle.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';
import { ChatMessageContent } from './ChatMessageContent.js';
import { ChatForwardOrigin } from './ChatForwardOrigin.js';
import { ChatMessageAction } from './ChatMessageAction.js';
import type { ChatMessageListEntry } from './chat-message-list-view.js';
import type { ChatMessageView } from './chat-message-view.js';
import { formatChatMessageTimeText } from './chat-message-edit-view.js';
import type { ChatQuoteSourceView } from './chat-quote-view.js';
import { canQuoteChatMessage } from './chat-quote-view.js';

/** Chat 气泡只接收已完成日期与连续分组计算的消息条目。 */
interface ChatMessageBubbleProps {
  readonly entry: Extract<ChatMessageListEntry, { readonly kind: 'message' }>;
  readonly isGroup: boolean;
  readonly customEmojiActionDisabled: boolean;
  readonly onAddCustomEmoji: (emojiID: string) => Promise<boolean>;
  readonly retryDisabled: boolean;
  readonly onRetryMessage: (clientMsgID: string) => Promise<void>;
  readonly quoteSource: ChatQuoteSourceView | null;
  readonly onQuoteMessage: (message: Message) => void;
  readonly onCopyMessage: (view: ChatMessageView) => Promise<boolean>;
  readonly onOpenQuotedMessage: (message: Message) => void;
  readonly multiSelecting: boolean;
  readonly selected: boolean;
  readonly onToggleSelection: (message: Message) => void;
  readonly onForwardMessage: (message: Message) => void;
  readonly onBeginMultiSelect: (message: Message) => void;
  readonly onDeleteMessage: (message: Message) => void;
  readonly onEditMessage: (message: Message) => void;
}

/** 按 RN direction/group/status 结构呈现单条消息。 */
export function ChatMessageBubble({
  entry,
  isGroup,
  customEmojiActionDisabled,
  onAddCustomEmoji,
  retryDisabled,
  onRetryMessage,
  quoteSource,
  onQuoteMessage,
  onCopyMessage,
  onOpenQuotedMessage,
  multiSelecting,
  selected,
  onToggleSelection,
  onForwardMessage,
  onBeginMultiSelect,
  onDeleteMessage,
  onEditMessage,
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
  // forwardAllowed 复用 shared 来源 guard 控制动作和多选按钮。
  const forwardAllowed = canForwardWebIMMessage(message);
  // bubble 保持多选态与普通动作态共用同一消息内容 DOM。
  const bubble = (
    <span className="rn-chat-bubble">
      {message.forwardOrigin ? (
        <ChatForwardOrigin origin={message.forwardOrigin} mine={mine} />
      ) : null}
      <ChatMessageContent
        view={view}
        messageID={message.clientMsgID}
        mine={mine}
        quoteSource={quoteSource}
        onOpenQuotedMessage={onOpenQuotedMessage}
      />
      <time>{formatChatMessageTimeText(message)}</time>
      {entry.groupPosition === 'single' || entry.groupPosition === 'last' ? (
        <ChatBubbleTail mine={mine} />
      ) : null}
    </span>
  );

  return (
    <article
      className={`${rowClassName}${multiSelecting ? ' is-multi-selecting' : ''}`}
      data-client-message-id={message.clientMsgID}
      data-server-message-id={message.serverMsgID ?? ''}
    >
      {multiSelecting ? (
        <button
          type="button"
          className="rn-chat-message-selector"
          disabled={!forwardAllowed}
          aria-label={selected ? '取消选择消息' : '选择消息'}
          onClick={() => onToggleSelection(message)}
        >
          <RNAssetIcon assetURL={selected ? checkIconURL : circleIconURL} />
        </button>
      ) : null}
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
          {mine ? (
            <OutgoingMessageStatus
              message={message}
              disabled={retryDisabled}
              onRetry={onRetryMessage}
            />
          ) : null}
          {multiSelecting ? bubble : (
            <ChatMessageAction
              quoteDisabled={!canQuoteChatMessage(message, view)}
              addDisabled={customEmojiActionDisabled}
              forwardDisabled={!forwardAllowed}
              editAllowed={canEditWebIMTextMessage(message)}
              {...(view.kind === 'emoji' ? { emojiID: view.emojiID ?? '' } : {})}
              onQuote={() => onQuoteMessage(message)}
              onCopy={() => onCopyMessage(view)}
              onAddCustomEmoji={onAddCustomEmoji}
              onForward={() => onForwardMessage(message)}
              onEdit={() => onEditMessage(message)}
              onBeginMultiSelect={() => onBeginMultiSelect(message)}
              onDelete={() => onDeleteMessage(message)}
            >
              {bubble}
            </ChatMessageAction>
          )}
        </span>
      </span>
    </article>
  );
}

/** 按 shared capability 将可恢复 failed 状态呈现为 RN 重试按钮。 */
function OutgoingMessageStatus({
  message,
  disabled,
  onRetry,
}: {
  readonly message: ChatMessageBubbleProps['entry']['message'];
  readonly disabled: boolean;
  readonly onRetry: (clientMsgID: string) => Promise<void>;
}) {
  // status 缩短状态分支并保持消息实体完整传给 capability owner。
  const { status } = message;
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
    if (canRetryWebIMMessage(message)) {
      return (
        <button
          className="rn-chat-message-status is-failed is-action"
          type="button"
          disabled={disabled}
          aria-label="重新发送消息"
          onClick={() => void onRetry(message.clientMsgID)}
        >
          !
        </button>
      );
    }
    return (
      <span
        className="rn-chat-message-status is-failed"
        role="status"
        aria-label="发送失败，无法直接重试"
      >
        !
      </span>
    );
  }
  return null;
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
