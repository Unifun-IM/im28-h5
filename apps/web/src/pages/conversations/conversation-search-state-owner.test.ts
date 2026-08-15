import { describe, expect, it } from 'vitest';

import pageSource from './ConversationSearchPage.tsx?raw';
import stateHookSource from './useConversationSearchState.ts?raw';

/** 首页搜索必须由单一状态 hook 拥有缓存、竞态、分页和历史偏好。 */
describe('conversation search state owner contract', () => {
  /** 页面只保留 Router、手势和 presentation，不直调 cache 或 preference。 */
  it('keeps search orchestration out of the page component', () => {
    expect(pageSource).toContain('useConversationSearchState({ sync })');
    expect(pageSource).not.toContain('searchCached({');
    expect(pageSource).not.toContain('localStorage');
    expect(pageSource).not.toContain('isCurrentInteractionRequest');
    expect(stateHookSource).toContain('sync.messages.searchCached({');
    expect(stateHookSource).toContain('sync.conversations.listCachedItems({ limit: 500 })');
    expect(stateHookSource).toContain('isCurrentInteractionRequest');
    expect(stateHookSource).toContain('CONVERSATION_SEARCH_HISTORY_KEY');
  });
});
