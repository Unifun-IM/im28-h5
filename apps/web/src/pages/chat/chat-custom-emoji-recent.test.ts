import { describe, expect, it } from 'vitest';

import type { ChatSystemEmojiStorage } from './chat-system-emoji-recent.js';
import {
  loadRecentChatCustomEmojiIDs,
  recordRecentChatCustomEmojiID,
} from './chat-custom-emoji-recent.js';

/** 创建可检查写入结果的内存 preference adapter。 */
function createCustomEmojiStorage(initialValue: string | null = null) {
  // value 保存与 localStorage 相同的字符串快照。
  let value = initialValue;
  // storage 实现自定义表情 MRU 的最小同步 contract。
  const storage: ChatSystemEmojiStorage = {
    getItem: () => value,
    setItem: (_key, nextValue) => {
      value = nextValue;
    },
  };
  return { storage, readValue: () => value };
}

// 自定义表情常用区只记录稳定 ID，不复制资源 URL。
describe('chat custom emoji recent history', () => {
  // 验证重复身份移动到首位且保持唯一。
  it('moves a stable emoji ID to the front', () => {
    // harness 从两个已有身份开始。
    const harness = createCustomEmojiStorage(
      JSON.stringify(['emoji-a', 'emoji-b']),
    );
    expect(recordRecentChatCustomEmojiID('emoji-b', harness.storage)).toEqual([
      'emoji-b',
      'emoji-a',
    ]);
    expect(JSON.parse(harness.readValue() ?? '[]')).toEqual([
      'emoji-b',
      'emoji-a',
    ]);
  });

  // 验证损坏或不可用 preference 以空常用区降级。
  it('fails closed when browser storage is unavailable', () => {
    // storage 用异常模拟浏览器隐私策略拒绝。
    const storage: ChatSystemEmojiStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(loadRecentChatCustomEmojiIDs(storage)).toEqual([]);
    expect(recordRecentChatCustomEmojiID('emoji-a', storage)).toEqual([]);
  });
});
