import type { Message } from '@im28/im-sdk/web';

import { ChatCardMessageContent } from './ChatCardMessageContent.js';
import { ChatCustomEmojiMessageContent } from './ChatCustomEmojiMessageContent.js';
import {
  ChatMediaMessageContent,
  isChatMediaMessageView,
} from './ChatMediaMessageContent.js';
import { ChatTextMessageContent } from './ChatTextMessageContent.js';
import type { ChatMessageView } from './chat-message-view.js';
import type { ChatQuoteSourceView } from './chat-quote-view.js';
import './chat-message-content.css';

/** 消息正文接收已收窄的展示模型和显式动作。 */
interface ChatMessageContentProps {
  readonly view: ChatMessageView;
  readonly message: Message;
  readonly mine: boolean;
  readonly quoteSource: ChatQuoteSourceView | null;
  readonly onOpenQuotedMessage: (message: Message) => void;
  readonly onCopyLink: (url: string) => Promise<boolean>;
  readonly onStartCall?: (mediaType: 'audio' | 'video') => void;
  readonly onOpenCard?: (view: ChatMessageView) => void;
}

/** 根据展示模型呈现文本、媒体、文件、名片和表情内容。 */
export function ChatMessageContent({
  view,
  message,
  mine,
  quoteSource,
  onOpenQuotedMessage,
  onCopyLink,
  onStartCall,
  onOpenCard,
}: ChatMessageContentProps) {
  if (isChatMediaMessageView(view)) {
    return (
      <ChatMediaMessageContent
        view={view}
        message={message}
        mine={mine}
        {...(onStartCall ? { onStartCall } : {})}
      />
    );
  }
  if (view.kind === 'card') {
    return <ChatCardMessageContent view={view} {...(onOpenCard ? { onOpen: onOpenCard } : {})} />;
  }
  if (view.kind === 'emoji') return <ChatCustomEmojiMessageContent view={view} />;
  return (
    <ChatTextMessageContent
      view={view}
      mine={mine}
      quoteSource={quoteSource}
      onOpenQuotedMessage={onOpenQuotedMessage}
      onCopyLink={onCopyLink}
    />
  );
}
