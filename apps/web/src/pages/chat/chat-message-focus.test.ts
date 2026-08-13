import type { Message, WebIMSync } from '@im28/im-sdk/web';
import { describe, expect, it, vi } from 'vitest';

import {
  buildChatMessageFocusURL,
  readFocusedChatMessageWindow,
} from './chat-message-focus.js';

/** 构造搜索定位所需的最小缓存消息。 */
function createFocusedMessage(overrides: Partial<Message> = {}): Message {
  return {
    clientMsgID: 'target-message',
    conversationID: 'conversation-1',
    senderID: 'user-2',
    direction: 'incoming',
    contentType: 101,
    status: 'received',
    sendTime: 200,
    payload: { text: { text: '目标消息' } },
    ...overrides,
  };
}

// 搜索结果定位回归锁定当前账号读取、会话隔离和时间窗口。
describe('chat message focus', () => {
  it('builds a same-conversation SPA URL from stable identities', () => {
    expect(buildChatMessageFocusURL('conversation/1', 'client 1')).toBe(
      '/conversations/conversation%2F1?messageID=client%201',
    );
    expect(buildChatMessageFocusURL('', 'client-1')).toBeNull();
    expect(buildChatMessageFocusURL('conversation-1', ' ')).toBeNull();
  });

  it('按目标时间恢复同会话缓存窗口', async () => {
    /** target 是搜索结果对应的真实缓存消息。 */
    const target = createFocusedMessage();
    /** getCachedHistory 验证目标时间边界和窗口大小。 */
    const getCachedHistory = vi.fn(async () => [target]);
    /** sync 仅实现定位 helper 允许的本地读取能力。 */
    const sync = {
      getCachedByClientMsgIDs: vi.fn(async () => [target]),
      getCachedHistory,
    } as unknown as WebIMSync['messages'];

    await expect(readFocusedChatMessageWindow(
      sync,
      'conversation-1',
      'target-message',
      40,
    )).resolves.toEqual([target]);
    expect(getCachedHistory).toHaveBeenCalledWith({
      conversationID: 'conversation-1',
      beforeSendTime: 201,
      limit: 40,
    });
  });

  it('拒绝已移到其他会话的缓存目标', async () => {
    /** sync 返回跨会话记录以证明深链 fail-closed。 */
    const sync = {
      getCachedByClientMsgIDs: vi.fn(async () => [
        createFocusedMessage({ conversationID: 'conversation-2' }),
      ]),
      getCachedHistory: vi.fn(),
    } as unknown as WebIMSync['messages'];
    await expect(readFocusedChatMessageWindow(
      sync,
      'conversation-1',
      'target-message',
    )).rejects.toThrow('搜索结果已不在当前聊天记录中');
  });
});
