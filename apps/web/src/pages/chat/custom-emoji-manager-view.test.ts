import { describe, expect, it } from 'vitest';

import {
  buildCustomEmojiUploadInputs,
  toggleCustomEmojiSelection,
  type CustomEmojiFileLike,
} from './custom-emoji-manager-view.js';

/** 创建不依赖真实浏览器文件内容的测试输入。 */
function createFile(
  name: string,
  type = 'image/webp',
  size = 128,
): CustomEmojiFileLike {
  // source 只需保持 opaque identity，不参与纯元数据校验。
  const source = { name };
  return { source, name, type, size };
}

describe('custom emoji manager view', () => {
  // 验证合法文件转换为 SDK opaque upload input。
  it('builds validated upload inputs', () => {
    expect(buildCustomEmojiUploadInputs([createFile('hello.WEBP')], 3)).toEqual([
      expect.objectContaining({
        name: 'hello.WEBP',
        mimeType: 'image/webp',
        extension: 'webp',
      }),
    ]);
  });

  // 验证账号余量和格式在上传前失败。
  it('rejects over-capacity and unsupported files', () => {
    expect(() => buildCustomEmojiUploadInputs([createFile('a.webp')], 100)).toThrow('100');
    expect(() => buildCustomEmojiUploadInputs([createFile('a.svg', 'image/svg+xml')], 0)).toThrow('JPG');
  });

  // 验证整理选择按点击顺序编号并可切换移除。
  it('toggles stable IDs in selection order', () => {
    expect(toggleCustomEmojiSelection(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleCustomEmojiSelection(['a', 'b'], 'a')).toEqual(['b']);
  });
});
