import { describe, expect, it } from 'vitest';

import contactSearchPageSource from '../contacts/ContactSearchPage.tsx?raw';
import groupApplyPageSource from '../qr/GroupQRCodeApplyPage.tsx?raw';
import { buildConversationRoute } from '../conversations/conversation-route.js';
import createGroupPageSource from './CreateGroupPage.tsx?raw';
import groupSearchPageSource from './GroupSearchPage.tsx?raw';
import {
  createGroupCardApplyRouteState,
  createGroupApplyReturnState,
  readGroupApplyRouteState,
  readGroupSearchCreateState,
  readGroupSearchKeyword,
} from './group-search-route.js';

/** 群搜索 SPA state 必须拒绝任意路由和非稳定身份。 */
describe('group search route state', () => {
  it('恢复去重选择、合法入口和搜索词', () => {
    /** state 模拟从联系人页进入建群后继续查找群聊。 */
    const state = { selectedUserIDs: [' u1 ', 'u1', '', 3, 'u2'], backHref: '/contacts', searchKeyword: ' 群聊 ' };
    expect(readGroupSearchCreateState(state)).toEqual({ selectedUserIDs: ['u1', 'u2'], backHref: '/contacts' });
    expect(readGroupSearchKeyword(state)).toBe('群聊');
  });

  it('只接受 search 申请来源并固定返回查群页', () => {
    /** result 不能透传外部 backHref。 */
    const result = readGroupApplyRouteState({
      sourceType: 'search', backHref: 'https://example.com', searchKeyword: 'g1',
      createState: { selectedUserIDs: ['u1'], backHref: '/contacts' },
    });
    expect(result).toEqual({
      sourceType: 'search', backHref: '/groups/search', searchKeyword: 'g1',
      searchBackHref: '/contacts',
      createState: { selectedUserIDs: ['u1'], backHref: '/contacts' },
    });
    expect(readGroupApplyRouteState({ sourceType: 'other' }).sourceType).toBe('qrcode');
  });

  it('允许联系人搜索作为群申请的受控返回地址', () => {
    /** routeState 保留群搜索关键词并限定联系人搜索页签。 */
    const routeState = readGroupApplyRouteState({
      sourceType: 'search',
      backHref: '/contacts/search',
      searchKeyword: '群聊',
      searchBackHref: '/conversations/archived',
    });
    expect(routeState).toMatchObject({
      sourceType: 'search',
      backHref: '/contacts/search',
      searchKeyword: '群聊',
      searchBackHref: '/conversations/archived',
    });
    expect(createGroupApplyReturnState(routeState)).toMatchObject({
      searchKeyword: '群聊',
      serverTab: 'groups',
      searchBackHref: '/conversations/archived',
    });
  });

  it('群名片申请只恢复来源聊天且拒绝额外路径', () => {
    /** cardState 对会话身份编码后形成唯一受控返回地址。 */
    const cardState = createGroupCardApplyRouteState('group/conversation');
    expect(cardState).toMatchObject({
      sourceType: 'card',
      backHref: '/conversations/group%2Fconversation',
    });
    expect(readGroupApplyRouteState(cardState)).toEqual(cardState);
    expect(readGroupApplyRouteState({
      sourceType: 'card',
      backHref: '/conversations/group/settings',
    }).sourceType).toBe('qrcode');
    expect(createGroupApplyReturnState(cardState)).toBeUndefined();
  });

  it('建群搜索流程内部页面只替换同一个历史项', () => {
    expect(createGroupPageSource.match(/to="\/groups\/search"/g)).toHaveLength(1);
    expect(createGroupPageSource).toContain('replace state={{ selectedUserIDs: [...selectedUserIDs], backHref }}');
    expect(createGroupPageSource).toContain("navigate('/groups/search', {");
    expect(createGroupPageSource).toContain('replace: true,');
    expect(groupSearchPageSource).toContain("navigate('/groups/create', { replace: true, state: createState });");
    expect(groupSearchPageSource).toContain("navigate(`/groups/${encodeURIComponent(group.groupID)}/apply`, {");
    expect(groupSearchPageSource).toContain('replace: true,');
    expect(contactSearchPageSource).toContain('replace: true,');
    expect(groupApplyPageSource).toContain("replace: routeState.sourceType !== 'qrcode'");
  });

  it('已加入群复用唯一会话路由并关闭查群流程', () => {
    expect(buildConversationRoute('group/group-1', true)).toEqual({
      href: '/conversations/group%2Fgroup-1',
      replace: true,
    });
    expect(groupSearchPageSource).toContain('buildConversationRoute(conversation.conversationID, true)');
    expect(groupSearchPageSource).toContain('navigate(route.href, { replace: route.replace });');
    expect(groupApplyPageSource).toContain('runtime.getSync().conversations.openGroup({');
    expect(groupApplyPageSource).toContain('groupID: group.groupID,');
    expect(groupApplyPageSource).toContain("buildConversationRoute(conversation.conversationID, routeState.sourceType !== 'qrcode')");
    expect(groupApplyPageSource).toContain('navigate(route.href, { replace: route.replace });');
    expect(groupApplyPageSource).not.toContain('runtime.getSync().groups.listCached()');
    expect(groupApplyPageSource).not.toContain('runtime.getSync().groups.sync()');
  });
});
