import { normalizeIMMessageLinkURL } from '@im28/im-sdk/web';

/** 浏览器开页端口允许聚焦测试隔离 window 副作用。 */
export interface ChatMessageLinkOpenPort {
  readonly open: (url: string, target: string, features: string) => void;
}

/** 生产环境只通过新标签页打开消息中的 HTTP(S) 链接。 */
const browserChatMessageLinkOpenPort: ChatMessageLinkOpenPort = {
  /** 打开动作使用 noopener/noreferrer 隔离来源页。 */
  open(url, target, features) {
    window.open(url, target, features);
  },
};

/** 按 shared RN 规则规范化地址后交给浏览器平台端口。 */
export function openChatMessageLink(
  url: string,
  opener: ChatMessageLinkOpenPort = browserChatMessageLinkOpenPort,
): void {
  /** normalizedURL 为 www 地址补齐 HTTPS，其余协议保持原样。 */
  const normalizedURL = normalizeIMMessageLinkURL(url);
  if (!/^https?:\/\//i.test(normalizedURL)) throw new Error('链接地址无效。');
  opener.open(normalizedURL, '_blank', 'noopener,noreferrer');
}
