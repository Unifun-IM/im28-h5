import { describe, expect, it } from 'vitest';

import {
  getChatHistoryRestoredScrollTop,
  getChatStickyDateLabel,
  shouldLoadOlderChatHistory,
} from './chat-history-scroll.js';

// 历史前插补偿规则保证加载旧页后用户视口不跳动。
describe('chat history scroll', () => {
  it('adds only the positive content height delta to the previous position', () => {
    expect(getChatHistoryRestoredScrollTop(20, 800, 1200)).toBe(420);
    expect(getChatHistoryRestoredScrollTop(20, 1200, 1100)).toBe(20);
    expect(getChatHistoryRestoredScrollTop(-10, 100, 150)).toBe(40);
  });

  it('uses the last date separator that crossed the list top edge', () => {
    /** separator 构造最小 DOM 几何，避免测试依赖真实浏览器布局引擎。 */
    const separator = (top: number, textContent: string) => ({
      textContent,
      getBoundingClientRect: () => ({ top }),
    });
    /** container 模拟第二个日期已进入消息视口顶部的列表。 */
    const container = {
      getBoundingClientRect: () => ({ top: 100 }),
      querySelectorAll: () => [separator(50, '昨天'), separator(105, '今天'), separator(180, '明天')],
    } as unknown as HTMLElement;
    expect(getChatStickyDateLabel(container)).toBe('今天');
  });

  it('loads older messages only after a user gesture reaches the top edge', () => {
    /** base 表示一个仍有历史且当前空闲的可分页列表。 */
    const base = {
      enabled: true,
      hasUserInteracted: true,
      hasMore: true,
      loading: false,
      scrollTop: 48,
    };
    expect(shouldLoadOlderChatHistory(base)).toBe(true);
    expect(shouldLoadOlderChatHistory({ ...base, hasUserInteracted: false })).toBe(false);
    expect(shouldLoadOlderChatHistory({ ...base, loading: true })).toBe(false);
    expect(shouldLoadOlderChatHistory({ ...base, scrollTop: 49 })).toBe(false);
  });
});
