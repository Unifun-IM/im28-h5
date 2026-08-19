import { describe, expect, it } from 'vitest';

import {
  CHAT_UNREAD_READ_IDLE_MS,
  canReportChatVisibleUnread,
  getChatLatestMessageDelta,
  isChatUnreadAtLatestEdge,
  isChatUnreadRowReadable,
  shouldChatFollowLatest,
} from './chat-unread-read-gate.js';
import type { Message } from '@im28/im-sdk/web';

/** 构造窗口增量测试所需的最小消息实体。 */
function createMessage(clientMsgID: string, direction: Message['direction']): Message {
  return {
    clientMsgID,
    conversationID: 'group-1',
    senderID: direction === 'outgoing' ? 'self' : 'peer',
    direction,
    contentType: 101,
    status: direction === 'outgoing' ? 'sent' : 'received',
    sendTime: 1,
    payload: {},
  };
}

// 可见未读门禁锁定短列表、初始长列表和交互放行。
describe('chat unread read gate', () => {
  it('treats fitted content and the 40px bottom tolerance as the latest edge', () => {
    expect(isChatUnreadAtLatestEdge({
      contentHeight: 400,
      viewportHeight: 600,
      scrollTop: 0,
    })).toBe(true);
    expect(isChatUnreadAtLatestEdge({
      contentHeight: 900,
      viewportHeight: 600,
      scrollTop: 260,
    })).toBe(true);
    expect(isChatUnreadAtLatestEdge({
      contentHeight: 900,
      viewportHeight: 600,
      scrollTop: 259,
    })).toBe(false);
  });

  it('includes every unread row at the latest edge and keeps 80% elsewhere', () => {
    expect(isChatUnreadRowReadable({
      atLatestEdge: true,
      visibleRatio: 0,
    })).toBe(true);
    expect(isChatUnreadRowReadable({
      atLatestEdge: false,
      visibleRatio: 0.79,
    })).toBe(false);
    expect(isChatUnreadRowReadable({
      atLatestEdge: false,
      visibleRatio: 0.8,
    })).toBe(true);
  });

  it('allows only measured short content before user interaction', () => {
    expect(canReportChatVisibleUnread({
      positioned: true,
      contentHeight: 400,
      viewportHeight: 600,
      userInteracted: false,
      programmaticReadAllowed: false,
    })).toBe(true);
    expect(canReportChatVisibleUnread({
      positioned: true,
      contentHeight: 900,
      viewportHeight: 600,
      userInteracted: false,
      programmaticReadAllowed: false,
    })).toBe(false);
  });

  it('allows a long list after user scroll or an explicit latest action', () => {
    /** base 表示已经完成初始定位的长消息列表。 */
    const base = {
      positioned: true,
      contentHeight: 900,
      viewportHeight: 600,
    };
    expect(canReportChatVisibleUnread({
      ...base,
      userInteracted: true,
      programmaticReadAllowed: false,
    })).toBe(true);
    expect(canReportChatVisibleUnread({
      ...base,
      userInteracted: false,
      programmaticReadAllowed: true,
    })).toBe(true);
  });

  it('rejects unpositioned or unmeasured content', () => {
    expect(canReportChatVisibleUnread({
      positioned: false,
      contentHeight: 400,
      viewportHeight: 600,
      userInteracted: true,
      programmaticReadAllowed: true,
    })).toBe(false);
    expect(canReportChatVisibleUnread({
      positioned: true,
      contentHeight: 0,
      viewportHeight: 600,
      userInteracted: true,
      programmaticReadAllowed: false,
    })).toBe(false);
  });

  it('waits for a bounded scroll idle window before reporting read progress', () => {
    expect(CHAT_UNREAD_READ_IDLE_MS).toBeGreaterThanOrEqual(100);
    expect(CHAT_UNREAD_READ_IDLE_MS).toBeLessThanOrEqual(300);
  });

  it('forces latest after a local send even when the old viewport is not latest', () => {
    expect(shouldChatFollowLatest(false, true)).toBe(true);
    expect(shouldChatFollowLatest(true, false)).toBe(true);
    expect(shouldChatFollowLatest(false, false)).toBe(false);
  });

  it('classifies only newest additions and ignores older history pagination', () => {
    /** current 表示更新前 newest-first 的稳定窗口。 */
    const current = [
      createMessage('current-2', 'incoming'),
      createMessage('current-1', 'outgoing'),
    ];
    expect(getChatLatestMessageDelta(current, [
      createMessage('new-incoming', 'incoming'),
      ...current,
    ])).toEqual({ hasIncoming: true, hasOutgoing: false });
    expect(getChatLatestMessageDelta(current, [
      createMessage('new-outgoing', 'outgoing'),
      ...current,
    ])).toEqual({ hasIncoming: false, hasOutgoing: true });
    expect(getChatLatestMessageDelta(current, [
      ...current,
      createMessage('older', 'incoming'),
    ])).toEqual({ hasIncoming: false, hasOutgoing: false });
  });

  it('does not treat status replacement or a completely different window as new', () => {
    /** current 是发送状态更新前的同一 client identity。 */
    const current = [createMessage('same-message', 'outgoing')];
    expect(getChatLatestMessageDelta(current, [
      { ...current[0]!, status: 'failed' },
    ])).toEqual({ hasIncoming: false, hasOutgoing: false });
    expect(getChatLatestMessageDelta(current, [
      createMessage('focused-window', 'incoming'),
    ])).toEqual({ hasIncoming: false, hasOutgoing: false });
  });
});
