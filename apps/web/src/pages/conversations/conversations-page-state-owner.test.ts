import { describe, expect, it } from 'vitest';

import pageSource from './ConversationsPage.tsx?raw';
import stateHookSource from './useConversationsPageState.ts?raw';

/** 普通会话页必须把缓存和刷新链交给单一页面状态 owner。 */
describe('conversations page state owner contract', () => {
  /** 页面只消费 hook，SQLite、同步和 realtime 重读留在状态 owner。 */
  it('keeps cache-first and refresh orchestration out of the page component', () => {
    expect(pageSource).toContain('useConversationsPageState({');
    expect(pageSource).not.toContain('listCachedItems({');
    expect(pageSource).not.toContain('syncArchived()');
    expect(stateHookSource).toContain('await reloadCachedConversations()');
    expect(stateHookSource).toContain('sync.conversations.sync({ forceFullSnapshot: true, pageSize: 100 })');
    expect(stateHookSource).not.toContain('await sync.conversations.sync()');
    expect(stateHookSource).toContain('sync.conversations.syncArchived({ pageSize: 100 })');
    expect(stateHookSource).toContain('dataVersion');
  });

  /** 会话页同时接入触摸和 PC 鼠标适配，但仍只调用状态 owner 的刷新动作。 */
  it('wires touch and mouse pull gestures to the same page state refresh', () => {
    expect(pageSource).toContain('onTouchStart={pullRefresh.onTouchStart}');
    expect(pageSource).toContain('onPointerDown={pullRefresh.onPointerDown}');
    expect(pageSource).toContain('onPointerUp={pullRefresh.onPointerUp}');
    expect(pageSource).toContain('onRefresh: pageState.refreshConversations');
  });
});
