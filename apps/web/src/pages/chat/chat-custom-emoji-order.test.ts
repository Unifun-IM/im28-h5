import type { CustomEmoji } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import type { ChatSystemEmojiStorage } from './chat-system-emoji-recent.js';
import {
  applyChatCustomEmojiOrder,
  getChatCustomEmojiMoveTarget,
  loadChatCustomEmojiOrder,
  reorderChatCustomEmojis,
  saveChatCustomEmojiOrder,
} from './chat-custom-emoji-order.js';

/** 构造稳定 ID 对应的共享 SDK 表情快照。 */
function createEmoji(emojiID: string): CustomEmoji {
  return { emojiID, url: `https://cdn.test/${emojiID}.webp`, addedAt: 1 };
}

/** 构造可检查的同步 preference adapter。 */
function createOrderStorage(initialValue: string | null = null) {
  // value 保存 localStorage 兼容字符串。
  let value = initialValue;
  // storage 只实现排序 helper 所需最小 contract。
  const storage: ChatSystemEmojiStorage = {
    getItem: () => value,
    setItem: (_key, nextValue) => { value = nextValue; },
  };
  return { storage, readValue: () => value };
}

// 本地排序只能影响当前 SDK 成员快照的视觉顺序。
describe('chat custom emoji local order', () => {
  it('applies valid IDs and appends new remote members', () => {
    // emojis 模拟远端完整列表新增 c 且删除旧 x。
    const emojis = ['a', 'b', 'c'].map(createEmoji);
    expect(applyChatCustomEmojiOrder(emojis, ['b', 'x', 'a']).map(item => item.emojiID)).toEqual(['b', 'a', 'c']);
  });

  it('moves a selected group in selection order', () => {
    // emojis 保持初始远端顺序。
    const emojis = ['a', 'b', 'c', 'd'].map(createEmoji);
    expect(reorderChatCustomEmojis(emojis, ['d', 'b'], 1).map(item => item.emojiID)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('persists only normalized stable IDs', () => {
    // harness 从损坏和重复输入验证 fail-closed 语义。
    const harness = createOrderStorage('not-json');
    expect(loadChatCustomEmojiOrder(harness.storage)).toEqual([]);
    expect(saveChatCustomEmojiOrder([' a ', 'a', '', 'b'], harness.storage)).toEqual(['a', 'b']);
    expect(JSON.parse(harness.readValue() ?? '[]')).toEqual(['a', 'b']);
  });

  it('maps pointer coordinates to a bounded five-column target', () => {
    // rect 使用 500px 宽度得到每格 100px。
    const rect = { left: 10, top: 20, width: 500 };
    expect(getChatCustomEmojiMoveTarget(260, 170, rect, 8)).toBe(7);
    expect(getChatCustomEmojiMoveTarget(999, 999, rect, 8)).toBe(8);
  });
});
