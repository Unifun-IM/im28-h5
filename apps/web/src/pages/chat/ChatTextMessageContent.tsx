import type { Message } from '@im28/im-sdk/web';

import type { ChatMessageView } from './chat-message-view.js';
import type { ChatQuoteSourceView } from './chat-quote-view.js';
import {
  isSinglePresetEmojiText,
  PresetEmojiTextContent,
} from './PresetEmojiTextContent.js';

/** 文本消息族只接收既有展示模型和页面动作。 */
interface ChatTextMessageContentProps {
  readonly view: ChatMessageView;
  readonly mine: boolean;
  readonly quoteSource: ChatQuoteSourceView | null;
  readonly onOpenQuotedMessage: (message: Message) => void;
  readonly onCopyLink: (url: string) => Promise<boolean>;
}

/** 呈现引用、普通文本、系统提示和不支持消息。 */
export function ChatTextMessageContent(props: ChatTextMessageContentProps) {
  if (props.view.kind === 'quote') {
    return <ChatQuoteMessageContent {...props} />;
  }
  if (props.view.kind === 'text') {
    return <ChatPlainTextMessageContent {...props} />;
  }
  return <ChatFallbackTextMessageContent {...props} />;
}

/** 呈现可定位来源的 RN 引用预览和回复正文。 */
function ChatQuoteMessageContent({
  view,
  mine,
  quoteSource,
  onOpenQuotedMessage,
}: ChatTextMessageContentProps) {
  /** sourceText 优先显示当前缓存来源，窗口外回退发送时快照。 */
  const sourceText = quoteSource?.text || view.detail || '引用消息';
  /** sourceLabel 仅在真实来源已解析时展示，禁止猜测发送者。 */
  const sourceLabel = quoteSource?.label ? `${quoteSource.label}: ` : '';
  return (
    <>
      <button
        className={`rn-chat-quote${mine ? ' is-mine' : ''}`}
        type="button"
        disabled={!quoteSource?.message || quoteSource.deleted}
        onClick={() => {
          if (quoteSource?.message && !quoteSource.deleted) {
            onOpenQuotedMessage(quoteSource.message);
          }
        }}
      >
        {sourceLabel}{sourceText}
      </button>
      <span className="rn-chat-message-text">{view.text}</span>
    </>
  );
}

/** 使用统一实体 renderer 呈现普通文本、链接和大表情。 */
function ChatPlainTextMessageContent({
  view,
  onCopyLink,
}: ChatTextMessageContentProps) {
  /** largeEmoji 只在一个合法实体完整覆盖正文时生效。 */
  const largeEmoji = isSinglePresetEmojiText(view.text, view.entities);
  return (
    <PresetEmojiTextContent
      text={view.text}
      entities={view.entities}
      className="rn-chat-message-text"
      largeEmoji={largeEmoji}
      onCopyLink={onCopyLink}
    />
  );
}

/** 呈现系统消息和无法识别协议的稳定降级文案。 */
function ChatFallbackTextMessageContent({
  view,
  mine,
}: ChatTextMessageContentProps) {
  return (
    <>
      {view.detail ? (
        <span className={`rn-chat-quote${mine ? ' is-mine' : ''}`}>{view.detail}</span>
      ) : null}
      <span className={`rn-chat-message-text${view.kind === 'unsupported' ? ' is-unsupported' : ''}`}>
        {view.text}
      </span>
    </>
  );
}
