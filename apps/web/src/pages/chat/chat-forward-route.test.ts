import { describe, expect, it } from 'vitest';

import {
  createChatForwardRouteState,
  createChatForwardCompatibilityDestination,
  createChatForwardPickerLocationState,
  readChatForwardPickerLocationState,
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

  it('wraps a validated legacy selector state without accepting message bodies', () => {
    // forward 只包含来源会话与消息稳定 ID。
    const forward = createChatForwardRouteState({
      sourceConversationID: 'source-chat',
      sourceConversationTitle: '来源会话',
      sourceClientMsgIDs: ['message-1'],
    });
    expect(readChatForwardPickerLocationState(
      createChatForwardPickerLocationState(forward),
    )).toEqual(forward);
    expect(readChatForwardPickerLocationState({
      forwardPicker: { ...forward, messages: [{ text: '不允许' }] },
    })).toBeNull();
  });

  it('redirects the legacy route to the same chat and drops mismatched source state', () => {
    // forward 是旧选择页仍可能留在 history 中的稳定状态。
    const forward = createChatForwardRouteState({
      sourceConversationID: 'chat/one',
      sourceConversationTitle: '来源会话',
      sourceClientMsgIDs: ['message-1'],
    });
    expect(createChatForwardCompatibilityDestination('chat/one', { forward })).toEqual({
      pathname: '/conversations/chat%2Fone',
      state: { forwardPicker: forward },
    });
    expect(createChatForwardCompatibilityDestination('chat-two', { forward })).toEqual({
      pathname: '/conversations/chat-two',
      state: null,
    });
    expect(createChatForwardCompatibilityDestination(' chat-two ', null)).toEqual({
      pathname: '/conversations/chat-two',
      state: null,
    });
  });
});
