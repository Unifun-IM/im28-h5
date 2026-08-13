import type { ChatMessageView } from './chat-message-view.js';

/** 浏览器剪贴板端口允许测试注入并隔离平台 I/O。 */
export interface ChatMessageClipboardPort {
  readonly writeText: (text: string) => Promise<void>;
}

/** 浏览器 clipboard 是生产环境唯一复制副作用 owner。 */
const browserChatMessageClipboard: ChatMessageClipboardPort = {
  /** 将当前消息投影写入系统剪贴板。 */
  async writeText(text) {
    // clipboard 在非安全上下文或不支持的浏览器中可能不存在。
    const clipboard = navigator.clipboard;
    if (!clipboard) throw new Error('当前浏览器不支持复制。');
    await clipboard.writeText(text);
  },
};

/** 按 RN renderMessageContent 规则生成可复制纯文本。 */
export function getChatMessageCopyText(view: ChatMessageView): string {
  if (view.kind === 'image') return '[图片]';
  if (view.kind === 'audio') return '[语音]';
  if (view.kind === 'video') return '[视频]';
  if (view.kind === 'file') return '[文件]';
  if (view.kind === 'card') return `[名片] ${view.text}`.trim();
  return view.text;
}

/** 仅在存在可见消息投影时执行一次真实 clipboard 写入。 */
export async function copyChatMessage(
  view: ChatMessageView,
  clipboard: ChatMessageClipboardPort = browserChatMessageClipboard,
): Promise<void> {
  // text 是与 RN 消息动作一致的纯文本 fallback。
  const text = getChatMessageCopyText(view).trim();
  await copyChatMessageText(text, clipboard);
}

/** 复用聊天页唯一 clipboard 端口复制链接或其他已投影纯文本。 */
export async function copyChatMessageText(
  text: string,
  clipboard: ChatMessageClipboardPort = browserChatMessageClipboard,
): Promise<void> {
  /** normalizedText 保持 RN 复制链接前后的首尾空白处理。 */
  const normalizedText = text.trim();
  if (!normalizedText) throw new Error('该消息没有可复制的内容。');
  await clipboard.writeText(normalizedText);
}
