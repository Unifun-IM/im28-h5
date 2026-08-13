import { describe, expect, it } from 'vitest';

import { getChatCustomEmojiDisplaySize } from './ChatCustomEmojiMessageContent.js';

// 自定义表情尺寸测试锁定 RN 同源比例规则和旧消息探测入口。
describe('chat custom emoji message view', () => {
  it('限制最大宽度并保持横图和竖图真实比例', () => {
    expect(getChatCustomEmojiDisplaySize(400, 200)).toEqual({
      width: 180,
      height: 90,
    });
    expect(getChatCustomEmojiDisplaySize(200, 400)).toEqual({
      width: 180,
      height: 360,
    });
  });

  it('不放大小图且缺少尺寸时等待浏览器自然尺寸', () => {
    expect(getChatCustomEmojiDisplaySize(80, 120)).toEqual({
      width: 80,
      height: 120,
    });
    expect(getChatCustomEmojiDisplaySize(undefined, undefined)).toBeNull();
    expect(getChatCustomEmojiDisplaySize(0, 120)).toBeNull();
  });
});
