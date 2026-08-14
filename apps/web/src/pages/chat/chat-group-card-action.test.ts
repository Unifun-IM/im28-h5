import { describe, expect, it } from 'vitest';

import chatPageSource from './ChatPage.tsx?raw';

/** 群名片必须复用 RN 的实时入群判断和 shared 会话打开能力。 */
describe('chat group card action', () => {
  it('实时刷新已加入群并在命中后直达群会话', () => {
    expect(chatPageSource).toContain('sync.groups.sync({ pageSize: 100 })');
    expect(chatPageSource).toContain('sync.conversations.openGroup({');
    expect(chatPageSource).toContain('conversationID: joinedGroup.conversationID');
    expect(chatPageSource).toContain('createGroupCardApplyRouteState(conversationID)');
    expect(chatPageSource).not.toContain('/settings/profile`,\n          { state: createChatGroupProfileRouteState(joinedGroup.conversationID) }');
  });
});
