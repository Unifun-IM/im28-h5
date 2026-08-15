import { describe, expect, it } from 'vitest';

import chatPageSource from './ChatPage.tsx?raw';
import chatSurfaceSource from './ChatPageSurface.tsx?raw';
import navigationSource from './useChatPageNavigationActions.ts?raw';

/** 群名片必须复用 RN 的实时入群判断和 shared 会话打开能力。 */
describe('chat group card action', () => {
  it('实时刷新已加入群并在命中后直达群会话', () => {
    expect(chatPageSource).toContain('useChatPageNavigationActions({');
    expect(chatSurfaceSource).toContain('navigationActions.openCard(view)');
    expect(navigationSource).toContain('sync.groups.sync({ pageSize: 100 })');
    expect(navigationSource).toContain('sync.conversations.openGroup({');
    expect(navigationSource).toContain('conversationID: joinedGroup.conversationID');
    expect(navigationSource).toContain('createGroupCardApplyRouteState(conversationID)');
    expect(navigationSource).not.toContain('/settings/profile`,\n          { state: createChatGroupProfileRouteState(joinedGroup.conversationID) }');
  });
});
