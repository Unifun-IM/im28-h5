import { describe, expect, it } from 'vitest';

import cardSource from './ChatCardMessageContent.tsx?raw';
import contentSource from './ChatMessageContent.tsx?raw';
import mediaSource from './ChatMediaMessageContent.tsx?raw';
import textSource from './ChatTextMessageContent.tsx?raw';

/** 消息正文 owner 合同防止各消息族展示回流到类型分发组件。 */
describe('chat message content owner', () => {
  /** 正文组件只分发独立消息族，并持续满足单文件上限。 */
  it('keeps message families behind dedicated presentation owners', () => {
    expect(contentSource).toContain('<ChatCardMessageContent');
    expect(contentSource).toContain('<ChatMediaMessageContent');
    expect(contentSource).toContain('<ChatTextMessageContent');
    expect(contentSource).not.toContain('getRNAvatarGradient');
    expect(contentSource).not.toMatch(/useChatMediaInteraction|normalizeChatMediaURL|getChatImageDisplaySize/);
    expect(contentSource).not.toMatch(/PresetEmojiTextContent|sourceText|sourceLabel/);
    expect(contentSource.split('\n').length).toBeLessThanOrEqual(301);
  });

  /** 名片组件继续保留目标可用性和用户/群可访问名称规则。 */
  it('owns the existing card presentation contract', () => {
    expect(cardSource).toContain("disabled={!view.cardTargetID || !onOpen}");
    expect(cardSource).toContain('查看${view.text}的群聊卡片');
    expect(cardSource).toContain('查看${view.text}的个人资料');
    expect(cardSource).not.toMatch(/navigate\(|WebIMSync|@im28\/im-sdk/);
  });

  /** 媒体族持有五类 JSX，但不复制预览、播放或 RTC 状态机。 */
  it('owns media presentation behind the existing interaction provider', () => {
    expect(mediaSource).toContain("'call',");
    expect(mediaSource).toContain("'image',");
    expect(mediaSource).toContain("'video',");
    expect(mediaSource).toContain("'audio',");
    expect(mediaSource).toContain("'file',");
    expect(mediaSource).toContain('useChatMediaInteraction()');
    expect(mediaSource).not.toMatch(/new Audio|navigate\(|WebIMSync|GatewayHTTPClient/);
    expect(mediaSource.split('\n').length).toBeLessThanOrEqual(301);
  });

  /** 文本族只组合既有引用和实体 renderer，不复制来源解析或消息 mapper。 */
  it('owns textual presentation without becoming a parser', () => {
    expect(textSource).toContain("view.kind === 'quote'");
    expect(textSource).toContain("view.kind === 'text'");
    expect(textSource).toContain('<PresetEmojiTextContent');
    expect(textSource).toContain('quoteSource?.message');
    expect(textSource).not.toMatch(/resolveChatQuoteSource|getChatMessageView|WebIMSync|GatewayHTTPClient/);
    expect(textSource.split('\n').length).toBeLessThanOrEqual(301);
  });
});
