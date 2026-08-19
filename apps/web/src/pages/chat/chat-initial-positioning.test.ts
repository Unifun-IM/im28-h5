import { describe, expect, it } from 'vitest';

import listSource from './ChatMessageList.tsx?raw';
import pageSource from './ChatPage.tsx?raw';
import navigationSource from './useChatUnreadNavigation.ts?raw';
import { isChatInitialPositionPending } from './chat-message-list-view.js';

/** 聊天首帧定位回归锁定可见性门禁和同帧滚动时序。 */
describe('chat initial positioning', () => {
  /** 只隐藏尚未锚定的真实消息，空窗口仍允许加载骨架可见。 */
  it('hides a populated message stack until its initial anchor is ready', () => {
    expect(isChatInitialPositionPending(50, false)).toBe(true);
    expect(isChatInitialPositionPending(50, true)).toBe(false);
    expect(isChatInitialPositionPending(0, false)).toBe(false);
    expect(listSource).toContain('isChatInitialPositionPending(messages.length, initialPositioned)');
  });

  /** 首次未读边界必须在 layout effect 中用同一快照定位，不得延迟到下一帧。 */
  it('positions the initial unread snapshot without a deferred animation frame', () => {
    expect(navigationSource).toContain(
      'positionInitialUnreadBoundary(container, nextNavigation)',
    );
    expect(navigationSource).not.toContain('requestAnimationFrame');
    expect(pageSource).toContain('(messages.length > 0 || !loading)');
  });
});
