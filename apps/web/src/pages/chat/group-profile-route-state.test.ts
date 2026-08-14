import { describe, expect, it } from 'vitest';

import {
  createChatGroupProfileRouteState,
  resolveGroupProfileBackHref,
} from './group-profile-route-state.js';

// 群资料返回链只信任当前会话的显式聊天来源。
describe('group profile route state', () => {
  it('聊天头部来源返回当前群聊', () => {
    /** state 模拟标题区产生的最小受控上下文。 */
    const state = createChatGroupProfileRouteState('conversation/1');
    expect(resolveGroupProfileBackHref(state, 'conversation/1'))
      .toBe('/conversations/conversation%2F1');
  });

  it('缺失、未知或跨会话来源保持返回群设置', () => {
    expect(resolveGroupProfileBackHref(null, 'c1')).toBe('/conversations/c1/settings');
    expect(resolveGroupProfileBackHref({ source: 'chat', conversationID: 'c2' }, 'c1'))
      .toBe('/conversations/c1/settings');
    expect(resolveGroupProfileBackHref({ source: 'external', conversationID: 'c1' }, 'c1'))
      .toBe('/conversations/c1/settings');
  });
});
