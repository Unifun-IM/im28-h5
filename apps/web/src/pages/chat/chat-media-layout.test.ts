import { describe, expect, it } from 'vitest';

import {
  getChatAudioBubbleWidth,
  getChatImageDisplaySize,
} from './chat-media-layout.js';

describe('chat media layout', () => {
  it('图片不放大小图并按 180 上限保持真实比例', () => {
    expect(getChatImageDisplaySize(400, 368)).toEqual({ width: 180, height: 166 });
    expect(getChatImageDisplaySize(120, 240)).toEqual({ width: 120, height: 240 });
    expect(getChatImageDisplaySize(undefined, undefined)).toEqual({ width: 180, height: 180 });
  });

  it('语音宽度与 RN 两阶段时长曲线一致', () => {
    expect(getChatAudioBubbleWidth(1)).toBe(88);
    expect(getChatAudioBubbleWidth(10)).toBe(192);
    expect(getChatAudioBubbleWidth(60)).toBe(236);
    expect(getChatAudioBubbleWidth(120)).toBe(236);
  });
});
