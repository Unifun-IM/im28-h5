import { describe, expect, it } from 'vitest';

import {
  createGroupApplicationChatRouteState,
  createGroupApplicationManagementRouteState,
  resolveGroupApplicationBackTo,
} from './group-application-route.js';

// 群申请来源路由只允许回到本地已知页面。
describe('group application route', () => {
  it('从群管理进入时返回原会话管理页', () => {
    /** state 使用显式来源而非任意 URL。 */
    const state = createGroupApplicationManagementRouteState('group/conversation');
    expect(resolveGroupApplicationBackTo(state)).toBe('/conversations/group%2Fconversation/settings/manage');
  });

  it('从聊天头部进入时返回原群聊', () => {
    /** state 只保存稳定会话身份，不携带页面正文。 */
    const state = createGroupApplicationChatRouteState('chat/conversation');
    expect(resolveGroupApplicationBackTo(state)).toBe('/conversations/chat%2Fconversation');
  });

  it('未知或畸形状态回退群聊验证页', () => {
    expect(resolveGroupApplicationBackTo(null)).toBe('/contacts/verifications/group');
    expect(resolveGroupApplicationBackTo({ source: 'group-management', conversationID: ' ' }))
      .toBe('/contacts/verifications/group');
    expect(resolveGroupApplicationBackTo({ source: 'external', conversationID: 'c1' }))
      .toBe('/contacts/verifications/group');
  });
});
