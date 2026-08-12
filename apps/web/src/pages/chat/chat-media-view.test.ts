import { describe, expect, it } from 'vitest';

import {
  getChatAudioURL,
  getChatImageDisplayURL,
  getChatMediaPreview,
  normalizeChatMediaURL,
} from './chat-media-view.js';

// 聊天媒体 view helper 锁定 URL 安全边界和动作投影。
describe('chat media view', () => {
  it('只接受绝对 HTTP(S) 媒体地址', () => {
    expect(normalizeChatMediaURL(' https://media.example.com/a.mp3 ')).toBe(
      'https://media.example.com/a.mp3',
    );
    expect(normalizeChatMediaURL('http://127.0.0.1/video.mp4')).toBe(
      'http://127.0.0.1/video.mp4',
    );
    expect(normalizeChatMediaURL('javascript:alert(1)')).toBe('');
    expect(normalizeChatMediaURL('/relative/image.jpg')).toBe('');
  });

  it('图片优先原图并在历史消息缺失原图时使用真实缩略图', () => {
    expect(
      getChatMediaPreview({
        kind: 'image',
        text: '[图片]',
        mediaURL: 'https://media.example.com/full.jpg',
        thumbnailURL: 'https://media.example.com/thumb.jpg',
      }),
    ).toEqual({
      kind: 'image',
      url: 'https://media.example.com/full.jpg',
      title: '图片预览',
    });
    expect(
      getChatMediaPreview({
        kind: 'image',
        text: '[图片]',
        thumbnailURL: 'https://media.example.com/thumb.jpg',
      }),
    ).toEqual({
      kind: 'image',
      url: 'https://media.example.com/thumb.jpg',
      title: '图片预览',
    });
  });

  it('公开 OSS 图片使用 JPEG 展示投影且不修改签名或第三方地址', () => {
    expect(
      getChatImageDisplayURL(
        'https://im28.oss-cn-hongkong.aliyuncs.com/images/source.jpg',
      ),
    ).toBe(
      'https://im28.oss-cn-hongkong.aliyuncs.com/images/source.jpg?x-oss-process=image/resize,w_360/format,jpg',
    );
    expect(
      getChatImageDisplayURL(
        'https://im28.oss-cn-hongkong.aliyuncs.com/images/source.jpg?OSSAccessKeyId=key&Signature=value',
      ),
    ).toContain('OSSAccessKeyId=key');
    expect(getChatImageDisplayURL('https://media.example.com/source.heic')).toBe(
      'https://media.example.com/source.heic',
    );
  });

  it('视频和语音只消费各自的真实媒体地址', () => {
    expect(
      getChatMediaPreview({
        kind: 'video',
        text: '[视频]',
        mediaURL: 'https://media.example.com/video.mp4',
      }),
    ).toMatchObject({ kind: 'video' });
    expect(
      getChatAudioURL({
        kind: 'audio',
        text: '[语音]',
        mediaURL: 'https://media.example.com/voice.aac',
      }),
    ).toBe('https://media.example.com/voice.aac');
    expect(
      getChatAudioURL({
        kind: 'image',
        text: '[图片]',
        mediaURL: 'https://media.example.com/image.jpg',
      }),
    ).toBe('');
  });

  it('只为具有真实 HTTP(S) URL 的文件构造预览', () => {
    expect(
      getChatMediaPreview({
        kind: 'file',
        text: 'report.pdf',
        detail: '1.5 KB',
        mediaURL: 'https://media.example.com/report.pdf',
      }),
    ).toEqual({
      kind: 'file',
      url: 'https://media.example.com/report.pdf',
      title: '文件预览',
      fileName: 'report.pdf',
      detail: '1.5 KB',
    });
    expect(
      getChatMediaPreview({
        kind: 'file',
        text: 'unsafe.txt',
        mediaURL: 'data:text/plain,unsafe',
      }),
    ).toBeNull();
  });
});
