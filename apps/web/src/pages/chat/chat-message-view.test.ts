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
      durationSeconds: 62,
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
                width: 400,
                height: 368,
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
      width: 400,
      height: 368,
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

  it('保留文件真实 URL、名称和大小供浏览器预览下载', () => {
    expect(
      getChatMessageView(
        createMessage(105, {
          file: {
            url: 'https://media.example.com/report.pdf',
            name: 'report.pdf',
            size_bytes: '1536',
          },
        }),
        false,
      ),
    ).toEqual({
      kind: 'file',
      text: 'report.pdf',
      detail: '1.5 KB',
      mediaURL: 'https://media.example.com/report.pdf',
    });
  });

  it('保留文本原文以维持插画表情实体偏移', () => {
    /** emojiText 包含影响 UTF-16 offset 的前后空格。 */
    const emojiText = ' A😎B ';
    /** entities 模拟 Gateway 和 SQLite 共享的原始实体。 */
    const entities: NonNullable<Message['entities']> = [
      {
        type: 'preset_emoji',
        offset: 2,
        length: '😎'.length,
        packID: 'im28-preset-v1',
        presetID: 'smiling-face-with-sunglasses',
      },
    ];
    expect(
      getChatMessageView(
        {
          ...createMessage(101, { text: { text: emojiText } }),
          entities,
        },
        false,
      ),
    ).toEqual({ kind: 'text', text: emojiText, entities });
  });

  it('保留 type115 稳定 ID 供显式收藏动作使用', () => {
    expect(
      getChatMessageView(
        createMessage(115, {
          emoji: {
            emoji_id: 'emoji-115',
            url: 'https://media.example.com/emoji.webp',
          },
        }),
        false,
      ),
    ).toEqual({
      kind: 'emoji',
      text: '[表情]',
      emojiID: 'emoji-115',
      mediaURL: 'https://media.example.com/emoji.webp',
    });
  });

  it('将 type114 回复、来源快照和稳定 ID 投影为独立引用视图', () => {
    expect(
      getChatMessageView(
        createMessage(114, {
          quote: {
            msg_id: 'source-server-1',
            text: '来源正文',
            reply_text: '回复正文',
          },
        }),
        false,
      ),
    ).toEqual({
      kind: 'quote',
      text: '回复正文',
      detail: '来源正文',
      quoteMessageID: 'source-server-1',
    });
  });

  it('在单聊中也用当前账号投影 type1701 自动删除文案', () => {
    /** notice 使用 Gateway 标准 system.extra 字段。 */
    const notice = {
      ...createMessage(1701, {
        system: {
          event_type: 'conversation_auto_delete_changed',
          extra: {
            operator_user_id: 'user-1',
            operator_nickname: '张三',
            auto_delete_seconds: '604800',
            enabled: 'true',
          },
        },
      }),
      senderID: 'user-1',
    };
    expect(getChatMessageView(notice, false, 'user-1')).toEqual({
      kind: 'system',
      text: '你已设置消息在7天后自动删除',
    });
  });
});
