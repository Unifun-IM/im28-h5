import { describe, expect, it } from 'vitest';

import {
  CHAT_ALBUM_SELECTION_LIMIT,
  CHAT_ALBUM_ACCEPT,
  validateChatFile,
  validateChatAlbumSelection,
} from './chat-attachment-selection.js';

/** 创建只含选择校验所需字段的浏览器测试文件。 */
function createFile(name: string, type: string, size: number): File {
  return { name, type, size } as File;
}

// 聊天附件选择必须先于 SDK I/O 拒绝超限或不可解码输入。
describe('chat attachment selection', () => {
  // 验证图片选择保留顺序且接受 RN 主路径格式。
  it('keeps supported images in browser selection order', () => {
    // files 模拟浏览器 FileList 的稳定顺序。
    const files = [
      createFile('first.jpg', 'image/jpeg', 1024),
      createFile('second.webp', 'image/webp', 2048),
    ];
    expect(validateChatAlbumSelection(files)).toEqual([
      { kind: 'image', file: files[0] },
      { kind: 'image', file: files[1] },
    ]);
  });

  // 验证 RN mixed 相册按原顺序区分图片与视频。
  it('keeps mixed image and video items in selection order', () => {
    // files 模拟浏览器 mixed FileList。
    const files = [
      createFile('first.jpg', 'image/jpeg', 1024),
      createFile('second.mp4', 'video/mp4', 2048),
    ];
    expect(validateChatAlbumSelection(files)).toEqual([
      { kind: 'image', file: files[0] },
      { kind: 'video', file: files[1] },
    ]);
    expect(CHAT_ALBUM_ACCEPT).toContain('video/mp4');
  });

  // 验证超过 RN 12 张上限时整批拒绝。
  it('rejects an album selection above the RN limit', () => {
    // files 比产品上限多一张，不允许部分发送造成选择歧义。
    const files = Array.from(
      { length: CHAT_ALBUM_SELECTION_LIMIT + 1 },
      (_, index) => createFile(`${index}.png`, 'image/png', 10),
    );
    expect(() => validateChatAlbumSelection(files)).toThrow(
      '一次最多选择 12 项内容',
    );
  });

  // 验证浏览器不可稳定预览的图片 MIME 被显式拒绝。
  it('rejects an unsupported browser image MIME', () => {
    // heic 由后续转码能力决定，本切片不伪装成可预览图片。
    const file = createFile('photo.heic', 'image/heic', 1024);
    expect(() => validateChatAlbumSelection([file])).toThrow(
      '暂不支持媒体格式：photo.heic',
    );
  });

  // 验证视频严格执行 RN 500 MB 上限。
  it('rejects a video above 500 MB', () => {
    // file 比视频产品上限多一个字节。
    const file = createFile(
      'large.mp4',
      'video/mp4',
      500 * 1024 * 1024 + 1,
    );
    expect(() => validateChatAlbumSelection([file])).toThrow(
      '视频不能超过 500 MB',
    );
  });

  // 验证普通文件严格执行 100 MB 上限。
  it('rejects a file above 100 MB', () => {
    // file 比上限多一个字节。
    const file = createFile(
      'archive.zip',
      'application/zip',
      100 * 1024 * 1024 + 1,
    );
    expect(() => validateChatFile(file)).toThrow('文件不能超过 100 MB');
  });
});
