import type { Message, WebIMGroupMember } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import { getChatMessageView } from './chat-message-view.js';
import {
  canQuoteChatMessage,
  getChatQuoteSourceMessageIDs,
  getChatQuoteComposerView,
  matchesChatMessageStableID,
  resolveChatQuoteSource,
} from './chat-quote-view.js';

/** 构造引用来源窗口中的真实 shared Message。 */
function createQuoteSource(overrides: Partial<Message> = {}): Message {
  return {
    clientMsgID: 'source-client',
    serverMsgID: 'source-server',
    conversationID: 'conversation-1',
    senderID: 'peer-1',
    direction: 'incoming',
    contentType: 101,
    status: 'received',
    sendTime: 1,
    payload: { text: { text: '来源正文' } },
    ...overrides,
  };
}

// 引用 view 只解析当前真实缓存窗口，不猜测窗口外来源身份。
describe('chat quote view', () => {
  it('resolves server/client identity and builds the RN composer preview', () => {
    // source 是当前窗口内可跳转的真实来源。
    const source = createQuoteSource();
    expect(resolveChatQuoteSource([source], 'source-server', false)).toMatchObject({
      message: source,
      label: 'peer-1',
      text: '来源正文',
      deleted: false,
    });
    expect(resolveChatQuoteSource([source], 'source-client', false)).toMatchObject({
      message: source,
    });
    expect(getChatQuoteComposerView(source, false)).toEqual({
      label: 'peer-1',
      text: '来源正文',
    });
  });

  it('marks deleted sources and leaves out-of-window identity unresolved', () => {
    // deletedSource 保留稳定身份但禁止内容跳转。
    const deletedSource = createQuoteSource({ status: 'revoked' });
    expect(
      resolveChatQuoteSource([deletedSource], 'source-server', false),
    ).toMatchObject({ text: '引用的内容已删除', deleted: true });
    expect(resolveChatQuoteSource([], 'source-server', false)).toBeNull();
    expect(resolveChatQuoteSource(
      [],
      'source-server',
      false,
      new Map(),
      new Set(['source-server']),
    )).toEqual({ label: '', text: '引用的内容已删除', deleted: true });
  });

  it('resolves the shared group display name and stable identities', () => {
    /** member 保留备注、群昵称和公开昵称的分字段事实。 */
    const member = {
      userID: 'peer-1',
      remark: '好友备注',
      groupNickname: '群内昵称',
      nickname: '公开昵称',
    } as WebIMGroupMember;
    /** source 是按 server ID 命中的当前账号来源。 */
    const source = createQuoteSource();
    expect(resolveChatQuoteSource(
      [source],
      'source-server',
      true,
      new Map([['peer-1', member]]),
    )).toMatchObject({ label: '好友备注', text: '来源正文' });
    expect(matchesChatMessageStableID(source, 'source-client')).toBe(true);
    expect(matchesChatMessageStableID(source, 'source-server')).toBe(true);
  });

  it('collects unique type 114 source identities', () => {
    /** quoteMessages 混合重复引用和普通消息。 */
    const quoteMessages = [
      createQuoteSource({ contentType: 114, payload: { quote: { msg_id: 'source-1' } } }),
      createQuoteSource({ clientMsgID: 'quote-2', contentType: 114, payload: { quote: { msg_id: 'source-1' } } }),
      createQuoteSource({ clientMsgID: 'quote-3', contentType: 114, payload: { quote: { msg_id: 'source-2' } } }),
      createQuoteSource({ clientMsgID: 'text-1' }),
    ];
    expect(getChatQuoteSourceMessageIDs(quoteMessages)).toEqual(['source-1', 'source-2']);
  });

  it('allows normal bubbles and rejects revoked/system messages', () => {
    // sourceView 是普通文本的可引用投影。
    const source = createQuoteSource();
    // system 使用 RN typing system content type。
    const system = createQuoteSource({ contentType: 113 });
    expect(canQuoteChatMessage(source, getChatMessageView(source, false))).toBe(true);
    expect(canQuoteChatMessage(system, getChatMessageView(system, false))).toBe(false);
    expect(
      canQuoteChatMessage(
        createQuoteSource({ status: 'revoked' }),
        getChatMessageView(createQuoteSource({ status: 'revoked' }), false),
      ),
    ).toBe(false);
  });
});
