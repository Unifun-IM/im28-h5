import { describe, expect, it } from 'vitest';

import {
  buildChatForwardTargetRoute,
  createChatForwardRouteState,
  readChatForwardLocationState,
} from './chat-forward-route.js';

// 路由状态回归确保消息正文不会成为跨页面契约。
describe('chat forward route state', () => {
  it('normalizes stable IDs and reads the wrapped state', () => {
    // forward 是页面唯一允许写入 location.state 的模型。
    const forward = createChatForwardRouteState({
      sourceConversationID: ' source/chat ',
      sourceConversationTitle: ' 测试会话 ',
      sourceClientMsgIDs: [' message-2 ', 'message-1', 'message-2'],
    });
    expect(forward).toEqual({
      kind: 'chat-forward',
      sourceConversationID: 'source/chat',
      sourceConversationTitle: '测试会话',
      sourceClientMsgIDs: ['message-2', 'message-1'],
    });
    expect(readChatForwardLocationState({ forward })).toEqual(forward);
    expect(buildChatForwardTargetRoute('source/chat')).toBe(
      '/conversations/source%2Fchat/forward',
    );
  });

  it('rejects refreshed, body-shaped, empty, and oversized states', () => {
    expect(readChatForwardLocationState(null)).toBeNull();
    expect(readChatForwardLocationState({ messages: [{ payload: 'body' }] })).toBeNull();
    expect(readChatForwardLocationState({
      forward: {
        kind: 'chat-forward',
        sourceConversationID: 'source',
        sourceConversationTitle: 'source',
        sourceClientMsgIDs: ['message'],
        messages: [{ payload: 'body' }],
      },
    })).toBeNull();
    expect(readChatForwardLocationState({
      forward: {
        kind: 'chat-forward',
        sourceConversationID: 'source',
        sourceConversationTitle: 'source',
        sourceClientMsgIDs: [],
      },
    })).toBeNull();
    expect(readChatForwardLocationState({
      forward: {
        kind: 'chat-forward',
        sourceConversationID: 'source',
        sourceConversationTitle: 'source',
        sourceClientMsgIDs: Array.from({ length: 101 }, (_, index) => `id-${index}`),
      },
    })).toBeNull();
  });
});
