import { describe, expect, it } from 'vitest';

import { buildConversationRoute } from './conversation-route.js';

/** 会话入口必须共用稳定身份校验并显式传入历史策略。 */
describe('conversation route', () => {
  it('编码规范会话身份并替换当前搜索流程页', () => {
    expect(buildConversationRoute(' sg/group 28 ', true)).toEqual({
      href: '/conversations/sg%2Fgroup%2028',
      replace: true,
    });
    expect(buildConversationRoute(' ', true)).toBeNull();
    expect(buildConversationRoute(null, false)).toBeNull();
  });

  it('保留非搜索入口的 push 历史策略', () => {
    expect(buildConversationRoute('single-user-1', false)).toEqual({
      href: '/conversations/single-user-1',
      replace: false,
    });
  });
});
