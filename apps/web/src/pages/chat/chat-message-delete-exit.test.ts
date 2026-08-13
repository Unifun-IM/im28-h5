import type { Message } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import {
  createChatMessageDeleteExitState,
  finishChatMessageDeleteExit,
  getChatMessageDeleteExitWindow,
} from './chat-message-delete-exit.js';

/** 构造删除退场纯规则所需的最小消息。 */
function createMessage(clientMsgID: string, sendTime: number): Message {
  return {
    clientMsgID,
    conversationID: 'conversation-1',
    senderID: 'user-1',
    direction: 'outgoing',
    contentType: 101,
    status: 'sent',
    sendTime,
    payload: { text: { text: clientMsgID } },
  };
}

describe('chat message delete exit', () => {
  it('SQLite 隐藏后只为 SDK 成功项保留冻结行', () => {
    /** beforeDelete 是 newest-first 的删除前窗口。 */
    const beforeDelete = [createMessage('message-3', 3), createMessage('message-2', 2), createMessage('message-1', 1)];
    /** state 只接受真实窗口中存在的成功身份。 */
    const state = createChatMessageDeleteExitState(
      'conversation-1',
      beforeDelete,
      ['message-3', 'message-missing'],
    );
    /** cachedAfterDelete 模拟 SDK 已把成功项标为 deleted_local。 */
    const cachedAfterDelete = [createMessage('message-2', 2), createMessage('message-1', 1)];
    expect(getChatMessageDeleteExitWindow(
      'conversation-1',
      cachedAfterDelete,
      state,
    ).map(message => message.clientMsgID)).toEqual([
      'message-3', 'message-2', 'message-1',
    ]);
    expect(state?.exitingMessageIDs).toEqual(new Set(['message-3']));
  });

  it('partial result 保留失败项并在成功项动画结束后释放快照', () => {
    /** beforeDelete 同时包含成功与失败候选。 */
    const beforeDelete = [createMessage('success', 2), createMessage('failed', 1)];
    /** state 只标记 SDK 返回的成功身份。 */
    const state = createChatMessageDeleteExitState(
      'conversation-1',
      beforeDelete,
      ['success'],
    );
    /** currentWindow 保留 partial-result 中失败的真实行。 */
    const currentWindow = [createMessage('failed', 1)];
    expect(getChatMessageDeleteExitWindow(
      'conversation-1',
      currentWindow,
      state,
    ).map(message => message.clientMsgID)).toEqual(['success', 'failed']);
    expect(finishChatMessageDeleteExit(state, 'success')).toBeNull();
  });

  it('路由切换和无成功结果不复用旧会话窗口', () => {
    /** message 是当前会话唯一可见行。 */
    const message = createMessage('message-1', 1);
    /** state 属于原会话。 */
    const state = createChatMessageDeleteExitState('conversation-1', [message], ['message-1']);
    expect(getChatMessageDeleteExitWindow('conversation-2', [], state)).toEqual([]);
    expect(createChatMessageDeleteExitState('conversation-1', [message], [])).toBeNull();
  });
});
