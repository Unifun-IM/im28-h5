import { describe, expect, it } from 'vitest';

import {
  CHAT_UNREAD_READ_IDLE_MS,
  canReportChatVisibleUnread,
  isChatUnreadAtLatestEdge,
  isChatUnreadRowReadable,
  shouldChatFollowLatest,
} from './chat-unread-read-gate.js';

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
});
