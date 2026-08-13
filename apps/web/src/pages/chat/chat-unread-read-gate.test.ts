import { describe, expect, it } from 'vitest';

import { canReportChatVisibleUnread } from './chat-unread-read-gate.js';

// 可见未读门禁锁定短列表、初始长列表和交互放行。
describe('chat unread read gate', () => {
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
});
