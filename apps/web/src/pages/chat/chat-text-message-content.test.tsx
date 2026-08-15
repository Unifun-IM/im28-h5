import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { ChatTextMessageContent } from './ChatTextMessageContent.js';
import type { ChatMessageView } from './chat-message-view.js';
import type { ChatQuoteSourceView } from './chat-quote-view.js';

/** sourceMessage 保留引用跳转所需的最小真实消息字段。 */
const sourceMessage = {
  clientMsgID: 'source-1',
  conversationID: 'conversation-1',
  senderID: 'user-1',
  direction: 'incoming' as const,
  contentType: 101,
  payload: {},
  sendTime: 1,
  status: 'sent' as const,
};

/** 使用默认动作渲染指定文本展示模型。 */
function renderTextView(
  view: ChatMessageView,
  quoteSource: ChatQuoteSourceView | null = null,
): string {
  return renderToStaticMarkup(
    <ChatTextMessageContent
      view={view}
      mine={false}
      quoteSource={quoteSource}
      onOpenQuotedMessage={vi.fn()}
      onCopyLink={vi.fn(async () => true)}
    />,
  );
}

describe('ChatTextMessageContent', () => {
  /** 引用预览继续显示已解析发送者、来源正文和回复正文。 */
  it('renders the existing quote source contract', () => {
    /** quoteSource 模拟当前缓存窗口已解析来源。 */
    const quoteSource: ChatQuoteSourceView = {
      message: sourceMessage,
      label: 'donk',
      text: '原消息',
      deleted: false,
    };
    /** markup 锁定 RN 引用标题和回复正文的 DOM 语义。 */
    const markup = renderTextView(
      { kind: 'quote', text: '回复正文', detail: '发送时快照' },
      quoteSource,
    );
    expect(markup).toContain('>donk: 原消息</button>');
    expect(markup).toContain('<span class="rn-chat-message-text">回复正文</span>');
    expect(markup).not.toContain('disabled=""');
  });

  /** 已删除来源保持不可点击并显示权威删除文案。 */
  it('disables deleted quote sources', () => {
    /** deletedSource 模拟 shared quote owner 标记的已删除来源。 */
    const deletedSource: ChatQuoteSourceView = {
      label: '',
      text: '引用的内容已删除',
      deleted: true,
    };
    const markup = renderTextView(
      { kind: 'quote', text: '回复正文' },
      deletedSource,
    );
    expect(markup).toContain('disabled=""');
    expect(markup).toContain('引用的内容已删除');
  });

  /** 普通文本继续复用统一链接和 preset emoji renderer。 */
  it('renders text through the existing entity renderer', () => {
    const markup = renderTextView({ kind: 'text', text: '访问 www.example.com' });
    expect(markup).toContain('aria-label="打开链接 www.example.com"');
    expect(markup).toContain('rn-preset-emoji-text rn-chat-message-text');
  });

  /** 不支持消息保留 detail 与显式降级样式。 */
  it('renders unsupported messages as a visible fallback', () => {
    const markup = renderTextView({
      kind: 'unsupported',
      text: '[暂不支持的消息 · 999]',
      detail: '原始摘要',
    });
    expect(markup).toContain('class="rn-chat-quote">原始摘要</span>');
    expect(markup).toContain('rn-chat-message-text is-unsupported');
  });
});
