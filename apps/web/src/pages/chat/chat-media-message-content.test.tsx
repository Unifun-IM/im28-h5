import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { Message } from '@im28/im-sdk/web';

import { ChatMediaInteractionProvider } from './ChatMediaInteractionProvider.js';
import { ChatMediaMessageContent } from './ChatMediaMessageContent.js';
import type { ChatMessageView } from './chat-message-view.js';

/** 基础消息提供媒体正文所需的稳定真实身份。 */
const BASE_MESSAGE: Message = {
  clientMsgID: 'media-message-1',
  conversationID: 'conversation-1',
  senderID: 'user-1',
  direction: 'incoming',
  contentType: 103,
  payload: {},
  sendTime: 1,
  status: 'sent',
};

/** 在真实媒体 Provider 边界内生成静态正文。 */
function renderMediaMessage(
  view: ChatMessageView,
  mine = false,
  onStartCall?: (mediaType: 'audio' | 'video') => void,
): string {
  return renderToStaticMarkup(
    <ChatMediaInteractionProvider
      userID="user-2"
      conversationID="conversation-1"
      messages={[BASE_MESSAGE]}
    >
      <ChatMediaMessageContent
        view={view}
        message={BASE_MESSAGE}
        mine={mine}
        {...(onStartCall ? { onStartCall } : {})}
      />
    </ChatMediaInteractionProvider>,
  );
}

describe('ChatMediaMessageContent', () => {
  /** 通话记录只在页面提供真实回拨动作时启用。 */
  it('保留历史通话记录的回拨可用性', () => {
    /** enabledMarkup 表示页面已提供视频回拨 owner。 */
    const enabledMarkup = renderMediaMessage(
      { kind: 'call', text: '通话时长 0:12', callMediaType: 'video' },
      false,
      vi.fn(),
    );
    /** disabledMarkup 表示纯历史记录没有回拨动作。 */
    const disabledMarkup = renderMediaMessage({
      kind: 'call',
      text: '已取消',
      callMediaType: 'audio',
      callUnanswered: true,
    });
    expect(enabledMarkup).toContain('aria-label="拨打视频电话"');
    expect(enabledMarkup).not.toContain('disabled=""');
    expect(disabledMarkup).toContain('aria-label="语音通话记录"');
    expect(disabledMarkup).toContain('disabled=""');
  });

  /** 图片使用真实比例，非法地址则退化为不可交互文本。 */
  it('保留图片比例和 URL fail-closed 规则', () => {
    /** imageMarkup 锁定 400×368 图片的 RN 180px 比例投影。 */
    const imageMarkup = renderMediaMessage({
      kind: 'image',
      text: '[图片]',
      mediaURL: 'https://media.example.com/full.jpg',
      thumbnailURL: 'https://media.example.com/thumb.jpg',
      width: 400,
      height: 368,
    });
    /** unsafeMarkup 禁止 data URL 冒充持久化消息媒体。 */
    const unsafeMarkup = renderMediaMessage({
      kind: 'image',
      text: '[图片]',
      mediaURL: 'data:image/png;base64,unsafe',
    });
    expect(imageMarkup).toContain('aria-label="预览图片"');
    expect(imageMarkup).toContain('width="180"');
    expect(imageMarkup).toContain('height="166"');
    expect(unsafeMarkup).toContain('<span class="rn-chat-message-text">[图片]</span>');
    expect(unsafeMarkup).not.toContain('aria-label="预览图片"');
  });

  /** 视频、语音和文件继续消费同一安全 URL 与播放状态 owner。 */
  it('保留视频语音文件的动作和未播放语义', () => {
    /** videoMarkup 缺少真实地址时必须禁用。 */
    const videoMarkup = renderMediaMessage({ kind: 'video', text: '[视频]' });
    /** audioMarkup 为 incoming 未播放语音保留红点语义。 */
    const audioMarkup = renderMediaMessage({
      kind: 'audio',
      text: '[语音]',
      detail: '0:07',
      mediaURL: 'https://media.example.com/voice.aac',
    });
    /** fileMarkup 只在真实地址存在时允许预览。 */
    const fileMarkup = renderMediaMessage({
      kind: 'file',
      text: 'report.pdf',
      detail: '1.5 KB',
      mediaURL: 'https://media.example.com/report.pdf',
    });
    expect(videoMarkup).toContain('aria-label="视频不可播放"');
    expect(videoMarkup).toContain('disabled=""');
    expect(audioMarkup).toContain('aria-label="播放语音"');
    expect(audioMarkup).toContain('aria-label="未播放语音"');
    expect(fileMarkup).toContain('aria-label="预览文件 report.pdf"');
    expect(fileMarkup).not.toContain('disabled=""');
  });
});
