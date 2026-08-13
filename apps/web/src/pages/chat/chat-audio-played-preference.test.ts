import { describe, expect, it } from 'vitest';

import {
  getChatAudioPlayedStorageKey,
  readChatAudioPlayedMessageIDs,
  writeChatAudioPlayedMessageIDs,
  type ChatAudioPlayedStorage,
} from './chat-audio-played-preference.js';

/** 创建可检查写入内容的同步内存存储。 */
function createStorage(initialValue: string | null = null) {
  // value 保存最后一次写入的 RN 兼容 JSON。
  let value = initialValue;
  /** storage 模拟 localStorage 最小接口。 */
  const storage: ChatAudioPlayedStorage = {
    getItem: () => value,
    setItem: (_key, nextValue) => { value = nextValue; },
  };
  return { storage, readValue: () => value };
}

// 语音已播放偏好保持账号会话隔离和损坏降级。
describe('chat audio played preference', () => {
  it('uses the RN-compatible account and conversation key', () => {
    expect(getChatAudioPlayedStorageKey('u1', 'c1')).toBe('im28.voicePlayed.u1.c1');
  });

  it('deduplicates restored IDs and writes only stable values', () => {
    /** harness 保存可复用存储与最终原始值。 */
    const harness = createStorage(JSON.stringify(['m1', '', 'm1', 'm2']));
    expect(Array.from(readChatAudioPlayedMessageIDs('u1', 'c1', harness.storage)))
      .toEqual(['m1', 'm2']);
    writeChatAudioPlayedMessageIDs(
      'u1',
      'c1',
      new Set(['m2', ' ', 'm3']),
      harness.storage,
    );
    expect(harness.readValue()).toBe(JSON.stringify(['m2', 'm3']));
  });

  it('fails closed when stored JSON or storage access is invalid', () => {
    /** malformed 模拟损坏的旧偏好。 */
    const malformed = createStorage('{bad');
    expect(readChatAudioPlayedMessageIDs('u1', 'c1', malformed.storage).size).toBe(0);
    /** denied 模拟隐私策略拒绝读取与写入。 */
    const denied: ChatAudioPlayedStorage = {
      getItem: () => { throw new Error('denied'); },
      setItem: () => { throw new Error('denied'); },
    };
    expect(readChatAudioPlayedMessageIDs('u1', 'c1', denied).size).toBe(0);
    expect(() => writeChatAudioPlayedMessageIDs('u1', 'c1', new Set(['m1']), denied))
      .not.toThrow();
  });
});
