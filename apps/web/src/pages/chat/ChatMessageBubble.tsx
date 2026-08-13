import {
  canEditWebIMTextMessage,
  canForwardWebIMMessage,
  canRetryWebIMMessage,
  reconcilePresetEmojiEntitiesAfterTextChange,
  type Message,
  type WebIMGroupMember,
} from '@im28/im-sdk/web';

import incomingTailDarkURL from '../../assets/rn/assets/icons/chat/bubbletail-left-dark.svg';
import incomingTailLightURL from '../../assets/rn/assets/icons/chat/bubbletail-left-light.svg';
import outgoingTailURL from '../../assets/rn/assets/icons/chat/bubbletail-right.svg';
import checkIconURL from '../../assets/rn/assets/icons/imm28/check-circle.solid.svg';
import circleIconURL from '../../assets/rn/assets/icons/imm28/circle.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { ChatMessageContent } from './ChatMessageContent.js';
import { ChatForwardOrigin } from './ChatForwardOrigin.js';
import { ChatGroupSenderAvatar } from './ChatGroupSenderAvatar.js';
import { ChatMessageShatterParticles } from './ChatMessageShatterParticles.js';
import { ChatMessageAction } from './ChatMessageAction.js';
import type { ChatMessageListEntry } from './chat-message-list-view.js';
import type { ChatMessageView } from './chat-message-view.js';
import { formatChatMessageTimeText } from './chat-message-edit-view.js';
import type { ChatQuoteSourceView } from './chat-quote-view.js';
import { canQuoteChatMessage } from './chat-quote-view.js';
import {
  getChatGroupSenderView,
  resolveChatMentionDisplayText,
} from './chat-group-message-view.js';
import { getChatAudioBubbleWidth } from './chat-media-layout.js';

/** Chat 气泡只接收已完成日期与连续分组计算的消息条目。 */
interface ChatMessageBubbleProps {
  readonly entry: Extract<ChatMessageListEntry, { readonly kind: 'message' }>;
  readonly isGroup: boolean;
  readonly conversationID: string;
  readonly membersByID: ReadonlyMap<string, WebIMGroupMember>;
  readonly customEmojiActionDisabled: boolean;
  readonly onAddCustomEmoji: (emojiID: string) => Promise<boolean>;
  readonly retryDisabled: boolean;
  readonly onRetryMessage: (clientMsgID: string) => Promise<void>;
  readonly quoteSource: ChatQuoteSourceView | null;
  readonly onQuoteMessage: (message: Message) => void;
  readonly onCopyMessage: (view: ChatMessageView) => Promise<boolean>;
  readonly onCopyLink: (url: string) => Promise<boolean>;
  readonly onOpenQuotedMessage: (message: Message) => void;
  readonly multiSelecting: boolean;
  readonly selected: boolean;
  readonly onToggleSelection: (message: Message) => void;
  readonly onForwardMessage: (message: Message) => void;
  readonly onBeginMultiSelect: (message: Message) => void;
  readonly onDeleteMessage: (message: Message) => void;
  readonly onEditMessage: (message: Message) => void;
  readonly onMentionGroupMember: (member: WebIMGroupMember) => void;
  readonly exiting: boolean;
  readonly onExitComplete: (clientMsgID: string) => void;
}

/** 按 RN direction/group/status 结构呈现单条消息。 */
export function ChatMessageBubble({
  entry,
  isGroup,
  conversationID,
  membersByID,
  customEmojiActionDisabled,
  onAddCustomEmoji,
  retryDisabled,
  onRetryMessage,
  quoteSource,
  onQuoteMessage,
  onCopyMessage,
  onCopyLink,
  onOpenQuotedMessage,
  multiSelecting,
  selected,
  onToggleSelection,
  onForwardMessage,
  onBeginMultiSelect,
  onDeleteMessage,
  onEditMessage,
  onMentionGroupMember,
  exiting,
  onExitComplete,
}: ChatMessageBubbleProps) {
  // message 缩短模板内领域字段访问路径。
  const { message, view } = entry;
  if (view.kind === 'system') {
    return (
      <p
        className={`rn-chat-system-message${exiting ? ' is-shattering' : ''}`}
        data-client-message-id={message.clientMsgID}
        data-server-message-id={message.serverMsgID ?? ''}
        onAnimationEnd={event => {
          if (event.currentTarget === event.target) onExitComplete(message.clientMsgID);
        }}
      >
        <span>{view.text}</span>
        {exiting ? <ChatMessageShatterParticles /> : null}
      </p>
    );
  }
  // mine 决定气泡方向、主题色与发送状态位置。
  const mine = message.direction === 'outgoing';
  // rowClassName 固定 RN 四态连续圆角类。
  const rowClassName = `rn-chat-message-row is-${message.direction} group-${entry.groupPosition}`;
  // forwardAllowed 复用 shared 来源 guard 控制动作和多选按钮。
  const forwardAllowed = canForwardWebIMMessage(message);
  // senderView 复用 SDK 群成员名称、头像和角色投影。
  const senderView = getChatGroupSenderView(message, membersByID);
  // senderMember 是允许长按提及的当前群真实成员。
  const senderMember = membersByID.get(senderView.userID);
  // senderInsideBubble 对齐 RN：普通媒体名称在上方，其余名称属于气泡内容。
  const senderInsideBubble = !mine && isGroup && entry.showSenderName &&
    (Boolean(message.forwardOrigin) || (view.kind !== 'image' && view.kind !== 'video'));
  // senderOutsideBubble 仅用于 RN 图片与视频的媒体标题行。
  const senderOutsideBubble = !mine && isGroup && entry.showSenderName &&
    !message.forwardOrigin && (view.kind === 'image' || view.kind === 'video');
  // displayView 只替换可见 mention 文本，不改变持久化身份或正文。
  const displayView: ChatMessageView = view.kind === 'text' && isGroup
    ? (() => {
        /** text 是按当前群成员快照解析后的页面文案。 */
        const text = resolveChatMentionDisplayText(message, view.text, membersByID);
        if (text === view.text) return view;
        /** document 复用 SDK 的 UTF-16 entity 偏移校正，避免昵称替换破坏表情。 */
        const document = reconcilePresetEmojiEntitiesAfterTextChange(
          { text: view.text, entities: view.entities ?? [] },
          text,
        );
        return {
          kind: 'text' as const,
          text: document.text,
          ...(document.entities.length ? { entities: document.entities } : {}),
        };
      })()
    : view;
  // bubbleStyle 仅为语音应用 RN 时长宽度，其他消息保持内容自适应。
  const bubbleStyle = view.kind === 'audio'
    ? { width: getChatAudioBubbleWidth(view.durationSeconds) }
    : undefined;
  // senderIdentity 在气泡内外共用同一名称和角色结构。
  const senderIdentity = (
    <span className="rn-chat-sender-identity">
      <span>{senderView.displayName}</span>
      {senderView.roleLabel ? (
        <small>{senderView.roleLabel}</small>
      ) : null}
    </span>
  );
  // bubble 保持多选态与普通动作态共用同一消息内容 DOM。
  const bubble = (
    <span className="rn-chat-bubble" style={bubbleStyle}>
      {senderInsideBubble ? senderIdentity : null}
      {message.forwardOrigin ? (
        <ChatForwardOrigin origin={message.forwardOrigin} mine={mine} />
      ) : null}
      <ChatMessageContent
        view={displayView}
        message={message}
        mine={mine}
        quoteSource={quoteSource}
        onOpenQuotedMessage={onOpenQuotedMessage}
        onCopyLink={onCopyLink}
      />
      <time>{formatChatMessageTimeText(message)}</time>
      {entry.groupPosition === 'single' || entry.groupPosition === 'last' ? (
        <ChatBubbleTail mine={mine} />
      ) : null}
    </span>
  );

  return (
    <article
      className={`${rowClassName}${multiSelecting ? ' is-multi-selecting' : ''}${exiting ? ' is-shattering' : ''}`}
      data-client-message-id={message.clientMsgID}
      data-server-message-id={message.serverMsgID ?? ''}
      onAnimationEnd={event => {
        if (event.currentTarget === event.target) onExitComplete(message.clientMsgID);
      }}
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
          <ChatGroupSenderAvatar
            conversationID={conversationID}
            senderView={senderView}
            {...(senderMember ? { senderMember } : {})}
            onMention={onMentionGroupMember}
          />
        ) : (
          <span className="rn-chat-sender-avatar-placeholder" />
        )
      ) : null}

      <span className="rn-chat-message-column">
        {senderOutsideBubble ? (
          <span className="rn-chat-sender-name">{senderIdentity}</span>
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
      {exiting ? <ChatMessageShatterParticles /> : null}
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
