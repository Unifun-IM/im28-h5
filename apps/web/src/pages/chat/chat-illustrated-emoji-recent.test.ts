import { describe, expect, it } from 'vitest';

import type { ChatSystemEmojiStorage } from './chat-system-emoji-recent.js';
import {
  loadRecentChatIllustratedEmojiIDs,
  recordRecentChatIllustratedEmojiID,
} from './chat-illustrated-emoji-recent.js';

/** 创建可检查写入结果的内存 preference adapter。 */
function createIllustratedEmojiStorage(initialValue: string | null = null) {
  /** value 保存与 localStorage 相同的字符串快照。 */
  let value = initialValue;
  /** storage 实现最近使用 owner 的最小同步 contract。 */
  const storage: ChatSystemEmojiStorage = {
    getItem: () => value,
    setItem: (_key, nextValue) => {
      value = nextValue;
    },
  };
  return { storage, readValue: () => value };
}

// 插画表情最近使用 contract 锁定 presetID MRU 和失败降级。
describe('chat illustrated emoji recent history', () => {
  /** 验证重复身份移动到首位且不重复。 */
  it('moves a preset identity to the front', () => {
    /** harness 从两个已有身份开始。 */
    const harness = createIllustratedEmojiStorage(
      JSON.stringify(['happy-face', 'framed-picture']),
    );
    expect(
      recordRecentChatIllustratedEmojiID('framed-picture', harness.storage),
    ).toEqual(['framed-picture', 'happy-face']);
    expect(JSON.parse(harness.readValue() ?? '[]')).toEqual([
      'framed-picture',
      'happy-face',
    ]);
  });

  /** 验证最近使用区域最多保留 21 项。 */
  it('caps recent identities at 21 entries', () => {
    /** existing 构造一个已满容量的身份列表。 */
    const existing = Array.from({ length: 21 }, (_, index) => `preset-${index}`);
    /** harness 持有写入前顺序。 */
    const harness = createIllustratedEmojiStorage(JSON.stringify(existing));
    expect(
      recordRecentChatIllustratedEmojiID('new-preset', harness.storage),
    ).toEqual(['new-preset', ...existing.slice(0, 20)]);
  });

  /** 验证浏览器拒绝 preference 时仍可使用完整表情包。 */
  it('fails closed when browser storage is unavailable', () => {
    /** storage 用异常模拟隐私策略拒绝。 */
    const storage: ChatSystemEmojiStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(loadRecentChatIllustratedEmojiIDs(storage)).toEqual([]);
    expect(recordRecentChatIllustratedEmojiID('happy-face', storage)).toEqual([]);
  });
});
