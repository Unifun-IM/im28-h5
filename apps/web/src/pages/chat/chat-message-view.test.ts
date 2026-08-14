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
  /** 好友关系通知必须使用 RN 已发布的 shared 文案。 */
  it('projects type1201 through the shared friend-added owner', () => {
    expect(getChatMessageView(createMessage(1201, {}), false)).toEqual({
      kind: 'system',
      text: '你们已经成为好友，可以开始聊天了',
    });
  });

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
            width: 400,
            height: 240,
          },
        }),
        false,
      ),
    ).toEqual({
      kind: 'emoji',
      text: '[表情]',
      emojiID: 'emoji-115',
      mediaURL: 'https://media.example.com/emoji.webp',
      width: 400,
      height: 240,
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

  /** 群提及正文继续使用共享 text view，不在页面复制 mention 解析。 */
  it('将 type106 群提及投影为普通文本气泡', () => {
    expect(getChatMessageView(createMessage(106, {
      mention: { text: '@donk 你好' },
    }), true)).toEqual({
      kind: 'text',
      text: '@donk 你好',
    });
  });

  /** type108 同时锁定 RN 已发布的用户和群聊名片两种快照。 */
  it('将 type108 用户与群聊名片投影为卡片气泡', () => {
    expect(getChatMessageView(createMessage(108, {
      card: {
        user: {
          user_id: 'user-108',
          nickname: '名片用户',
          avatar_url: 'https://media.example.com/user.jpg',
        },
      },
    }), false)).toEqual({
      kind: 'card',
      text: '名片用户',
      detail: 'user-108',
      mediaURL: 'https://media.example.com/user.jpg',
    });
    expect(getChatMessageView(createMessage(108, {
      card: {
        group: {
          group_id: 'group-108',
          title: '名片群聊',
          avatar_url: 'https://media.example.com/group.jpg',
        },
      },
    }), true)).toEqual({
      kind: 'card',
      text: '名片群聊',
      detail: 'group-108',
      mediaURL: 'https://media.example.com/group.jpg',
    });
  });

  /** RN 没有位置气泡 owner，Web 不得为 type109 猜测地图或点击行为。 */
  it('对 type109 位置消息保持明确不可用投影', () => {
    expect(getChatMessageView(createMessage(109, {
      location: { latitude: 1, longitude: 2, description: '未知位置' },
    }), false)).toEqual({
      kind: 'unsupported',
      text: '[暂不支持的消息 · 109]',
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

  /** 群简介与发言频率必须消费 shared 结构化文案。 */
  it('projects structured group system notices through the SDK owner', () => {
    expect(getChatMessageView(createMessage(1521, {
      system: {
        event_type: 'group_description_changed',
        text: '不可依赖的旧文案',
        extra: { operator_user_id: 'user-1', operator_nickname: '旧昵称' },
      },
    }), true, 'user-1')).toEqual({
      kind: 'system',
      text: '你更新了[群简介]',
    });
    expect(getChatMessageView(createMessage(1599, {
      system: {
        event_type: 'group_send_frequency_changed',
        extra: { send_frequency_enabled: true, send_frequency_seconds: 30 },
      },
    }), true)).toEqual({
      kind: 'system',
      text: '已开启发言频率控制，间隔时间为30秒',
    });
  });

  it('使用 SDK 将历史语音通话摘要投影为可回拨气泡', () => {
    expect(getChatMessageView(
      createMessage(110, {
        custom: {
          key: 'im28.rtc.call',
          data: JSON.stringify({
            type: 'im28.rtc.call',
            mediaType: 'voice',
            status: 'ended',
            durationSeconds: 8,
          }),
        },
      }),
      false,
    )).toEqual({
      kind: 'call',
      text: '通话时长 00:08',
      callMediaType: 'audio',
      callStatus: 'ended',
      callUnanswered: false,
      durationSeconds: 8,
    });
  });

  it('不把实时来电邀请投影成历史通话气泡', () => {
    expect(getChatMessageView(
      createMessage(110, {
        custom: {
          key: 'rtc.call.invite',
          data: JSON.stringify({ call_type: 'audio', status: 'invited' }),
        },
      }),
      false,
    )).toEqual({ kind: 'text', text: '[通话]' });
  });
});
