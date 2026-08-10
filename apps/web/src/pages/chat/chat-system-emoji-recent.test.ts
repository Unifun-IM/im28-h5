import { describe, expect, it } from 'vitest';

import {
  loadRecentChatSystemEmojis,
  recordRecentChatSystemEmoji,
  type ChatSystemEmojiStorage,
} from './chat-system-emoji-recent.js';
import { CHAT_SYSTEM_UNICODE_EMOJIS } from './chat-system-emojis.js';

/** 创建可检查写入结果的内存 preference adapter。 */
function createEmojiStorage(initialValue: string | null = null) {
  // value 保存与 localStorage 相同的字符串值。
  let value = initialValue;
  // storage 提供最近使用 owner 需要的最小同步 contract。
  const storage: ChatSystemEmojiStorage = {
    getItem: () => value,
    setItem: (_key, nextValue) => {
      value = nextValue;
    },
  };
  return { storage, readValue: () => value };
}

// 最近使用 contract 锁定 RN 的 MRU、去重和 21 项上限。
describe('chat system emoji recent history', () => {
  // 验证 H5 使用 RN 原始列表的数量和边界顺序。
  it('keeps the exact RN system emoji list boundary', () => {
    expect(CHAT_SYSTEM_UNICODE_EMOJIS).toHaveLength(52);
    expect(CHAT_SYSTEM_UNICODE_EMOJIS[0]).toBe('😎');
    expect(CHAT_SYSTEM_UNICODE_EMOJIS.at(-1)).toBe('😧');
  });

  // 验证重复表情被移动到首位且只保留一次。
  it('moves the selected emoji to the front without duplicates', () => {
    // harness 从两个已有表情开始。
    const harness = createEmojiStorage(JSON.stringify(['😊', '😎']));

    expect(recordRecentChatSystemEmoji('😎', harness.storage)).toEqual(['😎', '😊']);
    expect(JSON.parse(harness.readValue() ?? '[]')).toEqual(['😎', '😊']);
  });

  // 验证超过 RN 容量时截断最旧项目。
  it('caps recent history at 21 entries', () => {
    // existing 使用稳定文本构造 21 个不同值。
    const existing = Array.from({ length: 21 }, (_, index) => `emoji-${index}`);
    // harness 持有已满容量的顺序。
    const harness = createEmojiStorage(JSON.stringify(existing));

    expect(recordRecentChatSystemEmoji('new', harness.storage)).toEqual([
      'new',
      ...existing.slice(0, 20),
    ]);
  });

  // 验证损坏或不可访问的 preference 不会阻塞 composer。
  it('fails closed when browser storage is unavailable', () => {
    // storage 用异常模拟隐私模式或安全策略拒绝。
    const storage: ChatSystemEmojiStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };

    expect(loadRecentChatSystemEmojis(storage)).toEqual([]);
    expect(recordRecentChatSystemEmoji('😊', storage)).toEqual([]);
  });
});
