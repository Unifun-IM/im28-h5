import { describe, expect, it, vi } from 'vitest';

import {
  copyChatMessage,
  copyChatMessageText,
  getChatMessageCopyText,
  type ChatMessageClipboardPort,
} from './chat-message-copy.js';

// 消息复制测试锁定 RN fallback 文案和 success-only 浏览器副作用。
describe('chat message copy', () => {
  it('copies text and quote reply projections without changing content', async () => {
    // writeText 记录真实传给浏览器端口的纯文本。
    const writeText = vi.fn(async () => undefined);
    // clipboard 隔离 navigator.clipboard，避免测试写入系统剪贴板。
    const clipboard: ChatMessageClipboardPort = { writeText };
    await copyChatMessage({ kind: 'text', text: '消息正文' }, clipboard);
    await copyChatMessage({ kind: 'quote', text: '回复正文' }, clipboard);
    expect(writeText).toHaveBeenNthCalledWith(1, '消息正文');
    expect(writeText).toHaveBeenNthCalledWith(2, '回复正文');
  });

  it('matches RN media and card fallback labels', () => {
    expect(getChatMessageCopyText({ kind: 'image', text: 'ignored' })).toBe('[图片]');
    expect(getChatMessageCopyText({ kind: 'audio', text: 'ignored' })).toBe('[语音]');
    expect(getChatMessageCopyText({ kind: 'video', text: 'ignored' })).toBe('[视频]');
    expect(getChatMessageCopyText({ kind: 'file', text: 'report.pdf' })).toBe('[文件]');
    expect(getChatMessageCopyText({ kind: 'card', text: 'Alice' })).toBe('[名片] Alice');
  });

  it('propagates clipboard failure and never manufactures success', async () => {
    // failure 保留浏览器拒绝信息供页面展示。
    const failure = new Error('Clipboard permission denied');
    // clipboard 明确模拟一次平台写入失败。
    const clipboard: ChatMessageClipboardPort = {
      writeText: vi.fn(async () => {
        throw failure;
      }),
    };
    await expect(
      copyChatMessage({ kind: 'text', text: '不可复制' }, clipboard),
    ).rejects.toBe(failure);
  });

  it('copies the original link text through the same browser port', async () => {
    // writeText 证明 www 原文不会在复制时被改写为 HTTPS。
    const writeText = vi.fn(async () => undefined);
    await copyChatMessageText(' www.example.com ', { writeText });
    expect(writeText).toHaveBeenCalledWith('www.example.com');
  });
});
