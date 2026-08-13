import { describe, expect, it, vi } from 'vitest';

import { openChatMessageLink, type ChatMessageLinkOpenPort } from './chat-message-link.js';

// Web 链接端口只适配浏览器开页，不复制 shared 解析规则。
describe('chat message link platform adapter', () => {
  /** 验证 www 地址补齐 HTTPS 且使用隔离的新标签页。 */
  it('opens normalized links in an isolated browser tab', () => {
    /** open 记录平台端口收到的最终地址。 */
    const open = vi.fn();
    /** opener 隔离真实 window.open。 */
    const opener: ChatMessageLinkOpenPort = { open };
    openChatMessageLink('www.example.com', opener);
    expect(open).toHaveBeenCalledWith(
      'https://www.example.com',
      '_blank',
      'noopener,noreferrer',
    );
  });

  /** 验证非法协议 fail-closed，且不调用浏览器。 */
  it('rejects non-http protocols', () => {
    /** open 证明失败分支没有外部副作用。 */
    const open = vi.fn();
    expect(() => openChatMessageLink('javascript:alert(1)', { open })).toThrow(
      '链接地址无效。',
    );
    expect(open).not.toHaveBeenCalled();
  });
});
