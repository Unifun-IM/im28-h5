import type { IMInitialUnreadNavigation, Message } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import { buildChatMessageListEntries } from './chat-message-list-view.js';

/** 构造列表条目测试需要的最小消息。 */
function createMessage(id: string, senderID = 'peer'): Message {
  return {
    clientMsgID: id,
    serverMsgID: `server-${id}`,
    conversationID: 'c1',
    senderID,
    direction: 'incoming',
    contentType: 101,
    status: 'received',
    sendTime: 1_723_456_789,
    payload: { text: { text: id } },
  };
}

// 消息列表条目锁定分割线位置和连续气泡断点。
describe('chat message list view', () => {
  it('inserts the unread divider before the shared boundary message', () => {
    /** messages 模拟 Repository newest-first 输出。 */
    const messages = [createMessage('new'), createMessage('old')];
    /** navigation 使用服务端稳定身份定位首条未读。 */
    const navigation: IMInitialUnreadNavigation = {
      unreadMessageIDs: ['server-new'],
      firstUnreadMessageID: 'server-new',
      lastReadMessageID: 'server-old',
    };
    /** entries 排除日期行后检查消息与分割线顺序。 */
    const entries = buildChatMessageListEntries(messages, true, '', navigation)
      .filter(entry => entry.kind !== 'date');
    expect(entries.map(entry => entry.kind)).toEqual([
      'message',
      'unread',
      'message',
    ]);
    expect(entries[0]).toMatchObject({ kind: 'message', groupPosition: 'single' });
    expect(entries[2]).toMatchObject({ kind: 'message', groupPosition: 'single' });
  });
});
