import { describe, expect, it } from 'vitest';

import archivedPageSource from './ArchivedConversationsPage.tsx?raw';
import conversationPageSource from './ConversationsPage.tsx?raw';
import presenceHookSource from './useConversationPresence.ts?raw';

/** 会话 presence wiring 必须保持 shared owner、实时更新和 RN 刷新语义。 */
describe('conversation presence wiring contract', () => {
  /** 页面只消费 shared facade，且分钟轮询与下拉刷新都查询真实状态。 */
  it('uses one shared observation with realtime, polling and manual refresh', () => {
    expect(presenceHookSource).toContain('runtime.getSync().presence.observe');
    expect(presenceHookSource).toContain('runtime.getSync().presence.list');
    expect(presenceHookSource).toContain('CONVERSATION_PRESENCE_REFRESH_INTERVAL_MS = 60_000');
    expect(conversationPageSource).toContain('await refreshPresence()');
    expect(archivedPageSource).toContain('await refreshPresence()');
  });
});
