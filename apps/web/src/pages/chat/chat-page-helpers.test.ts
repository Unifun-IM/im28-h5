import type { Message } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import { pullAndReadChatHistory } from './chat-page-helpers.js';

// 首次聊天加载必须以 pull 后的 SQLite 快照作为最终页面状态。
describe('chat page history refresh', () => {
  it('waits for pull persistence before reading the current cache', async () => {
    // calls 记录 facade 调用顺序，防止远端返回值直接覆盖并发本地写入。
    const calls: string[] = [];
    // cachedMessage 代表 pull 期间已经写入 SQLite 的并发发送消息。
    const cachedMessage = { clientMsgID: 'concurrent-message' } as Message;
    // sync 使用最小可控 facade 验证编排，不模拟 Gateway 成功。
    const sync = {
      async pullHistoryPage() {
        calls.push('pull');
        return { messages: [], hasMore: true, nextSeq: '9' };
      },
      async getCachedHistory() {
        calls.push('cache');
        return [cachedMessage];
      },
    };

    await expect(pullAndReadChatHistory(sync, {
      conversationID: 'conversation-1',
      fromSeq: '10',
      limit: 50,
    })).resolves.toEqual({
      messages: [cachedMessage],
      hasMore: true,
      nextCursor: '9',
    });
    expect(calls).toEqual(['pull', 'cache']);
  });
});
