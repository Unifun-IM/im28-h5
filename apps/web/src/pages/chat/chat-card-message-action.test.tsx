import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { ChatMediaInteractionProvider } from './ChatMediaInteractionProvider.js';
import { ChatMessageContent } from './ChatMessageContent.js';
import type { ChatMessageView } from './chat-message-view.js';

/** cardView 固定群名片的协议身份和可见快照。 */
const cardView: ChatMessageView = {
  kind: 'card',
  text: '测试群聊',
  detail: 'group-1',
  cardKind: 'group',
  cardTargetID: 'group-1',
};

/** message 保留渲染正文所需的最小真实 Message 字段。 */
const message = {
  clientMsgID: 'card-message-1',
  conversationID: 'conversation-1',
  senderID: 'user-1',
  direction: 'incoming' as const,
  contentType: 108,
  payload: {},
  sendTime: 1,
  status: 'sent' as const,
};

describe('ChatMessageContent 名片动作', () => {
  /** 有 targetID 和页面动作时，名片必须保持可点击按钮语义。 */
  it('将群名片呈现为资料入口', () => {
    /** markup 验证 SSR 下稳定的按钮和可访问名称。 */
    const markup = renderToStaticMarkup(
      <ChatMediaInteractionProvider
        userID="user-2"
        conversationID="conversation-1"
        messages={[]}
        isGroup
      >
        <ChatMessageContent
          view={cardView}
          message={message}
          mine={false}
          quoteSource={null}
          onOpenQuotedMessage={vi.fn()}
          onCopyLink={vi.fn(async () => true)}
          onOpenCard={vi.fn()}
        />
      </ChatMediaInteractionProvider>,
    );
    expect(markup).toContain('<button');
    expect(markup).toContain('aria-label="查看测试群聊的群聊卡片"');
    expect(markup).not.toContain('disabled=""');
  });
});
