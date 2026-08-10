import { describe, expect, it } from 'vitest';

import {
  deleteChatDraftBeforeSelection,
  insertChatDraftAtSelection,
  normalizeChatDraftSelection,
} from './chat-composer-text-editing.js';

// 文本编辑 contract 对齐 RN 的 UTF-16 selection 和完整 grapheme 语义。
describe('chat composer text editing', () => {
  // 验证插入发生在当前光标而不是固定追加到草稿末尾。
  it('inserts an emoji at the current cursor', () => {
    expect(insertChatDraftAtSelection('前后', { start: 1, end: 1 }, '😎')).toEqual({
      text: '前😎后',
      selection: { start: 3, end: 3 },
    });
  });

  // 验证非折叠选区按原生输入框语义被替换。
  it('replaces the current selection', () => {
    expect(insertChatDraftAtSelection('abcdef', { start: 2, end: 4 }, '😊')).toEqual({
      text: 'ab😊ef',
      selection: { start: 4, end: 4 },
    });
  });

  // 验证 ZWJ 家庭表情作为一个可见字符删除。
  it('deletes one complete emoji grapheme', () => {
    // familyEmoji 包含多个 UTF-16 码点和 ZWJ。
    const familyEmoji = '👨‍👩‍👧‍👦';
    // cursor 位于家庭表情之后。
    const cursor = `A${familyEmoji}`.length;
    expect(
      deleteChatDraftBeforeSelection(`A${familyEmoji}B`, {
        start: cursor,
        end: cursor,
      }),
    ).toEqual({ text: 'AB', selection: { start: 1, end: 1 } });
  });

  // 验证有选区时直接删除选区并折叠光标。
  it('deletes a selected range', () => {
    expect(deleteChatDraftBeforeSelection('abcdef', { start: 2, end: 5 })).toEqual({
      text: 'abf',
      selection: { start: 2, end: 2 },
    });
  });

  // 验证反向和越界 selection 会先被规范化。
  it('normalizes reversed and out-of-range selections', () => {
    expect(normalizeChatDraftSelection('abc', { start: 9, end: -2 })).toEqual({
      start: 0,
      end: 3,
    });
  });
});
