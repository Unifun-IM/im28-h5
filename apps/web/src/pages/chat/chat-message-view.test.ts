import type { Message } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import { getChatMessageView } from './chat-message-view.js';

/** 为纯消息投影测试构造不依赖 runtime 的 Repository 记录。 */
function createMessage(contentType: number, payload: unknown): Message {
  return {
    clientMsgID: `client-${contentType}`,
    conversationID: 'conversation-1',
    senderID: 'user-1',
    direction: 'incoming',
    contentType,
    status: 'received',
    sendTime: 1_723_456_789,
    payload,
  };
}

// 聊天消息 view 映射锁定 Gateway 媒体字段，防止交互 URL 再次丢失。
describe('chat message view media mapping', () => {
  it('投影音频真实 URL 与 RN 时长格式', () => {
    expect(
      getChatMessageView(
        createMessage(103, {
          audio: {
            url: 'https://media.example.com/voice.aac',
            duration_seconds: 62,
          },
        }),
        false,
      ),
    ).toEqual({
      kind: 'audio',
      text: '[语音]',
      mediaURL: 'https://media.example.com/voice.aac',
      detail: '1:02',
    });
  });

  it('保持图片原图/缩略图和视频播放/封面字段分离', () => {
    expect(
      getChatMessageView(
        createMessage(102, {
          image: {
            list: [
              {
                url: 'https://media.example.com/full.jpg',
                thumbnail_url: 'https://media.example.com/thumb.jpg',
              },
            ],
          },
        }),
        false,
      ),
    ).toMatchObject({
      kind: 'image',
      mediaURL: 'https://media.example.com/full.jpg',
      thumbnailURL: 'https://media.example.com/thumb.jpg',
    });
    expect(
      getChatMessageView(
        createMessage(104, {
          video: {
            url: 'https://media.example.com/video.mp4',
            thumbnail_url: 'https://media.example.com/video.jpg',
            duration_seconds: 8,
          },
        }),
        false,
      ),
    ).toMatchObject({
      kind: 'video',
      mediaURL: 'https://media.example.com/video.mp4',
      thumbnailURL: 'https://media.example.com/video.jpg',
      detail: '0:08',
    });
  });
});
