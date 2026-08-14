import type { Message, WebIMSync } from '@im28/im-sdk/web';
import { describe, expect, it, vi } from 'vitest';

import {
  buildChatMessageFocusURL,
  CHAT_MESSAGE_FOCUS_HIGHLIGHT_MS,
  focusChatMessageRow,
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

  it('在没有 Web Animations API 时仍按 RN 时长高亮目标行', () => {
    vi.useFakeTimers();
    /** classes 模拟目标行的浏览器 classList。 */
    const classes = new Set<string>();
    /** target 不提供 animate，锁定轻量浏览器的兼容路径。 */
    const target = {
      dataset: { clientMessageId: 'target-message' },
      scrollIntoView: vi.fn(),
      classList: {
        add: (value: string) => classes.add(value),
        remove: (value: string) => classes.delete(value),
      },
    } as unknown as HTMLElement;
    /** container 只暴露消息行查询能力。 */
    const container = {
      querySelectorAll: vi.fn(() => [target]),
    } as unknown as HTMLElement;

    expect(focusChatMessageRow(container, 'target-message')).toBe(true);
    expect(classes.has('is-focus-highlighted')).toBe(true);
    expect(target.scrollIntoView).toHaveBeenCalledWith({ block: 'center', behavior: 'smooth' });
    vi.advanceTimersByTime(CHAT_MESSAGE_FOCUS_HIGHLIGHT_MS);
    expect(classes.has('is-focus-highlighted')).toBe(false);
    vi.useRealTimers();
  });
});
