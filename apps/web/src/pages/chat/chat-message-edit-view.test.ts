import type { Message } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import {
  formatChatMessageTimeText,
  getChatMessageEditDocument,
} from './chat-message-edit-view.js';

/** 创建编辑展示测试使用的文本消息。 */
function createMessage(overrides: Partial<Message> = {}): Message {
  return {
    clientMsgID: 'client-edit',
    serverMsgID: 'server-edit',
    conversationID: 'si_peer',
    senderID: 'self',
    direction: 'outgoing',
    contentType: 101,
    status: 'sent',
    sendTime: new Date(2026, 7, 11, 14, 20).getTime(),
    payload: { text: { text: '原始文本' } },
    ...overrides,
  };
}

// 编辑展示只读取 shared 消息实体，不拥有第二套 payload 规则。
describe('chat message edit view', () => {
  it('restores text and entities into the composer document', () => {
    // message 保留一个合法的 preset entity。
    const message = createMessage({
      payload: { text: { text: '文本😨' } },
      entities: [{
        type: 'preset_emoji',
        offset: 2,
        length: 2,
        packID: 'im28-preset-v1',
        presetID: 'fearful-face',
      }],
    });
    expect(getChatMessageEditDocument(message)).toEqual({
      text: '文本😨',
      entities: message.entities,
    });
  });

  it('uses the RN edited time label and ignores malformed metadata', () => {
    // editedAt 使用本地毫秒时间戳。
    const editedAt = new Date(2026, 7, 11, 15, 35).getTime();
    expect(formatChatMessageTimeText(createMessage({
      localEx: JSON.stringify({ editedAt }),
    }))).toBe('已编辑 15:35');
    expect(formatChatMessageTimeText(createMessage({ localEx: '{bad' }))).toBe('14:20');
  });
});
