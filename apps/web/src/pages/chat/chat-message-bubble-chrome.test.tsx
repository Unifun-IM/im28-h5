import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { Message } from '@im28/im-sdk/web';

import bubbleSource from './ChatMessageBubble.tsx?raw';
import chromeSource from './ChatMessageBubbleChrome.tsx?raw';
import {
  ChatBubbleTail,
  OutgoingMessageStatus,
} from './ChatMessageBubbleChrome.js';

/** 创建仅覆盖发送状态装饰所需字段的消息实体。 */
function createMessage(status: Message['status'], contentType = 101): Message {
  return {
    clientMsgID: 'client-1',
    serverMsgID: '',
    conversationID: 'conversation-1',
    senderID: 'user-1',
    receiverID: 'user-2',
    direction: 'outgoing',
    contentType,
    content: 'hello',
    payload: { text: { text: 'hello' } },
    status,
    sendTime: 1,
  } as Message;
}

/** 气泡 chrome owner 防止状态与尾角资源重新回流到消息编排组件。 */
describe('chat message bubble chrome', () => {
  /** sending 与 pending 继续呈现同一无交互状态标识。 */
  it.each(['sending', 'pending'] as const)('renders the %s status', status => {
    // html 是服务端渲染后的稳定可访问结构。
    const html = renderToStaticMarkup(
      <OutgoingMessageStatus
        message={createMessage(status)}
        disabled={false}
        onRetry={vi.fn()}
      />,
    );

    expect(html).toContain('rn-chat-message-status is-sending');
    expect(html).toContain('aria-label="发送中"');
  });

  /** shared retry capability 继续区分可点击文本和不可重试媒体失败。 */
  it('keeps failed retry availability behind the shared capability', () => {
    // retryableHTML 覆盖可恢复文本消息按钮。
    const retryableHTML = renderToStaticMarkup(
      <OutgoingMessageStatus
        message={createMessage('failed')}
        disabled={false}
        onRetry={vi.fn()}
      />,
    );
    // blockedHTML 覆盖缺少持久化媒体来源的不可重试消息。
    const blockedHTML = renderToStaticMarkup(
      <OutgoingMessageStatus
        message={createMessage('failed', 102)}
        disabled={false}
        onRetry={vi.fn()}
      />,
    );

    expect(retryableHTML).toContain('<button');
    expect(retryableHTML).toContain('aria-label="重新发送消息"');
    expect(blockedHTML).not.toContain('<button');
    expect(blockedHTML).toContain('aria-label="发送失败，无法直接重试"');
  });

  /** 双方向尾角继续复用 RN 资源与原有主题 class。 */
  it('keeps outgoing and themed incoming tails unchanged', () => {
    // outgoingHTML 是当前账号方向的单资源尾角。
    const outgoingHTML = renderToStaticMarkup(<ChatBubbleTail mine />);
    // incomingHTML 是对端方向的明暗主题双资源尾角。
    const incomingHTML = renderToStaticMarkup(<ChatBubbleTail mine={false} />);

    expect(outgoingHTML).toContain('rn-chat-tail is-mine');
    expect(incomingHTML).toContain('rn-chat-tail is-peer');
    expect(incomingHTML).toContain('class="light-only"');
    expect(incomingHTML).toContain('class="dark-only"');
    expect(chromeSource).toContain('bubbletail-right.svg');
    expect(chromeSource).toContain('bubbletail-left-light.svg');
    expect(chromeSource).toContain('bubbletail-left-dark.svg');
  });

  /** 编排组件只消费 chrome，不直接拥有资源或 shared retry guard。 */
  it('keeps chrome implementation out of the bubble orchestrator', () => {
    expect(bubbleSource).toContain("from './ChatMessageBubbleChrome.js'");
    expect(bubbleSource).not.toMatch(/bubbletail-|canRetryWebIMMessage/);
    expect(chromeSource).toContain('canRetryWebIMMessage(message)');
    expect(chromeSource).not.toMatch(/WebIMSync|GatewayHTTPClient|navigate\(/);
    expect(bubbleSource.split('\n').length).toBeLessThanOrEqual(301);
    expect(chromeSource.split('\n').length).toBeLessThanOrEqual(301);
  });
});
