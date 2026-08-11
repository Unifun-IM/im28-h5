import { describe, expect, it } from 'vitest';

import {
  formatChatMessageSearchDate,
  splitChatMessageSearchText,
} from './chat-message-search-view.js';

// 搜索展示回归锁定 RN 的大小写高亮和本地日期格式。
describe('chat message search view', () => {
  it('不区分大小写高亮全部命中并保留原文', () => {
    expect(splitChatMessageSearchText('Hello hello', 'HELLO')).toEqual([
      { text: 'Hello', highlighted: true },
      { text: ' ', highlighted: false },
      { text: 'hello', highlighted: true },
    ]);
  });

  it('空关键词保留单段正文并格式化秒时间戳', () => {
    expect(splitChatMessageSearchText('聊天记录', '  ')).toEqual([
      { text: '聊天记录', highlighted: false },
    ]);
    /** timestamp 使用本地日期构造避免测试依赖固定时区。 */
    const timestamp = new Date(2026, 7, 11, 12).getTime() / 1000;
    expect(formatChatMessageSearchDate(timestamp)).toBe('2026/8/11');
  });
});
